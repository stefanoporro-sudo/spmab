import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";
import { generateSocialCoverImage } from "@/lib/social-image";
import { ANGLES, ANGLE_CATEGORIES, Angle, pickNextTopic, getLastUsedAngle } from "@/lib/social-topics";

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
  sourceType: "post" | "recipe" | "standalone";
  sourceId: string | null;
  title: string;
  summary: string;
  usedAngles: Angle[];
  forcedAngle?: Angle;
  forcedSubtopic?: string;
  forcedIngredient?: string;
  lastUsedAngle?: string | null;
};

async function pickBestCandidate<T extends { id: string }>(
  candidates: T[],
  sourceType: "post" | "recipe"
): Promise<{ chosen: T; usedAngles: Angle[] } | null> {
  if (candidates.length === 0) return null;

  const { data: used } = await supabase
    .from("social_posts")
    .select("source_id, angle, created_at")
    .eq("source_type", sourceType)
    .order("created_at", { ascending: true });

  const anglesBySource = new Map<string, Set<string>>();
  const lastUsedBySource = new Map<string, string>();
  for (const row of used ?? []) {
    if (!row.source_id) continue;
    if (!anglesBySource.has(row.source_id)) anglesBySource.set(row.source_id, new Set());
    if (row.angle) anglesBySource.get(row.source_id)!.add(row.angle);
    lastUsedBySource.set(row.source_id, row.created_at);
  }

  let bestCount = Infinity;
  for (const c of candidates) {
    const usedCount = anglesBySource.get(c.id)?.size ?? 0;
    if (usedCount < bestCount) bestCount = usedCount;
  }

  if (bestCount < ANGLES.length) {
    // Tra le fonti a pari merito (stesso numero di angoli usati), sceglie a caso invece di prendere sempre la prima
    const tied = candidates.filter((c) => (anglesBySource.get(c.id)?.size ?? 0) === bestCount);
    const chosen = tied[Math.floor(Math.random() * tied.length)];
    return { chosen, usedAngles: Array.from(anglesBySource.get(chosen.id) ?? []) as Angle[] };
  }

  // Tutte le fonti hanno esaurito i 6 angoli: ripiega sulla meno usata di recente
  const sorted = [...candidates].sort((a, b) => {
    const at = lastUsedBySource.get(a.id) ?? "";
    const bt = lastUsedBySource.get(b.id) ?? "";
    return at.localeCompare(bt);
  });
  const chosen = sorted[0];
  return { chosen, usedAngles: Array.from(anglesBySource.get(chosen.id) ?? []) as Angle[] };
}

async function pickSource(): Promise<SourceContent | null> {
  const { count } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true });
  const n = count ?? 0;
  const lastUsedAngle = await getLastUsedAngle();

  // 1 generazione su 3 pesca da blog/ricette (alternati), 2 su 3 sono contenuto standalone
  if (n % 3 !== 0) {
    const topic = await pickNextTopic();
    return {
      sourceType: "standalone",
      sourceId: null,
      title: "",
      summary: "",
      usedAngles: [],
      forcedAngle: topic.angle,
      forcedSubtopic: topic.topic,
      forcedIngredient: topic.ingredient,
      lastUsedAngle,
    };
  }

  const useRecipe = Math.floor(n / 3) % 2 === 1;

  if (!useRecipe) {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, excerpt")
      .eq("published", true);
    const result = await pickBestCandidate(posts ?? [], "post");
    if (!result) return null;
    return {
      sourceType: "post",
      sourceId: result.chosen.id,
      title: result.chosen.title,
      summary: result.chosen.excerpt,
      usedAngles: result.usedAngles,
      lastUsedAngle,
    };
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, description, category")
    .eq("active", true)
    .is("collaborator_id", null);
  const result = await pickBestCandidate(recipes ?? [], "recipe");
  if (!result) return null;
  return {
    sourceType: "recipe",
    sourceId: result.chosen.id,
    title: result.chosen.title,
    summary: result.chosen.description || result.chosen.category,
    usedAngles: result.usedAngles,
    lastUsedAngle,
  };
}

function extractJson(rawText: string): { caption: string; hashtags: string[]; angle: string; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string; subtopic_is_similar_to_recent?: boolean; suggested_recipe?: { title: string; category: string; level: string; description: string } } {
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

  const block = `Titoli di TUTTI gli articoli blog già pubblicati (compresi quelli non usati finora per i social):
${blogTitles}

Apertura delle ultime caption social/Reel già create (comprese quelle rifiutate da Stefano — se un argomento specifico è già qui, evitalo, vuol dire che è già stato trattato o non è piaciuto):
${socialSnippets}`;

  return { block, recentCaptions: (recentSocial ?? []).map((p) => p.caption as string) };
}

