import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — pubblico: solo attive | admin: tutte
export async function GET(req: NextRequest) {
  const admin = isAdmin(req);

  const query = supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!admin) query.eq("active", true);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: "Errore nel recupero" }, { status: 500 });
  return NextResponse.json({ testimonials: data });
}

// POST — crea nuova testimonianza (solo admin)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await req.json();
  const { name, role, stars, text, active, sort_order } = body;

  if (!name?.trim() || !text?.trim()) {
    return NextResponse.json({ error: "Nome e testo sono obbligatori" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("testimonials")
    .insert({ name: name.trim(), role: role?.trim() ?? "", stars: stars ?? 5, text: text.trim(), active: active ?? true, sort_order: sort_order ?? 99 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
  return NextResponse.json({ testimonial: data }, { status: 201 });
}
