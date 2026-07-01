import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Errore nel recupero" }, { status: 500 });
  return NextResponse.json({ collaborators: data });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const { name, slug, bio, photo_url, specialty, city, active, sort_order } = body;

  if (!name || !slug) return NextResponse.json({ error: "Nome e slug obbligatori" }, { status: 400 });

  const { data, error } = await supabase
    .from("collaborators")
    .insert({ name, slug, bio: bio ?? "", photo_url: photo_url ?? "", specialty: specialty ?? "", city: city ?? "", active: active ?? true, sort_order: sort_order ?? 99 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ collaborator: data });
}
