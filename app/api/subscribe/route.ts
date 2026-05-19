import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Nome e email sono richiesti" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("subscribers").upsert(
    {
      name,
      email,
      subscribed_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio. Riprova." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
