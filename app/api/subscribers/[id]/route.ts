import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// PUT — modifica un iscritto (nome / email)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updateData: Record<string, unknown> = {};
  if (typeof body.name === "string") updateData.name = body.name.trim();
  if (typeof body.email === "string") updateData.email = body.email.trim();

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nessun dato da aggiornare" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("subscribers")
    .update(updateData)
    .eq("id", id)
    .select("id, name, email, subscribed_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Questa email è già iscritta" }, { status: 409 });
    }
    return NextResponse.json({ error: "Errore nell'aggiornamento" }, { status: 500 });
  }

  return NextResponse.json({ subscriber: data });
}

// DELETE — elimina un iscritto
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase.from("subscribers").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
