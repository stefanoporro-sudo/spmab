import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateSocialCard } from "@/lib/social-image";

export const maxDuration = 60;

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

function extractJson(rawText: string): { bullets: string[] } {
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  return JSON.parse(rawText.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await req.json();
  const { data: post, error: fetchError } = await supabase.from("social_posts").select("*").eq("id", id).single();
  if (fetchError || !post) {
    return NextResponse.json({ error: "Post non trovato" }, { status: 404 });
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY mancante" }, { status: 500 });
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
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Riassumi questa caption social in 3-4 punti chiave brevissimi (massimo 6-7 parole ciascuno):\n\n${post.caption}\n\nRispondi SOLO con questo JSON: { "bullets": ["punto 1", "punto 2", "punto 3"] }`,
        },
      ],
    }),
  });

  if (!claudeRes.ok) {
    return NextResponse.json({ error: "Errore Claude API" }, { status: 500 });
  }

  const claudeData = await claudeRes.json();
  const rawText = (claudeData.content[0].text as string).trim();
  const { bullets } = extractJson(rawText);

  const kicker = post.content_type === "reel" ? "Reel — Consulenza Pizzaiolo" : "Post — Consulenza Pizzaiolo";
  const buffer = await generateSocialCard(kicker, bullets.slice(0, 4));
  const fileName = `img-${Date.now()}-backfill-${id.slice(0, 8)}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("social")
    .upload(fileName, buffer, { contentType: "image/png", upsert: false });
  if (uploadErr) {
    return NextResponse.json({ error: "Errore upload", detail: uploadErr.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("social").getPublicUrl(fileName);
  await supabase.from("social_posts").update({ image_url: urlData.publicUrl }).eq("id", id);

  return NextResponse.json({ image_url: urlData.publicUrl, bullets });
}
