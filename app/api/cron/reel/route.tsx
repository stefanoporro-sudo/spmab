import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";
import { generateSocialCoverImage } from "@/lib/social-image";
import { ANGLES, Angle, pickNextTopic } from "@/lib/social-topics";

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
  forcedAngle: Angle;
  forcedSubtopic: string;
  forcedIngredient?: string;
};

// Ogni generazione è contenuto originale, con argomento assegnato dalla rotazione forzata
// sui 300 argomenti (mai dallo stesso pool di blog/ricette, rimosso per evitare le ripetizioni
// che causava: Claude, lasciato libero di reinterpretare una fonte, gravitava sempre sugli
// stessi 3-4 temi "sicuri" — es. l'idratazione — indipendentemente dalla fonte).
async function pickSource(): Promise<SourceContent> {
  const topic = await pickNextTopic();
  return {
    forcedAngle: topic.angle,
    forcedSubtopic: topic.topic,
    forcedIngredient: topic.ingredient,
  };
}

function extractJson(rawText: string): { caption: string; hashtags: string[]; angle: string; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string; suggested_recipe?: { title: string; category: string; level: string; description: string } } {
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

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[reel-cron] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID mancanti");
    return;
  }
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
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
  const recipeSuggestionBlock = source.forcedIngredient
    ? `\nQuesto argomento riguarda un ingrediente di pregio (${source.forcedIngredient}). Suggerisci ANCHE una ricetta di pizza, focaccia o pane che lo valorizzi, da aggiungere come bozza nel ricettario. Nel campo "suggested_recipe" della risposta:
{
  "title": "nome della ricetta",
  "category": "Pizza|Focaccia|Pane|Altro",
  "level": "Base|Intermedio|Avanzato",
  "description": "elenco ingredienti con quantità indicative, poi il procedimento passo passo"
}
Ometti il campo "suggested_recipe" solo se l'ingrediente non si presta davvero a una ricetta pizza/pane/focaccia.\n`
    : "";

  return `Scrivi una caption per un Reel Instagram/Facebook come contenuto originale.

ARGOMENTO GIÀ ASSEGNATO (obbligatorio, non sceglierne un altro): "${source.forcedSubtopic}"
Angolo: "${source.forcedAngle}" (usa esattamente questo valore nel campo "angle" della risposta, e ripeti l'argomento assegnato nel campo "subtopic").
${recipeSuggestionBlock}
${history}

IMPORTANTE: anche se l'argomento assegnato è diverso da quelli sopra, NON ritrattare la stessa tesi centrale con un taglio diverso. NON scrivere MAI frasi come "ne ho già parlato" o "su questo ho già scritto" a meno che quello specifico argomento non compaia letteralmente nella cronologia qui sopra — non dare per scontato che qualcosa sia già stato trattato solo perché è concettualmente vicino al tuo argomento assegnato: se non è nella lista sopra, per te è nuovo, trattalo come tale. Scrivi un aneddoto storico verificabile, uno sfatamento di un mito comune, o un tip pratico su questo tema — mai inventare fatti falsi, mai citazioni dirette non attribuibili con certezza; se non sei sicuro di un dettaglio storico o di una certificazione (DOP/IGP/presidio) resta sul generico piuttosto che inventare date, nomi o riconoscimenti.`;
}

