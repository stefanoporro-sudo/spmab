import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Lista di bot da ignorare
const BOT_PATTERNS = [
  "bot", "crawl", "spider", "slurp", "mediapartners",
  "googlebot", "bingbot", "yandex", "duckduck", "facebot",
  "ia_archiver", "semrush", "ahrefsbot", "mj12bot",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((p) => ua.includes(p));
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";
    if (isBot(userAgent)) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    const path: string = body.path || "/";
    const referrer: string | null = body.referrer || null;

    await supabase.from("page_views").insert({ path, referrer });

    return NextResponse.json({ ok: true });
  } catch {
    // Silent fail — il tracking non deve mai rompere il sito
    return NextResponse.json({ ok: true });
  }
}
