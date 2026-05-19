import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("subscribers")
    .select("id, name, email, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Errore nel recupero dati" }, { status: 500 });
  }

  return NextResponse.json({ subscribers: data });
}
