import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";
import { generateSocialCard } from "@/lib/social-image";

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

const ANGLES = ["tecnica", "ingredienti", "attrezzatura", "business", "storia", "gourmet", "miti", "faq", "avviare", "vita"] as const;
type Angle = (typeof ANGLES)[number];

const ANGLE_CATEGORIES = `1. tecnica — Tecnica e impasto (idratazione, biga e poolish, temperatura dell'acqua, cornicione, autolisi, lievito madre, fermentazione, errori di cottura)
2. ingredienti — Ingredienti e materie prime (il pomodoro giusto, la mozzarella e l'umidità, farine alternative, stagionalità)
3. attrezzatura — Attrezzatura e ambiente di lavoro (scelta del forno, cella frigorifera, attrezzi del pizzaiolo, la pala)
4. business — Business e gestione di una pizzeria già avviata (food cost, il menù, marketing, recensioni online, gestione del personale)
5. storia — Cultura e storia (storia del grano e delle farine, storia della pizza, differenze tra stili regionali italiani)
6. gourmet — Ricette gourmet (abbinamenti non convenzionali, contaminazioni con l'alta cucina, pizze gourmet stagionali)
7. miti — Miti e disinformazione sulla pizza (falsi miti generali, es. "il forno a legna è sempre meglio dell'elettrico", "la pizza gourmet è solo marketing")
8. faq — Domande frequenti dei clienti (perché costa di più, tempi di attesa, opzioni senza glutine, cosa chiedono spesso al banco)
9. avviare — Aprire e avviare una pizzeria (errori tipici dei primi mesi, business plan, scelte iniziali)
10. vita — Vita da pizzaiolo (dietro le quinte, giornata tipo, aneddoti personali)`;

type SourceContent = {
  sourceType: "post" | "recipe" | "standalone";
  sourceId: string | null;
  title: string;
  summary: string;
  usedAngles: Angle[];
  forcedAngle?: Angle;
};

async function pickLeastUsedAngle(): Promise<Angle> {
  const { data } = await supabase.from("social_posts").select("angle");
  const counts: Record<string, number> = Object.fromEntries(ANGLES.map((a) => [a, 0]));
  for (const row of data ?? []) {
    if (row.angle && counts[row.angle] !== undefined) counts[row.angle]++;
  }
  const min = Math.min(...ANGLES.map((a) => counts[a]));
  const tied = ANGLES.filter((a) => counts[a] === min);
  return tied[Math.floor(Math.random() * tied.length)];
}

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

  // 1 generazione su 3 pesca da blog/ricette (alternati), 2 su 3 sono contenuto standalone
  if (n % 3 !== 0) {
    const angle = await pickLeastUsedAngle();
    return { sourceType: "standalone", sourceId: null, title: "", summary: "", usedAngles: [], forcedAngle: angle };
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
    };
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, description, category")
    .eq("active", true);
  const result = await pickBestCandidate(recipes ?? [], "recipe");
  if (!result) return null;
  return {
    sourceType: "recipe",
    sourceId: result.chosen.id,
    title: result.chosen.title,
    summary: result.chosen.description || result.chosen.category,
    usedAngles: result.usedAngles,
  };
}

