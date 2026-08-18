import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";
import { generateSocialCoverImage } from "@/lib/social-image";
import { REEL_ANGLES, ReelAngle, pickNextReelTopic } from "@/lib/reel-topics";

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = req.headers.get("x-admin-password");
  return (
    (!cronSecret || authHeader === `Bearer ${cronSecret}`) ||
    (!!process.env.ADMIN_PASSWORD && adminPassword === process.env.ADMIN_PASSWORD)
  );
}

type SourceContent = {
  forcedAngle: ReelAngle;
  forcedSubtopic: string;
};

// Argomento assegnato dalla rotazione forzata sulla lista dedicata ai Reel arte bianca
// (lib/reel-topics.ts) — separata dai 300 argomenti condivisi con post/LinkedIn, così i due
// pool non si influenzano e i reel restano un flusso di contenuto a sé.
async function pickSource(): Promise<SourceContent> {
  const topic = await pickNextReelTopic();
  return {
    forcedAngle: topic.angle,
    forcedSubtopic: topic.topic,
  };
}

function extractJson(rawText: string): { caption: string; hashtags: string[]; angle: string; cards: string[]; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string } {
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
  return JSON.parse(rawText.slice(start, end + 1));
}

async function sendReelEmail(subject: string, html: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  if (!resendKey) {
    console.error("[reel-cron] RESEND_API_KEY mancante");
    return;
  }
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Reel Consulenza Pizzaiolo <${fromEmail}>`,
      to: ["porroste80@gmail.com"],
      subject,
      html,
    }),
  });
  if (!emailRes.ok) {
    console.error("[reel-cron] Errore invio email:", await emailRes.text());
  }
}

async function getRecentTopicHistory(): Promise<{ block: string; recentCaptions: string[] }> {
  const { data: blogPosts } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(60);
  const blogTitles = (blogPosts ?? []).map((p) => `- ${p.title}`).join("\n") || "Nessuno";

  const { data: recentSocial } = await supabase
    .from("social_posts")
    .select("caption, created_at")
    .order("created_at", { ascending: false })
    .limit(15);
  const socialSnippets = (recentSocial ?? [])
    .map((p) => `- ${p.caption.split("\n")[0].slice(0, 120)}`)
    .join("\n") || "Nessuno";

  const block = `Titoli di TUTTI gli articoli blog già pubblicati:
${blogTitles}

Apertura delle ultime caption social/Reel già create (comprese quelle rifiutate da Stefano — se un argomento specifico è già qui, evitalo, vuol dire che è già stato trattato o non è piaciuto):
${socialSnippets}`;

  return { block, recentCaptions: (recentSocial ?? []).map((p) => p.caption as string) };
}

function normalizeOpening(text: string): string {
  return text
    .split("\n")[0]
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join(" ");
}

function openingCollides(caption: string, recentCaptions: string[]): boolean {
  const newOpening = normalizeOpening(caption);
  if (!newOpening) return false;
  return recentCaptions.some((c) => normalizeOpening(c) === newOpening);
}

function buildContentPrompt(source: SourceContent, history: string): string {
  return `Scrivi un Reel Instagram "arte bianca" a schede di testo (nessuna voce narrante, nessuna persona in video): una sequenza di frasi brevi che scorrono a schermo su uno sfondo, pensato per far seguire l'account a chi guarda, non solo per farlo scorrere.

GANCIO GIÀ ASSEGNATO (obbligatorio, non cambiarlo): "${source.forcedSubtopic}"
Angolo: "${source.forcedAngle}" (usa esattamente questo valore nel campo "angle" della risposta, e ripeti il gancio assegnato nel campo "subtopic").

${history}

IMPORTANTE: anche se l'argomento assegnato è diverso da quelli sopra, NON ritrattare la stessa tesi centrale con un taglio diverso. NON scrivere MAI frasi come "ne ho già parlato" o "su questo ho già scritto" a meno che quello specifico argomento non compaia letteralmente nella cronologia qui sopra. Mai inventare fatti falsi, mai citazioni dirette non attribuibili con certezza; se non sei sicuro di un dettaglio storico resta sul generico piuttosto che inventare date o nomi.`;
}

