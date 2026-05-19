import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// Admin: update a recipe
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from("recipes")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
  return NextResponse.json({ recipe: data });
}

// Admin: delete a recipe
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from("recipes").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  return NextResponse.json({ success: true });
}
