import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// PUT — modifica caption/immagine, approva o rifiuta (solo admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = { ...body };
  if (body.status === "approved") {
    updateData.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("social_posts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Social PUT error:", error);
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

// DELETE — rifiuta/elimina bozza (solo admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase.from("social_posts").delete().eq("id", id);

  if (error) {
    console.error("Social DELETE error:", error);
    return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
