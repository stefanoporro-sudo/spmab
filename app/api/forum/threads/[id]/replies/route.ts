import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// POST — aggiunge una risposta al thread + notifica email a Stefano
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: thread_id } = await params;
  const body = await req.json();
  const { body: text, author_name, author_email } = body;
  const admin = isAdmin(req);

  if (!text?.trim() || !author_name?.trim() || !author_email?.trim()) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  // Recupera il thread per il titolo
  const { data: thread } = await supabase.from("forum_threads").select("title").eq("id", thread_id).single();

  const { data, error } = await supabase
    .from("forum_replies")
    .insert({
      thread_id,
      body: text.trim(),
      author_name: admin ? "Stefano Porro" : author_name.trim(),
      author_email: admin ? "stefano@consulenzapizzaiolo.it" : author_email.trim(),
      is_admin: admin,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });

  // Notifica email a Stefano (solo se non è lui che risponde)
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  if (resendKey && !admin) {
    const threadUrl = `https://www.consulenzapizzaiolo.it/community/${thread_id}`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Community Consulenza Pizzaiolo <${fromEmail}>`,
        to: ["stefano@consulenzapizzaiolo.it"],
        reply_to: author_email,
        subject: `💬 Nuova risposta da ${author_name}: "${thread?.title ?? "discussione"}"`,
        html: `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<div style="max-width:540px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:24px 32px;">
    <div style="color:rgba(255,255,255,.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Community Forum</div>
    <div style="color:#fff;font-size:20px;font-weight:bold;">Nuova risposta</div>
  </div>
  <div style="padding:24px 32px;">
    <div style="font-size:13px;color:#888;margin-bottom:4px;">Discussione</div>
    <div style="font-weight:bold;color:#c8741e;margin-bottom:16px;">${thread?.title ?? ""}</div>
    <div style="font-size:13px;color:#888;margin-bottom:4px;">Risposta di</div>
    <div style="font-weight:bold;margin-bottom:16px;">${author_name} &lt;${author_email}&gt;</div>
    <div style="background:#f9f9f9;border-left:4px solid #c8741e;padding:14px 16px;border-radius:0 8px 8px 0;line-height:1.7;color:#333;">${text.replace(/\n/g, "<br>")}</div>
    <div style="margin-top:20px;text-align:center;">
      <a href="${threadUrl}" style="display:inline-block;background:#c8741e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Vedi e rispondi →</a>
    </div>
  </div>
</div></body></html>`,
      }),
    });
  }

  return NextResponse.json({ reply: data }, { status: 201 });
}

// DELETE — admin: elimina singola risposta
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const body = await req.json();
  const { reply_id } = body;
  const { error } = await supabase.from("forum_replies").delete().eq("id", reply_id);
  if (error) return NextResponse.json({ error: "Errore eliminazione" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
