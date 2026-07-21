import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

const CRON_PATH: Record<string, string> = {
  post: "/api/cron/social",
  reel: "/api/cron/reel",
  linkedin: "/api/cron/linkedin",
};

// POST — rifiuta la bozza attuale (resta in storico per l'anti-ripetizione) e ne fa generare subito una nuova
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const { data: post, error: fetchError } = await supabase
    .from("social_posts")
    .select("content_type, scheduled_slot")
    .eq("id", id)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ error: "Post non trovato" }, { status: 404 });
  }

  const { error: rejectError } = await supabase
    .from("social_posts")
    .update({ status: "rejected" })
    .eq("id", id);

  if (rejectError) {
    console.error("Regenerate: errore nel rifiuto della bozza", rejectError);
    return NextResponse.json({ error: "Errore nel rifiuto della bozza" }, { status: 500 });
  }

  const cronPath = CRON_PATH[post.content_type];
  const url =
    post.content_type === "post"
      ? `https://www.consulenzapizzaiolo.it${cronPath}?slot=${post.scheduled_slot}`
      : `https://www.consulenzapizzaiolo.it${cronPath}`;

  try {
    const cronRes = await fetch(url, { headers: { "x-admin-password": process.env.ADMIN_PASSWORD ?? "" } });
    if (!cronRes.ok) {
      console.error("Regenerate: cron ha risposto con errore", await cronRes.text());
      return NextResponse.json({ error: "La bozza precedente è stata rifiutata, ma la rigenerazione non è partita correttamente" }, { status: 502 });
    }
  } catch (e) {
    console.error("Regenerate: errore chiamata cron", e);
    return NextResponse.json({ error: "La bozza precedente è stata rifiutata, ma la rigenerazione non è partita correttamente" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
