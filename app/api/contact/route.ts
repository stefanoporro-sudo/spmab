import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { name, email, phone, service, message } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  // Salva la richiesta su Supabase prima di tutto, così il lead non si perde
  // anche se l'invio email dovesse fallire per qualche motivo
  const { error: dbError } = await supabase
    .from("contact_requests")
    .insert({ name, email, phone, service, message });
  if (dbError) console.error("[contact] Errore salvataggio Supabase:", dbError);

  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? "stefano@consulenzapizzaiolo.it";
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";

  if (!resendKey) {
    return NextResponse.json({ error: "Configurazione email mancante" }, { status: 500 });
  }

  // Email di notifica a Stefano
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `SPMAB Contatti <${fromEmail}>`,
      to: [adminEmail],
      reply_to: email,
      subject: `Nuova richiesta di consulenza da ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
          <h2 style="color:#d47e28;">Nuova richiesta di consulenza</h2>
          <table style="border-collapse:collapse;width:100%;margin-bottom:16px;">
            <tr>
              <td style="padding:10px 8px;font-weight:bold;color:#555;width:140px;">Nome:</td>
              <td style="padding:10px 8px;">${name}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px 8px;font-weight:bold;color:#555;">Email:</td>
              <td style="padding:10px 8px;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 8px;font-weight:bold;color:#555;">Telefono:</td>
              <td style="padding:10px 8px;">${phone || "Non fornito"}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:10px 8px;font-weight:bold;color:#555;">Servizio:</td>
              <td style="padding:10px 8px;">${service || "Non specificato"}</td>
            </tr>
          </table>
          <div style="background:#f5f0e8;border-left:4px solid #d47e28;padding:16px;border-radius:4px;">
            <p style="margin:0;font-weight:bold;color:#555;margin-bottom:8px;">Messaggio:</p>
            <p style="margin:0;line-height:1.6;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="margin-top:24px;color:#888;font-size:12px;">
            Puoi rispondere direttamente a questa email per contattare ${name}.
          </p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Errore nell'invio email" }, { status: 500 });
  }

  // Email di conferma al cliente
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Stefano Porro - SPMAB <${fromEmail}>`,
      to: [email],
      subject: "Abbiamo ricevuto la tua richiesta — SPMAB",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#d47e28;">Ciao ${name}, grazie per averci contattato!</h2>
          <p>Ho ricevuto la tua richiesta e ti risponderò entro <strong>24 ore lavorative</strong>.</p>
          <div style="background:#f5f0e8;border-left:4px solid #d47e28;padding:16px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;font-style:italic;color:#555;">"${message.substring(0, 200)}${message.length > 200 ? "..." : ""}"</p>
          </div>
          <p>Nel frattempo, puoi visitare il sito per scoprire tutti i miei servizi:</p>
          <p>
            <a href="https://spmab.vercel.app"
               style="display:inline-block;background:#d47e28;color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:bold;">
              Visita SPMAB →
            </a>
          </p>
          <p style="margin-top:32px;color:#888;font-size:12px;">
            — Stefano Porro, SPMAB<br>
            Consulenza professionale per Pizzaioli, Molini e Startup
          </p>
        </div>
      `,
    }),
  });

  return NextResponse.json({ success: true });
}
