import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — lista post social (solo admin, mai pubblico)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Social GET error:", error);
    return NextResponse.json({ error: "Errore nel caricamento" }, { status: 500 });
  }

  return NextResponse.json({ posts: data });
}
