import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = req.headers.get("x-admin-password");
  return (
    (!cronSecret || authHeader === `Bearer ${cronSecret}`) ||
    (!!process.env.ADMIN_PASSWORD && adminPassword === process.env.ADMIN_PASSWORD)
  );
}

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      closeList();
      out.push(`<h2 style="color:#c8741e;margin:24px 0 10px;font-size:22px">${line.slice(3)}</h2>`);
    } else if (line.startsWith("### ")) {
      closeList();
      out.push(`<h3 style="color:#3d2b1a;margin:18px 0 8px;font-size:18px">${line.slice(4)}</h3>`);
    } else if (line.startsWith("- ")) {
      if (inOl) { out.push("</ol>"); inOl = false; }
      if (!inUl) { out.push(`<ul style="padding-left:20px;margin:10px 0">`); inUl = true; }
      out.push(`<li style="margin:5px 0;line-height:1.6">${line.slice(2)}</li>`);
    } else if (/^\d+\.\s/.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      if (!inOl) { out.push(`<ol style="padding-left:20px;margin:10px 0">`); inOl = true; }
      out.push(`<li style="margin:5px 0;line-height:1.6">${line.replace(/^\d+\.\s/, "")}</li>`);
    } else if (line.startsWith("> ")) {
      closeList();
      out.push(`<blockquote style="border-left:4px solid #c8741e;margin:18px 0;padding:12px 18px;background:#fff8f0;color:#555;font-style:italic;border-radius:0 6px 6px 0">${line.slice(2)}</blockquote>`);
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p style="margin:12px 0;line-height:1.75;color:#333">${line}</p>`);
    }
  }
  closeList();
  return out.join("\n");
}

// Genera un'immagine con Stability AI e la restituisce come base64 data URL
async function fetchStabilityImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    console.log("[blog-cron] STABILITY_API_KEY non configurata, salto Stability AI");
    return null;
  }

  try {
    // Costruzione manuale del multipart/form-data (più affidabile in Vercel Node.js)
    const boundary = `StabilityBoundary${Date.now()}`;
    const CRLF = "\r\n";
    const field = (name: string, value: string) =>
      `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`;

    const bodyStr = [
      field("prompt", prompt),
      field("aspect_ratio", "16:9"),
      field("output_format", "jpeg"),
      `--${boundary}--${CRLF}`,
    ].join("");

    const bodyBuf = Buffer.from(bodyStr, "utf-8");

    console.log("[blog-cron] Chiamata Stability AI, prompt:", prompt.slice(0, 80));

    const res = await fetch("https://api.stability.ai/v2beta/stable-image/generate/core", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "image/*",
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "Content-Length": String(bodyBuf.length),
      },
      body: bodyBuf,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[blog-cron] Stability AI error:", res.status, err);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");
    console.log(`[blog-cron] Stability AI OK: ${contentType}, ${buffer.byteLength} bytes`);
    return `data:${contentType};base64,${b64}`;
  } catch (e) {
    console.error("[blog-cron] Stability AI fetch failed:", e);
    return null;
  }
}

// Fallback: foto reale da Unsplash
async function fetchUnsplashImage(query: string): Promise<string | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&client_id=${apiKey}`,
      { headers: { "Accept-Version": "v1" } }
    );
    if (!res.ok) return null;

    const data = await res.json() as { urls?: { regular?: string } };
    const imgUrl = data.urls?.regular;
    if (!imgUrl) return null;

    const photoRes = await fetch(imgUrl);
    if (!photoRes.ok) return null;

    const mime = photoRes.headers.get("content-type") ?? "image/jpeg";
    const buf = await photoRes.arrayBuffer();
    return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
  } catch (e) {
    console.error("[blog-cron] Unsplash fetch failed:", e);
    return null;
  }
}

async function generateArticle() {
  try {
    return await _generateArticle();
  } catch (e) {
    console.error("[blog-cron] FATAL ERROR in generateArticle:", e);
  }
}

