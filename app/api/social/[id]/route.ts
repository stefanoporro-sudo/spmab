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

function extractStoragePath(publicUrl: string | null, bucket: string): string | null {
  if (!publicUrl) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.slice(idx + marker.length);
}

// DELETE — elimina definitivamente una bozza (e il video/immagine associati sullo storage,
// per non far crescere inutilmente lo spazio occupato). A differenza di "Rifiuta" (status:
// rejected, riga mantenuta) questa è irreversibile e la riga esce dalla cronologia usata per
// l'anti-ripetizione degli argomenti — va usata quando si è sicuri di non volerci più tornare.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const { data: post } = await supabase.from("social_posts").select("video_url, image_url").eq("id", id).single();

  const videoPath = extractStoragePath(post?.video_url ?? null, "reels");
  if (videoPath) await supabase.storage.from("reels").remove([videoPath]);

  const imagePath = extractStoragePath(post?.image_url ?? null, "social");
  if (imagePath) await supabase.storage.from("social").remove([imagePath]);

  const { error } = await supabase.from("social_posts").delete().eq("id", id);

  if (error) {
    console.error("Social DELETE error:", error);
    return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
