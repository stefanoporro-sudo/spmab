import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function sendEmails(name: string, email: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL ?? "stefano@consulenzapizzaiolo.it";
  const fromEmail = process.env.FROM_EMAIL ?? "noreply@spmab.it";

  if (!resendKey) return;

  // Email di notifica a Stefano
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `SPMAB Notifiche <${fromEmail}>`,
      to: [adminEmail],
      subject: `Nuova iscrizione: ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#d47e28;">Nuova iscrizione ricevuta</h2>
          <p>Un nuovo utente si è iscritto per scaricare le ricette:</p>
          <table style="border-collapse:collapse;width:100%;">
            <tr>
              <td style="padding:8px;font-weight:bold;color:#555;">Nome:</td>
              <td style="padding:8px;">${name}</td>
            </tr>
            <tr style="background:#f9f9f9;">
              <td style="padding:8px;font-weight:bold;color:#555;">Email:</td>
              <td style="padding:8px;">${email}</td>
            </tr>
            <tr>
              <td style="padding:8px;font-weight:bold;color:#555;">Data:</td>
              <td style="padding:8px;">${new Date().toLocaleString("it-IT")}</td>
            </tr>
          </table>
          <p style="margin-top:24px;color:#888;font-size:12px;">
            Accedi al pannello admin per vedere tutti gli iscritti.
          </p>
        </div>
      `,
    }),
  });

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
      subject: "Le tue ricette professionali SPMAB sono pronte!",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#d47e28;">Ciao ${name}, benvenuto/a in SPMAB!</h2>
          <p>Grazie per esserti iscritto/a. Le tue ricette professionali sono ora disponibili per il download.</p>
          <p>
            <a href="https://spmab.vercel.app/ricette"
               style="display:inline-block;background:#d47e28;color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:bold;">
              Scarica le ricette →
            </a>
          </p>
          <p style="margin-top:24px;color:#555;">
            Hai domande o vuoi una consulenza gratuita?<br>
            Rispondi a questa email o contattami su:
            <a href="https://spmab.vercel.app/#contatti" style="color:#d47e28;">spmab.vercel.app</a>
          </p>
          <p style="margin-top:32px;color:#888;font-size:12px;">
            — Stefano Porro, SPMAB<br>
            Consulenza professionale per Pizzaioli, Molini e Startup
          </p>
        </div>
      `,
    }),
  });
}

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Nome e email sono richiesti" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("subscribers").upsert(
    { name, email, subscribed_at: new Date().toISOString() },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio. Riprova." },
      { status: 500 }
    );
  }

  // Invia email in background (non blocca la risposta)
  sendEmails(name, email).catch(console.error);

  return NextResponse.json({ success: true });
}