async function getRecentSubtopicsByAngle(): Promise<{ block: string; byAngle: Map<string, string[]> }> {
  const { data } = await supabase
    .from("social_posts")
    .select("angle, subtopic, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  const byAngle = new Map<string, string[]>();
  for (const row of data ?? []) {
    if (!row.angle || !row.subtopic) continue;
    if (!byAngle.has(row.angle)) byAngle.set(row.angle, []);
    const list = byAngle.get(row.angle)!;
    if (list.length < 8) list.push(row.subtopic as string);
  }

  const block =
    byAngle.size === 0
      ? "Nessun sotto-argomento specifico usato finora."
      : Array.from(byAngle.entries())
          .map(([angle, subtopics]) => `- ${angle}: ${subtopics.join(" | ")}`)
          .join("\n");

  return { block, byAngle };
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

function buildContentPrompt(source: SourceContent, history: string, subtopicsByAngle: string): string {
  const historyBlock = `${history}

IMPORTANTE: anche se l'angolo/categoria è diverso, NON ritrattare uno specifico argomento/tecnica (es. "autolisi", "biga e poolish") già coperto in dettaglio in uno dei titoli o caption sopra. Se il tema è già stato trattato, scegli un sotto-argomento distinto o un taglio narrativo chiaramente diverso.

Sotto-argomenti specifici già usati di recente per ciascun angolo (NON riusare la stessa tesi/argomento centrale, anche riformulato — scegline uno diverso della stessa categoria):
${subtopicsByAngle}

Dichiara nel campo "subtopic" una frase breve (3-6 parole) che descriva lo specifico sotto-argomento/tesi che hai scelto per QUESTA caption, diverso da quelli elencati sopra per lo stesso angolo.

ATTENZIONE — il confronto con i sotto-argomenti sopra deve essere sul SIGNIFICATO, non sulle parole usate: due tesi che raccontano la stessa idea di fondo con parole diverse (es. "differenze tra pizza napoletana e romana" e "origini degli stili regionali italiani" sono la STESSA tesi, solo riformulata) contano come ripetizione. Prima di rispondere, controlla onestamente se la tua tesi è concettualmente la stessa di una già elencata per questo angolo; imposta il campo "subtopic_is_similar_to_recent" a true se lo è (anche solo in parte), false se è davvero un'idea distinta.`;

  if (source.sourceType === "standalone") {
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

    return `Scrivi una caption per un Reel Instagram/Facebook come contenuto originale (non parte da un articolo specifico del sito).

ARGOMENTO GIÀ ASSEGNATO (obbligatorio, non sceglierne un altro): "${source.forcedSubtopic}"
Angolo: "${source.forcedAngle}" (usa esattamente questo valore nel campo "angle" della risposta, e ripeti l'argomento assegnato nel campo "subtopic").
${recipeSuggestionBlock}
${historyBlock}

Scrivi un aneddoto storico verificabile, uno sfatamento di un mito comune, o un tip pratico su questo tema — mai inventare fatti falsi, mai citazioni dirette non attribuibili con certezza; se non sei sicuro di un dettaglio storico o di una certificazione (DOP/IGP/presidio) resta sul generico piuttosto che inventare date, nomi o riconoscimenti.`;
  }

  const avoidBlock = `${source.usedAngles.length
    ? `Angoli già usati per questa fonte (NON riusarli se possibile): ${source.usedAngles.join(", ")}.`
    : "Nessun angolo ancora usato per questa fonte."}${
    source.lastUsedAngle
      ? `\nATTENZIONE: l'ultimo angolo usato in assoluto (indipendentemente dalla fonte, anche su un altro articolo/ricetta) è "${source.lastUsedAngle}" — NON sceglierlo di nuovo per questa generazione anche se per questa fonte specifica risulta libero: serve varietà tra una pubblicazione e l'altra, non solo per singola fonte.`
      : ""
  }`;

  return `Scrivi una caption per un Reel Instagram/Facebook a partire da questo contenuto del sito:
Titolo: ${source.title}
Sintesi: ${source.summary}

Gli angoli possibili sono questi:
${ANGLE_CATEGORIES}

${avoidBlock}
Scegli un angolo NON ancora usato per questa fonte (se ce n'è almeno uno libero) e dichiaralo nel campo "angle" della risposta con il suo codice (${ANGLES.join("/")}). Reinterpreta il contenuto del sito sotto quella lente, senza inventare fatti che non c'entrano con la fonte.

${historyBlock}`;
}

type ParsedCaption = { caption: string; hashtags: string[]; angle: string; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string; subtopic_is_similar_to_recent?: boolean; suggested_recipe?: { title: string; category: string; level: string; description: string } };

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
        max_tokens: 600,
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
  "subtopic_is_similar_to_recent": false,
  "suggested_recipe": "solo se richiesto esplicitamente sopra: { title, category, level, description }, altrimenti omettere il campo"
}`;
}

function normalizeSubtopic(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}

function subtopicCollides(subtopic: string | undefined, angle: string, subtopicsByAngleRaw: Map<string, string[]>): boolean {
  if (!subtopic) return false;
  const used = subtopicsByAngleRaw.get(angle) ?? [];
  const normalizedNew = normalizeSubtopic(subtopic);
  return used.some((s) => normalizeSubtopic(s) === normalizedNew);
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
    if (!source) {
      console.error("[reel-cron] Nessun contenuto disponibile (post/ricette)");
      await notifyFailure("nessun contenuto disponibile (post/ricette)");
      return;
    }

    const history = await getRecentTopicHistory();
    const subtopics = await getRecentSubtopicsByAngle();
    const contentPrompt = buildContentPrompt(source, history.block, subtopics.block);

    let parsed = await callClaudeForCaption(anthropicKey, buildFullPrompt(contentPrompt));
    if (!parsed) {
      await notifyFailure("Claude non ha risposto o la risposta non era in JSON valido (vedi log Vercel)");
      return;
    }

    const collides =
      source.sourceType === "standalone"
        ? openingCollides(parsed.caption, history.recentCaptions)
        : openingCollides(parsed.caption, history.recentCaptions) ||
          subtopicCollides(parsed.subtopic, parsed.angle, subtopics.byAngle) ||
          parsed.subtopic_is_similar_to_recent === true ||
          (!!source.lastUsedAngle && parsed.angle === source.lastUsedAngle);

    if (collides) {
      console.warn("[reel-cron] Apertura, sotto-argomento o angolo già usati di recente, rigenero");
      const angleNote = source.lastUsedAngle && parsed.angle === source.lastUsedAngle
        ? ` Hai anche scelto l'angolo "${parsed.angle}", identico all'ultima pubblicazione in assoluto — cambia angolo.`
        : "";
      const retryNote = `\nATTENZIONE: la tua prima bozza per questa richiesta iniziava con "${parsed.caption.split("\n")[0]}" ${source.sourceType === "standalone" ? "" : `e trattava il sotto-argomento "${parsed.subtopic ?? "n/d"}" `}— troppo simile a qualcosa già usato di recente.${angleNote} Riscrivi con un'apertura DAVVERO diversa.\n`;
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

  const subtopicToSave = source.sourceType === "standalone" ? (source.forcedSubtopic ?? null) : (parsed.subtopic ?? null);

  const { data: draft, error } = await supabase
    .from("social_posts")
    .insert({
      source_type: source.sourceType,
      source_id: source.sourceId,
      content_type: "reel",
      angle,
      subtopic: subtopicToSave,
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
  const fonteLabel =
    source.sourceType === "post" ? "articolo blog" : source.sourceType === "recipe" ? "ricetta" : "contenuto originale";

  const imageNote = imageUrl
    ? "🖼️ Immagine generata automaticamente — sostituiscila nel pannello se preferisci un video/foto tua.\n\n"
    : "";
  const recipeNote = suggestedRecipeTitle
    ? `\n\n💡 Ricetta suggerita aggiunta come bozza in "Ricette": ${suggestedRecipeTitle}`
    : "";

  await sendTelegramMessage(
    `🎬 <b>Nuovo Reel da revisionare</b>\n\nFonte: ${fonteLabel}${source.title ? ` — ${source.title}` : ""} · angolo: ${angle ?? "n/d"}\n\n${imageNote}${preview}${recipeNote}\n\n<a href="${adminUrl}">Apri nel pannello</a>`
  );

  console.log(`[reel-cron] Bozza creata (${draft.id}) fonte=${source.sourceType}:${source.sourceId} angolo=${angle}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  waitUntil(generateDraft());

  return NextResponse.json({ ok: true, started: true });
}
