import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

// GET — lista thread visibili con conteggio risposte
export async function GET(req: NextRequest) {
  const admin = isAdmin(req);

  let query = supabase
    .from("forum_threads")
    .select("id, title, body, author_name, author_email, visible, pinned, created_at, forum_replies(count)")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (!admin) query = query.eq("visible", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Errore nel recupero" }, { status: 500 });

  const threads = (data ?? []).map((t) => ({
    ...t,
    reply_count: (t.forum_replies as unknown as { count: number }[])[0]?.count ?? 0,
    forum_replies: undefined,
  }));

  return NextResponse.json({ threads });
}

// POST — crea nuovo thread + notifica email a Stefano
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, body: text, author_name, author_email } = body;

  if (!title?.trim() || !text?.trim() || !author_name?.trim() || !author_email?.trim()) {
    return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("forum_threads")
    .insert({ title: title.trim(), body: text.trim(), author_name: author_name.trim(), author_email: author_email.trim() })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });

  // Email notifica a Stefano
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  if (resendKey) {
    const threadUrl = `https://www.consulenzapizzaiolo.it/community/${data.id}`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Community Consulenza Pizzaiolo <${fromEmail}>`,
        to: ["stefano@consulenzapizzaiolo.it"],
        reply_to: author_email,
        subject: `💬 Nuova discussione: ${title}`,
        html: `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<div style="max-width:540px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:24px 32px;">
    <div style="color:rgba(255,255,255,.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Community Forum</div>
    <div style="color:#fff;font-size:20px;font-weight:bold;">Nuova discussione</div>
  </div>
  <div style="padding:24px 32px;">
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Autore</div>
    <div style="font-weight:bold;margin-bottom:16px;">${author_name} &lt;${author_email}&gt;</div>
    <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Titolo</div>
    <div style="font-size:18px;font-weight:bold;color:#c8741e;margin-bottom:16px;">${title}</div>
    <div style="background:#f9f9f9;border-left:4px solid #c8741e;padding:14px 16px;border-radius:0 8px 8px 0;line-height:1.7;color:#333;">${text.replace(/\n/g, "<br>")}</div>
    <div style="margin-top:20px;text-align:center;">
      <a href="${threadUrl}" style="display:inline-block;background:#c8741e;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Vedi e rispondi →</a>
    </div>
  </div>
</div></body></html>`,
      }),
    });
  }

  return NextResponse.json({ thread: data }, { status: 201 });
}
