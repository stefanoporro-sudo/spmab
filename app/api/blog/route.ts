import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — lista articoli (pubblica: solo pubblicati; admin: tutti)
export async function GET(req: NextRequest) {
  const admin = isAdmin(req);

  const query = supabase
    .from("posts")
    .select("id, title, slug, excerpt, content, category, cover_url, published, published_at, created_at")
    .order("created_at", { ascending: false });

  if (!admin) query.eq("published", true);

  const { data, error } = await query;

  if (error) {
    console.error("Blog GET error:", error);
    return NextResponse.json({ error: "Errore nel recupero articoli" }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}

// POST — crea nuovo articolo (solo admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, category, cover_url, published } = body;

  if (!title?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "Titolo e slug sono obbligatori" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() ?? "",
      content: content?.trim() ?? "",
      category: category ?? "Generale",
      cover_url: cover_url?.trim() ?? "",
      published: published ?? false,
      published_at: published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Blog POST error:", error);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug già esistente. Cambia il titolo o lo slug." }, { status: 409 });
    }
    return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
