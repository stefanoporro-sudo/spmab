import { NextRequest, NextResponse } from "next/server";

// Invia un'email via Resend. Protetto da password admin.
// Usato dall'operazione ricorrente che genera gli articoli del blog.
export async function POST(req: NextRequest) {
  if (req.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  let body: { subject?: string; html?: string; text?: string; to?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const { subject, html, text } = body;
  if (!subject || (!html && !text)) {
    return NextResponse.json({ error: "subject e html/text sono obbligatori" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  // Destinatario: porroste80@gmail.com (override possibile via body.to)
  const toEmail = body.to ?? process.env.ADMIN_EMAIL ?? "porroste80@gmail.com";

  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY mancante" }, { status: 500 });
  }

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Consulenza Pizzaiolo Blog <${fromEmail}>`,
      to: [toEmail],
      subject,
      ...(html ? { html } : {}),
      ...(text ? { text } : {}),
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error("Notify email error:", err);
    return NextResponse.json({ error: "Errore invio email", detail: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true, to: toEmail });
}