async function _generateArticle() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY mancante" }, { status: 500 });
  }

  // 1. Articoli già esistenti (per non ripetere)
  const { data: posts } = await supabase.from("posts").select("title, slug, created_at").order("created_at", { ascending: false });
  const existingTitles = (posts ?? []).map((p) => `- ${p.title}`).join("\n") || "Nessuno ancora";
  const recentTitles = (posts ?? []).slice(0, 6).map((p) => `- ${p.title}`).join("\n") || "Nessuno ancora";

  // 2. Genera articolo via Claude API
  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `Sei l'assistente editoriale del blog di Stefano Porro, consulente pizzaiolo (consulenzapizzaiolo.it).

Articoli già pubblicati (NON ripetere questi argomenti):
${existingTitles}

Ultimi 10 articoli in ordine cronologico (usali per capire quale categoria è già stata sovra-usata di recente):
${recentTitles}

Gli argomenti sono organizzati in 10 categorie. Regole di rotazione:
- Scegli la categoria che appare MENO negli ultimi 10 articoli sopra
- Se più categorie sono a pari merito, dai priorità a quelle del pane (7, 8) o ai nuovi formati (9, 10) — sono inedite e portano varietà reale
- Non scegliere mai la stessa categoria degli ultimi 2 articoli
- Le categorie 1 (Tecnica pizza) e 2 (Ingredienti pizza) tendono a monopolizzare: evitale se sono già presenti negli ultimi 3 articoli

1. **Tecnica e impasto pizza** (categoria app: Pizza): idratazione, biga e poolish, temperatura acqua, cornicione, autolisi, lievito madre, fermentazione, errori di cottura
2. **Ingredienti pizza** (categoria app: Panificazione): pomodoro, mozzarella e umidità, farine alternative, stagionalità degli ingredienti in pizzeria
3. **Attrezzatura e ambiente** (categoria app: Generale): scelta del forno, cella frigorifera, attrezzi del pizzaiolo, pala da pizza, bilance e strumenti di precisione
4. **Business pizzeria** (categoria app: Business): food cost, costruzione del menù, marketing locale, gestione recensioni, personale, listino prezzi, aprire una pizzeria
5. **Cultura e storia pizza** (categoria app: Consulenza): storia del grano, origini della pizza, stili regionali italiani (napoletana, romana, in teglia, al padellino, al taglio), differenze tecniche e culturali
6. **Ricette gourmet pizza** (categoria app: Pizza): abbinamenti non convenzionali, pizza e alta cucina, ingredienti di nicchia stagionali, pizze bianche creative
7. **Pane artigianale italiano** (categoria app: Panificazione): varietà regionali (pane di Altamura DOP, pane toscano senza sale, ciabatta, pane di Matera, michetta milanese, grissini torinesi, coppia ferrarese, pane carasau sardo, focaccia genovese, pane di Lariano), storia, differenze di impasto e cottura tra Nord e Sud Italia
8. **Ricette pane casalingo** (categoria app: Panificazione): come fare il pane in casa passo dopo passo, lievito madre per il pane, no-knead bread, focaccia casalinga, pane integrale, grissini fatti in casa — con spiegazioni su salubrità, benefici della fermentazione nel pane, perché fare il pane in casa conviene
9. **Miti e luoghi comuni** (categoria app: Generale): falsi miti smontati con fatti ("il glutine fa male a tutti", "la pizza fa ingrassare", "il pane industriale è uguale all'artigianale", "più lievito = pizza più leggera", "la pizza napoletana è pesante") — tono diretto e scientifico
10. **FAQ del pizzaiolo** (categoria app: Consulenza): domande reali di clienti e pizzaioli alle prime armi (quanto lievito usare, come conservare l'impasto, perché si bolla, come fotografare pizza e pane per i social, come capire se la fermentazione è pronta, cosa fare se l'impasto non lievita)

Scegli UN argomento NUOVO (non ancora coperto) da una delle 10 categorie sopra, rispettando la regola di rotazione.

Scrivi un articolo in italiano, tono professionale ma accessibile, ~700-1000 parole.
Formato:
- Titoli con "## " e "### "
- Liste puntate con "- "
- Liste numerate con "1. "
- Citazioni/CTA con "> "
- NO grassetto **
- Termina sempre con una CTA "> " che invita a visitare consulenzapizzaiolo.it per una consulenza

REGOLE OBBLIGATORIE:
- Usa sempre "fermentazione" al posto di "maturazione" (la parola "maturazione" è vietata)
- NON affermare mai che la fermentazione migliora la digeribilità della pizza: questa affermazione è falsa. La digeribilità è determinata principalmente dalla farcitura e dalla cottura

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "title": "Titolo SEO accattivante",
  "slug": "titolo-kebab-case-senza-accenti",
  "subtitle": "Breve sottotitolo 5-8 parole",
  "excerpt": "1-2 frasi di anteprima per il blog",
  "category": "Una di: Pizza|Panificazione|Business|Generale|Consulenza",
  "image_prompt": "Cinematic [soggetto specifico], warm amber light, Italian pizzeria or bakery, professional, no text, no logos",
  "unsplash_query": "2-3 English keywords",
  "content": "Contenuto completo dell'articolo..."
}`,
        },
      ],
    }),
  });

  if (!claudeRes.ok) {
    const err = await claudeRes.text();
    return NextResponse.json({ error: "Errore Claude API", detail: err }, { status: 500 });
  }

  const claudeData = await claudeRes.json();
  const rawText = (claudeData.content[0].text as string).trim();

  let article: {
    title: string;
    slug: string;
    subtitle: string;
    excerpt: string;
    content: string;
    category: string;
    image_prompt: string;
    unsplash_query: string;
  };
  try {
    const start = rawText.indexOf("{");
    if (start === -1) throw new Error("no {");
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;
    for (let i = start; i < rawText.length; i++) {
      const ch = rawText[i];
      if (esc) { esc = false; continue; }
      if (ch === "\\" && inStr) { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "{") depth++;
      if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end === -1) throw new Error("no closing }");
    article = JSON.parse(rawText.slice(start, end + 1));
  } catch {
    return NextResponse.json(
      { error: "Claude non ha restituito JSON valido", raw: rawText },
      { status: 500 }
    );
  }

  // Filtro di sicurezza: sostituisce "maturazione" con "fermentazione" ovunque
  const sanitize = (t: string) =>
    t.replace(/\bMaturazione\b/g, "Fermentazione").replace(/\bmaturazione\b/g, "fermentazione");
  article.title   = sanitize(article.title);
  article.slug    = sanitize(article.slug);
  article.excerpt = sanitize(article.excerpt);
  article.content = sanitize(article.content);

  // Valida categoria
  const validCategories = ["Pizza", "Panificazione", "Business", "Generale", "Consulenza"];
  if (!validCategories.includes(article.category)) {
    article.category = "Pizza";
  }

  // 3. Crea bozza su Supabase
  let slug = article.slug;
  let postData: Record<string, unknown> | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: article.title,
        slug: attempt === 0 ? slug : `${slug}-${attempt}`,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        published: false,
        cover_url: "",
      })
      .select()
      .single();

    if (!error) {
      postData = data as Record<string, unknown>;
      slug = postData.slug as string;
      break;
    }
    if (error.code !== "23505") {
      return NextResponse.json({ error: "Errore Supabase", detail: error.message }, { status: 500 });
    }
  }

  if (!postData) {
    return NextResponse.json({ error: "Impossibile creare la bozza (slug duplicato)" }, { status: 500 });
  }

  const postId = postData.id as string;

  // 4. Genera/recupera immagine di sfondo
  // Priorità: Stability AI → Unsplash → cartoon fallback
  let photoDataUrl: string | null = null;
  let imageSource = "cartoon";

  if (article.image_prompt) {
    photoDataUrl = await fetchStabilityImage(article.image_prompt);
    if (photoDataUrl) imageSource = "stability";
  }

  if (!photoDataUrl && article.unsplash_query) {
    photoDataUrl = await fetchUnsplashImage(article.unsplash_query);
    if (photoDataUrl) imageSource = "unsplash";
  }

  // 5. Genera copertina 1600×840 e caricala su Supabase
  let coverUrl = "";
  try {
    const titleLen = article.title.length;
    const titleSize = titleLen < 30 ? 88 : titleLen < 50 ? 70 : titleLen < 70 ? 56 : 44;

    const imgRes = new ImageResponse(
      photoDataUrl ? (
        // Versione con foto reale (Stability AI o Unsplash) + overlay branding
        <div
          style={{
            width: 1600,
            height: 840,
            display: "flex",
            position: "relative",
            backgroundImage: `url(${photoDataUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            fontFamily: "sans-serif",
          }}
        >
          {/* Gradient overlay: leggero in alto, scuro in basso per leggibilità del titolo */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.20) 35%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.88) 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Badge header in alto a sinistra */}
            <div style={{ padding: "48px 64px", display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "rgba(200,116,30,0.92)",
                  padding: "12px 28px",
                  borderRadius: 50,
                  backdropFilter: "blur(4px)",
                }}
              >
                <span style={{ fontSize: 26 }}>🍕</span>
                <span
                  style={{
                    color: "#fff",
                    fontSize: 20,
                    fontWeight: "bold",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                  }}
                >
                  Consulenza Pizzaiolo
                </span>
              </div>
            </div>

            {/* Titolo e URL in basso */}
            <div style={{ padding: "0 80px 68px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: "bold",
                  color: "#ffffff",
                  lineHeight: 1.18,
                  maxWidth: 1380,
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {article.title}
              </div>
              {article.subtitle && (
                <div
                  style={{
                    fontSize: 30,
                    color: "#f5b26b",
                    fontStyle: "italic",
                    maxWidth: 1200,
                    lineHeight: 1.35,
                    textShadow: "0 1px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {article.subtitle}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
                <div style={{ width: 4, height: 30, background: "#c8741e", borderRadius: 3 }} />
                <span
                  style={{
                    fontSize: 22,
                    color: "rgba(255,255,255,0.58)",
                    letterSpacing: 1.5,
                    textTransform: "lowercase",
                  }}
                >
                  consulenzapizzaiolo.it
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Fallback cartoon (nessuna API configurata)
        <div
          style={{
            width: 1600,
            height: 840,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #f7eede 0%, #efe0c4 100%)",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              background: "#c8741e",
              padding: "36px 80px",
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <span style={{ fontSize: 52, color: "#fff" }}>🍕</span>
            <span
              style={{
                fontSize: 26,
                color: "rgba(255,255,255,0.9)",
                fontWeight: "bold",
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              Consulenza Pizzaiolo
            </span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "50px 120px",
            }}
          >
            <div style={{ fontSize: 100, marginBottom: 40 }}>👨‍🍳</div>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: "bold",
                color: "#3d2b1a",
                textAlign: "center",
                lineHeight: 1.2,
                maxWidth: 1300,
              }}
            >
              {article.title}
            </div>
            {article.subtitle && (
              <div
                style={{
                  fontSize: 34,
                  color: "#c8741e",
                  marginTop: 28,
                  textAlign: "center",
                  fontStyle: "italic",
                  maxWidth: 1000,
                }}
              >
                {article.subtitle}
              </div>
            )}
          </div>

          <div
            style={{
              background: "#3d2b1a",
              padding: "22px 80px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 22 }}>
              consulenzapizzaiolo.it
            </span>
            <span style={{ color: "#c8741e", fontSize: 22, fontWeight: "bold" }}>
              Blog
            </span>
          </div>
        </div>
      ),
      { width: 1600, height: 840 }
    );

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const fileName = `${Date.now()}-cover-${slug.slice(0, 30)}.png`;

    const { error: uploadErr } = await supabase.storage
      .from("blog")
      .upload(fileName, buffer, { contentType: "image/png", upsert: false });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("blog").getPublicUrl(fileName);
      coverUrl = urlData.publicUrl;
      await supabase.from("posts").update({ cover_url: coverUrl }).eq("id", postId);
    }
  } catch (e) {
    console.error("Cover generation failed:", e);
  }

  // 6. Invia email con articolo completo
  const adminUrl = `https://www.consulenzapizzaiolo.it/admin?edit=${postId}`;
  const articleHtml = mdToHtml(article.content);

  const emailHtml = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:28px 32px;">
      <div style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Blog Consulenza Pizzaiolo</div>
      <div style="color:#fff;font-size:22px;font-weight:bold;">Nuovo articolo da revisionare</div>
    </div>

    <div style="padding:28px 32px 0;">
      ${coverUrl ? `<img src="${coverUrl}" alt="Copertina" style="width:100%;border-radius:8px;margin-bottom:20px"/>` : ""}
      <h1 style="color:#3d2b1a;font-size:26px;margin:0 0 12px">${article.title}</h1>
      <p style="color:#888;font-style:italic;font-size:15px;margin:0 0 24px;border-left:3px solid #c8741e;padding-left:12px">${article.excerpt}</p>
      <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px"/>
      <div style="font-size:15px;color:#333;">
        ${articleHtml}
      </div>
    </div>

    <div style="margin:24px 32px;padding:20px;background:#fff8f0;border:1px solid #f5ddb0;border-radius:8px;text-align:center;">
      <div style="font-size:14px;color:#555;margin-bottom:16px;">
        📝 Questo articolo è salvato come <strong>BOZZA</strong> — non è ancora visibile sul sito.<br/>
        Clicca il pulsante per aprirlo nel pannello e pubblicarlo quando sei pronto.
      </div>
      <a href="${adminUrl}" style="display:inline-block;background:#c8741e;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Apri l'articolo nel pannello →
      </a>
    </div>

    <div style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#aaa;">
        Consulenza Pizzaiolo — Stefano Porro<br/>
        <a href="https://www.consulenzapizzaiolo.it" style="color:#c8741e;text-decoration:none;">consulenzapizzaiolo.it</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  let emailSent = false;

  if (resendKey) {
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Blog Consulenza Pizzaiolo <${fromEmail}>`,
        to: ["porroste80@gmail.com"],
        subject: `Nuovo articolo da revisionare: ${article.title}`,
        html: emailHtml,
      }),
    });
    emailSent = emailRes.ok;
  }

  console.log(`[blog-cron] Articolo creato: "${article.title}" (${postId}) — categoria: ${article.category} — immagine: ${imageSource} — email: ${emailSent}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  waitUntil(generateArticle());

  return NextResponse.json({ ok: true, started: true });
}
