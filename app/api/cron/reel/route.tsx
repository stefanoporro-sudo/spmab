import { NextRequest, NextResponse } from "next/server";
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

type SourceContent = {
  sourceType: "post" | "recipe";
  sourceId: string;
  title: string;
  summary: string;
};

async function pickSource(): Promise<SourceContent | null> {
  const { count } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true });
  const useRecipe = (count ?? 0) % 2 === 1;

  if (!useRecipe) {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, excerpt")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (!posts || posts.length === 0) return null;

    const { data: used } = await supabase
      .from("social_posts")
      .select("source_id, created_at")
      .eq("source_type", "post")
      .order("created_at", { ascending: true });
    const usedIds = new Set((used ?? []).map((u) => u.source_id));

    const fresh = posts.find((p) => !usedIds.has(p.id));
    const chosen = fresh ?? posts.find((p) => p.id === used?.[0]?.source_id) ?? posts[0];

    return { sourceType: "post", sourceId: chosen.id, title: chosen.title, summary: chosen.excerpt };
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, description, category")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (!recipes || recipes.length === 0) return null;

  const { data: used } = await supabase
    .from("social_posts")
    .select("source_id, created_at")
    .eq("source_type", "recipe")
    .order("created_at", { ascending: true });
  const usedIds = new Set((used ?? []).map((u) => u.source_id));

  const fresh = recipes.find((r) => !usedIds.has(r.id));
  const chosen = fresh ?? recipes.find((r) => r.id === used?.[0]?.source_id) ?? recipes[0];

  return {
    sourceType: "recipe",
    sourceId: chosen.id,
    title: chosen.title,
    summary: chosen.description || chosen.category,
  };
}

function extractJson(rawText: string): { caption: string; hashtags: string[] } {
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

const ANGLE_CATEGORIES = `1. Tecnica e impasto (idratazione, biga e poolish, temperatura dell'acqua, cornicione, autolisi, lievito madre, fermentazione, errori di cottura)
2. Ingredienti e materie prime (il pomodoro giusto, la mozzarella e l'umidità, farine alternative, stagionalità)
3. Attrezzatura e ambiente di lavoro (scelta del forno, cella frigorifera, attrezzi del pizzaiolo, la pala)
4. Business e gestione (food cost, il menù, marketing per pizzeria, recensioni online, gestione del personale)
5. Cultura e storia (storia del grano e delle farine, storia della pizza, differenze tra stili regionali italiani)
6. Ricette gourmet (abbinamenti non convenzionali, contaminazioni con l'alta cucina, pizze gourmet stagionali)`;

async function getRecentCaptions(limit: number): Promise<string[]> {
  const { data } = await supabase
    .from("social_posts")
    .select("caption, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => p.caption);
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

  const recentCaptions = await getRecentCaptions(5);
  const recentCaptionsBlock = recentCaptions.length
    ? recentCaptions.map((c, i) => `--- Caption ${i + 1} ---\n${c}`).join("\n\n")
    : "Nessuna caption precedente.";

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

Scrivi una caption per un Reel Instagram/Facebook a partire da questo contenuto del sito:
Titolo: ${source.title}
Sintesi: ${source.summary}

Le ultime 5 caption già pubblicate su post/reel (per NON ripetere lo stesso angolo/categoria):
${recentCaptionsBlock}

Gli angoli possibili sono questi 6:
${ANGLE_CATEGORIES}

Individua quale categoria dominano le caption recenti sopra, e scrivi questa caption con un angolo di una categoria DIVERSA — reinterpreta il contenuto del sito (titolo/sintesi) sotto quella lente, senza inventare fatti che non c'entrano con la fonte. Se il contenuto del sito si presta chiaramente solo a una categoria, va bene restare lì, ma cerca comunque un taglio narrativo diverso dalle caption recenti.

A differenza di un post normale, un Reel si guarda in video: le prime parole della caption devono funzionare da "gancio" che trattiene chi sta guardando (una domanda diretta, un'affermazione che rompe un luogo comune, o un "non fare X finché non guardi questo"). Testo breve, 80-150 parole, in italiano, tono onesto e diretto senza fuffa da corsi costosi. CTA finale verso consulenzapizzaiolo.it o l'invito a seguire Stefano. 5-8 hashtag pertinenti al mondo pizza/ristorazione.

REGOLE OBBLIGATORIE:
- Usa sempre "fermentazione" al posto di "maturazione" (parola vietata)
- NON affermare mai che la fermentazione migliora la digeribilità della pizza: è falso

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "caption": "testo della caption con eventuali a capo",
  "hashtags": ["hashtag1", "hashtag2"]
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

  let parsed: { caption: string; hashtags: string[] };
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

  const { data: draft, error } = await supabase
    .from("social_posts")
    .insert({
      source_type: source.sourceType,
      source_id: source.sourceId,
      content_type: "reel",
      caption,
      image_url: "",
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

  await sendTelegramMessage(
    `🎬 <b>Nuovo Reel da revisionare</b>\n\nFonte: ${source.sourceType === "post" ? "articolo blog" : "ricetta"} — ${source.title}\n\n${preview}\n\n<a href="${adminUrl}">Apri nel pannello</a>`
  );

  console.log(`[reel-cron] Bozza creata (${draft.id}) fonte=${source.sourceType}:${source.sourceId}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  waitUntil(generateDraft());

  return NextResponse.json({ ok: true, started: true });
}
