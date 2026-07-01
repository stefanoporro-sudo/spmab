import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Public: fetch all active recipes
export async function GET() {
  const { data, error } = await supabase
    .from("recipes")
    .select("*, collaborators(id, name, slug)")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Errore nel recupero ricette" }, { status: 500 });
  return NextResponse.json({ recipes: data });
}

// Admin: create a new recipe
export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const body = await req.json();
  const { title, category, description, level, file_url, active, sort_order, collaborator_id } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "Titolo e categoria sono obbligatori" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("recipes")
    .insert({ title, category, description, level, file_url, active: active ?? true, sort_order: sort_order ?? 99, collaborator_id: collaborator_id ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore nella creazione" }, { status: 500 });
  return NextResponse.json({ recipe: data });
}
