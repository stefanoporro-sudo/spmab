import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — thread singolo con tutte le risposte
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = isAdmin(req);

  const { data: thread, error } = await supabase
    .from("forum_threads")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !thread) return NextResponse.json({ error: "Thread non trovato" }, { status: 404 });
  if (!admin && !thread.visible) return NextResponse.json({ error: "Non disponibile" }, { status: 404 });

  let repliesQuery = supabase
    .from("forum_replies")
    .select("*")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  if (!admin) repliesQuery = repliesQuery.eq("visible", true);

  const { data: replies } = await repliesQuery;

  return NextResponse.json({ thread, replies: replies ?? [] });
}

// PUT — admin: modifica thread (visible, pinned, body, title)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await supabase.from("forum_threads").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: "Errore aggiornamento" }, { status: 500 });
  return NextResponse.json({ thread: data });
}

// DELETE — admin: elimina thread e tutte le risposte (cascade)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabase.from("forum_threads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
