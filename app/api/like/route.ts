import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || !["post", "recipe"].includes(body.type) || !body.id) {
    return NextResponse.json({ error: "Parametri non validi" }, { status: 400 });
  }

  const { type, id } = body as { type: "post" | "recipe"; id: string };
  const table = type === "post" ? "posts" : "recipes";

  const { data: current } = await supabase
    .from(table)
    .select("likes_count")
    .eq("id", id)
    .single();

  if (!current) {
    return NextResponse.json({ error: "Contenuto non trovato" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from(table)
    .update({ likes_count: (current.likes_count ?? 0) + 1 })
    .eq("id", id)
    .select("likes_count")
    .single();

  if (error) {
    return NextResponse.json({ error: "Errore aggiornamento" }, { status: 500 });
  }

  return NextResponse.json({ likes_count: data.likes_count });
}