function extractJson(rawText: string): { caption: string; hashtags: string[]; angle: string } {
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

async function getRecentTopicHistory(): Promise<string> {
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

  return `Titoli di TUTTI gli articoli blog già pubblicati (compresi quelli non usati finora per i social):
${blogTitles}

Apertura delle ultime caption social/Reel già create (comprese quelle rifiutate da Stefano — se un argomento specifico è già qui, evitalo, vuol dire che è già stato trattato o non è piaciuto):
${socialSnippets}`;
}

function buildContentPrompt(source: SourceContent, history: string): string {
  const historyBlock = `${history}

IMPORTANTE: anche se l'angolo/categoria è diverso, NON ritrattare uno specifico argomento/tecnica (es. "autolisi", "biga e poolish") già coperto in dettaglio in uno dei titoli o caption sopra. Se il tema è già stato trattato, scegli un sotto-argomento distinto o un taglio narrativo chiaramente diverso.`;

  if (source.sourceType === "standalone") {
    return `Scrivi una caption per un Reel Instagram/Facebook come contenuto originale (non parte da un articolo specifico del sito), sul seguente angolo:

${ANGLE_CATEGORIES}

Angolo da trattare: "${source.forcedAngle}" (usa esattamente questo valore nel campo "angle" della risposta).

${historyBlock}

Scrivi un aneddoto storico verificabile, uno sfatamento di un mito comune, o un tip pratico su questo tema — mai inventare fatti falsi, se non sei sicuro di un dettaglio storico resta sul generico piuttosto che inventare date o nomi.`;
  }

  const avoidBlock = source.usedAngles.length
    ? `Angoli già usati per questa fonte (NON riusarli se possibile): ${source.usedAngles.join(", ")}.`
    : "Nessun angolo ancora usato per questa fonte.";

  return `Scrivi una caption per un Reel Instagram/Facebook a partire da questo contenuto del sito:
Titolo: ${source.title}
Sintesi: ${source.summary}

Gli angoli possibili sono questi 6:
${ANGLE_CATEGORIES}

${avoidBlock}
Scegli un angolo NON ancora usato per questa fonte (se ce n'è almeno uno libero) e dichiaralo nel campo "angle" della risposta con il suo codice (tecnica/ingredienti/attrezzatura/business/storia/gourmet/miti/faq/avviare/vita). Reinterpreta il contenuto del sito sotto quella lente, senza inventare fatti che non c'entrano con la fonte.

${historyBlock}`;
}

async function generateDraft() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error("[reel-cron] ANTHROPIC_API_KEY mancante");
    return;
  }

  const source = await pickSource();
  if (!source) {
    console.error("[reel-cron] Nessun contenuto disponibile (post/ricette)");
    return;
  }

  const history = await getRecentTopicHistory();
  const contentPrompt = buildContentPrompt(source, history);

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
      messages: [
        {
          role: "user",
          content: `Sei il social media manager di Stefano Porro, consulente pizzaiolo (consulenzapizzaiolo.it).

${contentPrompt}

A differenza di un post normale, un Reel si guarda in video: le prime parole della caption devono funzionare da "gancio" che trattiene chi sta guardando (una domanda diretta, un'affermazione che rompe un luogo comune, o un "non fare X finché non guardi questo"). Testo breve, 80-150 parole, in italiano, tono onesto e diretto senza fuffa da corsi costosi. CTA finale verso consulenzapizzaiolo.it o l'invito a seguire Stefano. 5-8 hashtag pertinenti al mondo pizza/ristorazione.

REGOLE OBBLIGATORIE:
- Usa sempre "fermentazione" al posto di "maturazione" (parola vietata)
- NON affermare mai che la fermentazione migliora la digeribilità della pizza: è falso

Aggiungi anche 3-4 punti chiave brevissimi (massimo 6-7 parole ciascuno) che riassumano il messaggio centrale della caption, da mettere in un'immagine di riepilogo.

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "caption": "testo della caption con eventuali a capo",
  "hashtags": ["hashtag1", "hashtag2"],
  "angle": "tecnica|ingredienti|attrezzatura|business|storia|gourmet|miti|faq|avviare|vita",
  "bullets": ["punto chiave 1", "punto chiave 2", "punto chiave 3"]
}`,
        },
      ],
    }),
  });

  if (!claudeRes.ok) {
    console.error("[reel-cron] Errore Claude API", await claudeRes.text());
    return;
  }

  const claudeData = await claudeRes.json();
  const rawText = (claudeData.content[0].text as string).trim();

  let parsed: { caption: string; hashtags: string[]; angle: string; bullets?: string[] };
  try {
    parsed = extractJson(rawText);
  } catch {
    console.error("[reel-cron] Claude non ha restituito JSON valido", rawText);
    return;
  }

  const sanitize = (t: string) =>
    t.replace(/\bMaturazione\b/g, "Fermentazione").replace(/\bmaturazione\b/g, "fermentazione");

  const hashtagsLine = parsed.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  const caption = `${sanitize(parsed.caption)}\n\n${hashtagsLine}`;
  const angle = ANGLES.includes(parsed.angle as Angle) ? parsed.angle : (source.forcedAngle ?? null);

  let imageUrl = "";
  try {
    const bullets = (parsed.bullets ?? []).slice(0, 4).map(sanitize);
    if (bullets.length) {
      const buffer = await generateSocialCard("Reel — Consulenza Pizzaiolo", bullets);
      const fileName = `img-${Date.now()}-card.png`;
      const { error: uploadErr } = await supabase.storage
        .from("social")
        .upload(fileName, buffer, { contentType: "image/png", upsert: false });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("social").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      } else {
        console.error("[reel-cron] Errore upload immagine:", uploadErr.message);
      }
    }
  } catch (e) {
    console.error("[reel-cron] Generazione immagine fallita:", e);
  }

  const { data: draft, error } = await supabase
    .from("social_posts")
    .insert({
      source_type: source.sourceType,
      source_id: source.sourceId,
      content_type: "reel",
      angle,
      caption,
      image_url: imageUrl,
      scheduled_slot: "19:00",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("[reel-cron] Errore Supabase", error.message);
    return;
  }

  const adminUrl = `https://www.consulenzapizzaiolo.it/admin?tab=social&edit=${draft.id}`;
  const preview = caption.length > 300 ? `${caption.slice(0, 300)}…` : caption;
  const fonteLabel =
    source.sourceType === "post" ? "articolo blog" : source.sourceType === "recipe" ? "ricetta" : "contenuto originale";

  const imageNote = imageUrl
    ? "🖼️ Immagine generata automaticamente — sostituiscila nel pannello se preferisci un video/foto tua.\n\n"
    : "";

  await sendTelegramMessage(
    `🎬 <b>Nuovo Reel da revisionare</b>\n\nFonte: ${fonteLabel}${source.title ? ` — ${source.title}` : ""} · angolo: ${angle ?? "n/d"}\n\n${imageNote}${preview}\n\n<a href="${adminUrl}">Apri nel pannello</a>`
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
