import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// PUT — modifica articolo (solo admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Se si pubblica ora, imposta published_at
  const updateData: Record<string, unknown> = { ...body };
  if (body.published === true) {
    // Controlla se era già pubblicato per non sovrascrivere la data originale
    const { data: existing } = await supabase.from("posts").select("published_at, published").eq("id", id).single();
    if (!existing?.published) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Blog PUT error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug già esistente" }, { status: 409 });
    }
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

// DELETE — elimina articolo (solo admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    console.error("Blog DELETE error:", error);
    return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