type ParsedCaption = { caption: string; hashtags: string[]; angle: string; cards: string[]; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string };

async function callClaudeForCaption(anthropicKey: string, promptBody: string): Promise<ParsedCaption | null> {
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: promptBody }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("[reel-cron] Errore Claude API", await claudeRes.text());
      return null;
    }

    const claudeData = await claudeRes.json();
    const rawText = (claudeData?.content?.[0]?.text as string | undefined)?.trim();
    if (!rawText) {
      console.error("[reel-cron] Risposta Claude senza testo", JSON.stringify(claudeData));
      return null;
    }

    return extractJson(rawText);
  } catch (e) {
    console.error("[reel-cron] Errore chiamata/parsing Claude", e);
    return null;
  }
}

function buildFullPrompt(contentPrompt: string, retryNote?: string): string {
  return `Sei il social media manager di Stefano Porro, consulente pizzaiolo (consulenzapizzaiolo.it).

${contentPrompt}
${retryNote ?? ""}
Il video è generato in automatico: schede di testo che scorrono sopra a immagini di sfondo, con una musica di sottofondo, nessuna voce e nessuna persona in video. Scrivi 3-5 schede ("cards"), in italiano, in questo ordine:
1. Prima scheda = il gancio vero e proprio, chi scorre deve fermarsi in 1-2 secondi (domanda diretta, affermazione che rompe un luogo comune, o "non fare X finché non leggi questo")
2-4. Sviluppo: il contenuto pratico dell'argomento assegnato, una frase breve per scheda (max 12 parole ciascuna, leggibile in 2-3 secondi)
Ultima scheda = invito a seguire l'account per altri consigli di arte bianca (variare la formulazione, mai identica al reel precedente)

Tono onesto e diretto, senza fuffa da corsi costosi. Poi scrivi anche una caption estesa (80-150 parole) per il post Instagram sotto al video — questa può ampliare quanto detto nelle card, con CTA finale verso consulenzapizzaiolo.it. 5-8 hashtag pertinenti al mondo pizza/panificazione.

REGOLE OBBLIGATORIE:
- Usa sempre "fermentazione" al posto di "maturazione" (parola vietata)
- NON affermare mai che la fermentazione migliora la digeribilità: è falso

Aggiungi anche una breve frase ad effetto (4-8 parole, in italiano) e un prompt fotografico per una foto di sfondo — stessa logica delle copertine del blog: una foto realistica e pertinente, mai un grafico astratto.

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "cards": ["scheda 1 (il gancio)", "scheda 2", "scheda 3", "scheda 4 (facoltativa)", "scheda finale con invito a seguire"],
  "caption": "testo della caption estesa per il post, con eventuali a capo",
  "hashtags": ["hashtag1", "hashtag2"],
  "angle": "miti|errori|tecnica|curiosita|confronti",
  "image_headline": "frase breve ad effetto (4-8 parole)",
  "image_prompt": "Cinematic [soggetto specifico legato al contenuto], warm amber light, Italian bakery, professional food photography, no text, no logos",
  "unsplash_query": "2-3 English keywords",
  "subtopic": "ripeti esattamente il gancio assegnato sopra"
}`;
}

async function notifyFailure(reason: string) {
  await sendReelEmail(
    "⚠️ Generazione Reel fallita",
    `<p><strong>Generazione Reel fallita</strong></p><p>Motivo: ${reason}</p><p>Nessuna bozza è stata creata.</p>`
  );
}

