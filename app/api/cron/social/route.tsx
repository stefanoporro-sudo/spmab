import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";

const VALID_SLOTS = ["11:00", "16:00", "19:00"];

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

async function generateDraft(slot: string) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error("[social-cron] ANTHROPIC_API_KEY mancante");
    return;
  }

  const source = await pickSource();
  if (!source) {
    console.error("[social-cron] Nessun contenuto disponibile (post/ricette)");
    return;
  }

  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Sei il social media manager di Stefano Porro, consulente pizzaiolo (consulenzapizzaiolo.it).

Scrivi una caption per un post Instagram/Facebook a partire da questo contenuto del sito:
Titolo: ${source.title}
Sintesi: ${source.summary}

Tono onesto e diretto, niente fuffa da corsi costosi, coerente con un brand che smonta le mode. 150-300 parole, in italiano, con una CTA finale verso consulenzapizzaiolo.it o l'invito a seguire Stefano. 5-8 hashtag pertinenti al mondo pizza/ristorazione.

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
    console.error("[social-cron] Errore Claude API", await claudeRes.text());
    return;
  }

  const claudeData = await claudeRes.json();
  const rawText = (claudeData.content[0].text as string).trim();

  let parsed: { caption: string; hashtags: string[] };
  try {
    parsed = extractJson(rawText);
  } catch {
    console.error("[social-cron] Claude non ha restituito JSON valido", rawText);
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
      caption,
      image_url: "",
      scheduled_slot: slot,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("[social-cron] Errore Supabase", error.message);
    return;
  }

  const adminUrl = `https://www.consulenzapizzaiolo.it/admin?tab=social&edit=${draft.id}`;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

  if (resendKey) {
    const emailHtml = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:28px 32px;">
      <div style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Post social — slot ${slot}</div>
      <div style="color:#fff;font-size:22px;font-weight:bold;">Nuova bozza da revisionare</div>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#888;font-style:italic;font-size:13px;margin:0 0 16px;">Fonte: ${source.sourceType === "post" ? "articolo blog" : "ricetta"} — ${source.title}</p>
      <div style="font-size:15px;color:#333;white-space:pre-wrap;line-height:1.6;">${caption}</div>
    </div>
    <div style="margin:0 32px 24px;padding:20px;background:#fff8f0;border:1px solid #f5ddb0;border-radius:8px;text-align:center;">
      <div style="font-size:14px;color:#555;margin-bottom:16px;">
        📸 Manca ancora l'immagine — caricala nel pannello prima di poter approvare e pubblicare.
      </div>
      <a href="${adminUrl}" style="display:inline-block;background:#c8741e;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Apri nel pannello →
      </a>
    </div>
  </div>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Social Consulenza Pizzaiolo <${fromEmail}>`,
        to: ["porroste80@gmail.com"],
        subject: `Nuovo post social da revisionare (${slot})`,
        html: emailHtml,
      }),
    });
  }

  console.log(`[social-cron] Bozza creata (${draft.id}) fonte=${source.sourceType}:${source.sourceId} slot=${slot}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") ?? "11:00";
  if (!VALID_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Slot non valido" }, { status: 400 });
  }

  waitUntil(generateDraft(slot));

  return NextResponse.json({ ok: true, started: true, slot });
}
