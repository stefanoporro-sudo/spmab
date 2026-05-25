import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "ricette";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

function checkAuth(req: Request | NextRequest) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

// GET: lista tutti i PDF nel bucket
export async function GET(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase.storage.from(BUCKET).list("", {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
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

// POST: carica un PDF nel bucket (nome unico con timestamp)
export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "Nessun file" }, { status: 400 });
  if (!file.name.endsWith(".pdf")) return NextResponse.json({ error: "Solo file PDF" }, { status: 400 });

  // Nome unico: timestamp + nome originale sanificato
  const safeName = file.name
    .replace(/\.pdf$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const fileName = `${Date.now()}-${safeName}.pdf`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, { contentType: "application/pdf", upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return NextResponse.json({ url: urlData.publicUrl, name: fileName });
}

// DELETE: elimina un PDF dal bucket
export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Nome file mancante" }, { status: 400 });

  const { error } = await supabase.storage.from(BUCKET).remove([name]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