async function generateDraft() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error("[reel-cron] ANTHROPIC_API_KEY mancante");
    await notifyFailure("ANTHROPIC_API_KEY mancante");
    return;
  }

  try {
    const source = await pickSource();
    const history = await getRecentTopicHistory();
    const contentPrompt = buildContentPrompt(source, history.block);

    let parsed = await callClaudeForCaption(anthropicKey, buildFullPrompt(contentPrompt));
    if (!parsed) {
      console.warn("[reel-cron] Primo tentativo fallito, riprovo una volta");
      parsed = await callClaudeForCaption(anthropicKey, buildFullPrompt(contentPrompt));
    }
    if (!parsed) {
      await notifyFailure("Claude non ha risposto o la risposta non era in JSON valido, anche dopo un secondo tentativo (vedi log Vercel)");
      return;
    }

    if (openingCollides(parsed.caption, history.recentCaptions)) {
      console.warn("[reel-cron] Apertura già usata di recente, rigenero");
      const retryNote = `\nATTENZIONE: la tua prima bozza per questa richiesta iniziava con "${parsed.caption.split("\n")[0]}" — troppo simile a qualcosa già usato di recente. Riscrivi con un'apertura DAVVERO diversa.\n`;
      const retryParsed = await callClaudeForCaption(anthropicKey, buildFullPrompt(contentPrompt, retryNote));
      if (retryParsed) parsed = retryParsed;
    }

    await finalizeDraft(source, parsed);
  } catch (e) {
    console.error("[reel-cron] Errore imprevisto nella generazione", e);
    await notifyFailure(`errore imprevisto: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function finalizeDraft(source: SourceContent, parsed: ParsedCaption) {
  const sanitize = (t: string) =>
    t.replace(/\bMaturazione\b/g, "Fermentazione").replace(/\bmaturazione\b/g, "fermentazione");

  const hashtagsLine = parsed.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  const caption = `${sanitize(parsed.caption)}\n\n${hashtagsLine}`;
  const cards = (parsed.cards ?? []).map(sanitize);
  const angle = REEL_ANGLES.includes(parsed.angle as ReelAngle) ? parsed.angle : (source.forcedAngle ?? null);

  let imageUrl = "";
  try {
    const headline = sanitize(parsed.image_headline || parsed.caption.split("\n")[0].slice(0, 90));
    const buffer = await generateSocialCoverImage({
      badgeLabel: "Reel",
      headline,
      imagePrompt: parsed.image_prompt,
      unsplashQuery: parsed.unsplash_query,
    });
    const fileName = `img-${Date.now()}-cover.png`;
    const { error: uploadErr } = await supabase.storage
      .from("social")
      .upload(fileName, buffer, { contentType: "image/png", upsert: false });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("social").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    } else {
      console.error("[reel-cron] Errore upload immagine:", uploadErr.message);
    }
  } catch (e) {
    console.error("[reel-cron] Generazione immagine fallita:", e);
  }

  const { data: draft, error } = await supabase
    .from("social_posts")
    .insert({
      source_type: "standalone",
      source_id: null,
      content_type: "reel",
      angle,
      subtopic: source.forcedSubtopic,
      caption,
      reel_cards: cards,
      video_url: null,
      image_url: imageUrl,
      scheduled_slot: "daily",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("[reel-cron] Errore Supabase", error.message);
    await notifyFailure(`errore salvataggio su Supabase: ${error.message}`);
    return;
  }

  const adminUrl = `https://www.consulenzapizzaiolo.it/admin?tab=social&edit=${draft.id}`;
  const cardsPreview = cards.map((c, i) => `<li>${c}</li>`).join("");

  await sendReelEmail(
    `Nuovo Reel da revisionare — ${angle ?? "n/d"}`,
    `<p><strong>Nuovo Reel da revisionare</strong> — angolo: ${angle ?? "n/d"}</p>
     <ol>${cardsPreview}</ol>
     <p>⏳ Video in coda per il montaggio locale sul Mac — torna tra poco nel pannello per rivederlo prima di pubblicare.</p>
     <p><a href="${adminUrl}">Apri nel pannello</a></p>`
  );

  console.log(`[reel-cron] Bozza creata (${draft.id}) angolo=${angle}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  waitUntil(generateDraft());

  return NextResponse.json({ ok: true, started: true });
}
