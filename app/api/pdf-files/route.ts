import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "ricette";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function checkAuth(req: Request) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// GET: lista tutti i PDF nel bucket
export async function GET(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const files = (data ?? [])
    .filter((f) => f.name.endsWith(".pdf"))
    .map((f) => {
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
      return { name: f.name, url: urlData.publicUrl };
    });

  return NextResponse.json({ files });
}

// POST: carica un PDF nel bucket
export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "Nessun file" }, { status: 400 });
  if (!file.name.endsWith(".pdf")) return NextResponse.json({ error: "Solo file PDF" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(file.name, buffer, { contentType: "application/pdf", upsert: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(file.name);

  return NextResponse.json({ url: urlData.publicUrl, name: file.name });
}
