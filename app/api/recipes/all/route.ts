import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Admin only: fetch ALL recipes including hidden ones
export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: "Errore nel recupero ricette" }, { status: 500 });
  return NextResponse.json({ recipes: data });
}
