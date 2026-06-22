import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "ricette";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "Nessun file" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Formato non supportato. Usa JPG, PNG o WebP." }, { status: 400 });
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return NextResponse.json({ error: `Massimo ${MAX_SIZE_MB}MB.` }, { status: 400 });

  const ext = file.name.split(".").pop();
  const safeName = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40);
  const fileName = `img-${Date.now()}-${safeName}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, Buffer.from(bytes), { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: "Errore nel caricamento" }, { status: 500 });

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return NextResponse.json({ url: urlData.publicUrl });
}
