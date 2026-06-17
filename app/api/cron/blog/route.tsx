import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import { supabase } from "@/lib/supabase";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  return !cronSecret || authHeader === `Bearer ${cronSecret}`;
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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY mancante" }, { status: 500 });
  }

  // 1. Articoli già esistenti (per non ripetere)
  const { data: posts } = await supabase.from("posts").select("title, slug");
  const existingTitles = (posts ?? []).map((p) => `- ${p.title}`).join("\n") || "Nessuno ancora";

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
      max_tokens: 2500,
      messages: [
        {
          role: "user",
          content: `Sei l'assistente editoriale del blog di Stefano Porro, consulente pizzaiolo (consulenzapizzaiolo.it).

Articoli già pubblicati (NON ripetere questi argomenti):
${existingTitles}

Scegli UN argomento NUOVO tra questi: idratazione dell'impasto, scelta del forno, biga e poolish, gestione della cella frigorifera, temperatura dell'acqua nell'impasto, il cornicione perfetto, pizza in teglia vs tonda, il pomodoro giusto per la pizza, la mozzarella e la gestione dell'umidità, food cost, il menù della pizzeria, marketing per pizzeria, errori di cottura, gli attrezzi del pizzaiolo, farine alternative (tipo 1, integrale, senza glutine), lievito madre per la pizza, come gestire le recensioni online, stagionalità degli ingredienti.

Scrivi un articolo in italiano, tono professionale ma accessibile, ~700-1000 parole.
Formato:
- Titoli con "## " e "### "
- Liste puntate con "- "
- Liste numerate con "1. "
- Citazioni/CTA con "> "
- NO grassetto **
- Termina sempre con una CTA "> " che invita a visitare consulenzapizzaiolo.it per una consulenza

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "title": "Titolo SEO accattivante",
  "slug": "titolo-kebab-case-senza-accenti",
  "subtitle": "Breve sottotitolo 5-8 parole",
  "excerpt": "1-2 frasi di anteprima per il blog",
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
  };
  try {
    article = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Claude non ha restituito JSON valido", raw: rawText },
      { status: 500 }
    );
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
        category: "Pizza",
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

  // 4. Genera copertina cartoon con next/og e caricala su Supabase
  let coverUrl = "";
  try {
    const titleLen = article.title.length;
    const titleSize = titleLen < 30 ? 90 : titleLen < 50 ? 72 : titleLen < 70 ? 58 : 46;

    const imgRes = new ImageResponse(
      (
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
          {/* Header arancione */}
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

          {/* Contenuto centrale */}
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

          {/* Footer scuro */}
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

  // 5. Invia email con articolo completo
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

  return NextResponse.json({
    ok: true,
    postId,
    title: article.title,
    slug,
    coverUrl: coverUrl || null,
    emailSent,
    adminUrl,
  });
}