type ParsedCaption = { caption: string; hashtags: string[]; angle: string; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string; suggested_recipe?: { title: string; category: string; level: string; description: string } };

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
A differenza di un post normale, un Reel si guarda in video: le prime parole della caption devono funzionare da "gancio" che trattiene chi sta guardando (una domanda diretta, un'affermazione che rompe un luogo comune, o un "non fare X finché non guardi questo"). Testo breve, 80-150 parole, in italiano, tono onesto e diretto senza fuffa da corsi costosi. CTA finale verso consulenzapizzaiolo.it o l'invito a seguire Stefano. 5-8 hashtag pertinenti al mondo pizza/ristorazione.

REGOLE OBBLIGATORIE:
- Usa sempre "fermentazione" al posto di "maturazione" (parola vietata)
- NON affermare mai che la fermentazione migliora la digeribilità della pizza: è falso
- Se parli dell'approccio di Gabriele Bonci, resta sugli aspetti pubblicamente noti (alta idratazione, lunga lievitazione, tracciabilità delle farine, pizza al taglio gourmet popolare): non inventare mai citazioni dirette o dichiarazioni che non gli siano realmente attribuite

Aggiungi anche una breve frase ad effetto (4-8 parole, in italiano) da sovrimprimere sulla foto di copertina, e un prompt fotografico per generare quella foto — stessa logica delle copertine del blog: una foto realistica e pertinente, mai un grafico astratto.

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "caption": "testo della caption con eventuali a capo",
  "hashtags": ["hashtag1", "hashtag2"],
  "angle": "tecnica|ingredienti|panificazione|attrezzatura|business|storia|gourmet|miti|faq|avviare|vita",
  "image_headline": "frase breve ad effetto per la foto di copertina (4-8 parole)",
  "image_prompt": "Cinematic [soggetto specifico legato al contenuto], warm amber light, Italian pizzeria or bakery, professional food photography, no text, no logos",
  "unsplash_query": "2-3 English keywords",
  "subtopic": "breve descrizione del sotto-argomento/tesi scelto (3-6 parole)",
  "suggested_recipe": "solo se richiesto esplicitamente sopra: { title, category, level, description }, altrimenti omettere il campo"
}`;
}

async function notifyFailure(reason: string) {
  await sendTelegramMessage(`⚠️ <b>Generazione Reel fallita</b>\n\nMotivo: ${reason}\n\nNessuna bozza è stata creata.`);
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
  const angle = ANGLES.includes(parsed.angle as Angle) ? parsed.angle : (source.forcedAngle ?? null);

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
      image_url: imageUrl,
      scheduled_slot: "19:00",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("[reel-cron] Errore Supabase", error.message);
    await notifyFailure(`errore salvataggio su Supabase: ${error.message}`);
    return;
  }

  let suggestedRecipeTitle = "";
  if (source.forcedIngredient && parsed.suggested_recipe) {
    try {
      const { error: recipeErr } = await supabase.from("recipes").insert({
        title: parsed.suggested_recipe.title,
        category: parsed.suggested_recipe.category || "Pizza",
        level: parsed.suggested_recipe.level || "Intermedio",
        description: parsed.suggested_recipe.description,
        file_url: "",
        active: false,
        sort_order: 99,
        collaborator_id: null,
      });
      if (recipeErr) {
        console.error("[reel-cron] Errore salvataggio ricetta suggerita:", recipeErr.message);
      } else {
        suggestedRecipeTitle = parsed.suggested_recipe.title;
      }
    } catch (e) {
      console.error("[reel-cron] Errore inserimento ricetta suggerita:", e);
    }
  }

  const adminUrl = `https://www.consulenzapizzaiolo.it/admin?tab=social&edit=${draft.id}`;
  const preview = caption.length > 300 ? `${caption.slice(0, 300)}…` : caption;

  const imageNote = imageUrl
    ? "🖼️ Immagine generata automaticamente — sostituiscila nel pannello se preferisci un video/foto tua.\n\n"
    : "";
  const recipeNote = suggestedRecipeTitle
    ? `\n\n💡 Ricetta suggerita aggiunta come bozza in "Ricette": ${suggestedRecipeTitle}`
    : "";

  await sendTelegramMessage(
    `🎬 <b>Nuovo Reel da revisionare</b>\n\nContenuto originale · angolo: ${angle ?? "n/d"}\n\n${imageNote}${preview}${recipeNote}\n\n<a href="${adminUrl}">Apri nel pannello</a>`
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
