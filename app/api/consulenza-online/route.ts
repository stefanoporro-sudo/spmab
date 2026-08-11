import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, piva, company, topic, packages, notes } = body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !topic?.trim()) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  const numPackages = parseInt(packages) || 1;
  const pricePerPack = numPackages >= 2 ? 179 : 199;
  const totalPrice = pricePerPack * numPackages;
  const discount = numPackages >= 2 ? "Sconto 10% applicato" : "";

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const adminEmail = "stefano@consulenzapizzaiolo.it";

  // 1. Salva in subscribers per la newsletter (ignora se email già presente)
  await supabase.from("subscribers").upsert(
    { name: name.trim(), email: email.trim().toLowerCase() },
    { onConflict: "email", ignoreDuplicates: true }
  );

  if (!resendKey) {
    return NextResponse.json({ error: "Configurazione email mancante" }, { status: 500 });
  }

  // 2. Email di notifica a Stefano
  const notifyRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Consulenza On Line <${fromEmail}>`,
      to: [adminEmail],
      reply_to: email,
      subject: `Nuova richiesta Consulenza On Line da ${name}`,
      html: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:28px 32px;">
      <div style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Consulenza On Line</div>
      <div style="color:#fff;font-size:22px;font-weight:bold;">Nuova richiesta di consulenza</div>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 8px;color:#888;font-size:13px;width:140px;">Nome</td><td style="padding:10px 8px;font-weight:bold;">${name}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:10px 8px;color:#888;font-size:13px;">Email</td><td style="padding:10px 8px;"><a href="mailto:${email}" style="color:#c8741e;">${email}</a></td></tr>
        <tr><td style="padding:10px 8px;color:#888;font-size:13px;">Telefono</td><td style="padding:10px 8px;">${phone}</td></tr>
        ${company ? `<tr style="background:#f9f9f9;"><td style="padding:10px 8px;color:#888;font-size:13px;">Azienda</td><td style="padding:10px 8px;">${company}</td></tr>` : ""}
        ${piva ? `<tr><td style="padding:10px 8px;color:#888;font-size:13px;">P.IVA</td><td style="padding:10px 8px;">${piva}</td></tr>` : ""}
        <tr style="background:#f9f9f9;"><td style="padding:10px 8px;color:#888;font-size:13px;">Pacchetti</td><td style="padding:10px 8px;font-weight:bold;">${numPackages} × 199€ ${discount ? `— <span style="color:#c8741e;">${discount}</span>` : ""}</td></tr>
        <tr><td style="padding:10px 8px;color:#888;font-size:13px;">Totale</td><td style="padding:10px 8px;font-size:18px;font-weight:bold;color:#c8741e;">€${totalPrice}</td></tr>
      </table>
      <div style="margin-top:20px;background:#fff8f0;border-left:4px solid #c8741e;padding:16px;border-radius:0 8px 8px 0;">
        <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Argomento da studiare</div>
        <p style="margin:0;line-height:1.7;color:#333;">${topic.replace(/\n/g, "<br>")}</p>
      </div>
      ${notes ? `<div style="margin-top:14px;background:#f9f9f9;padding:14px;border-radius:8px;"><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Note aggiuntive</div><p style="margin:0;line-height:1.7;color:#555;">${notes.replace(/\n/g, "<br>")}</p></div>` : ""}
    </div>
    <div style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#aaa;">Rispondi a questa email per contattare direttamente ${name}</p>
    </div>
  </div>
</body>
</html>`,
    }),
  });

  if (!notifyRes.ok) {
    return NextResponse.json({ error: "Errore nell'invio email" }, { status: 500 });
  }

  // 3. Email di conferma al cliente
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Stefano Porro — Consulenza Pizzaiolo <${fromEmail}>`,
      to: [email],
      subject: "Richiesta ricevuta — Consulenza On Line",
      html: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:520px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:28px 32px;">
      <div style="color:#fff;font-size:22px;font-weight:bold;">Ciao ${name}!</div>
      <div style="color:rgba(255,255,255,0.85);font-size:15px;margin-top:6px;">Ho ricevuto la tua richiesta di consulenza online.</div>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#333;line-height:1.7;">Grazie per aver scelto la consulenza on line. Ti contatterò entro <strong>24 ore lavorative</strong> per concordare le date e i dettagli delle sessioni.</p>
      <div style="background:#fff8f0;border:1px solid #f5ddb0;border-radius:10px;padding:20px;margin:20px 0;">
        <div style="font-weight:bold;color:#c8741e;margin-bottom:12px;">Riepilogo richiesta</div>
        <div style="font-size:14px;color:#555;line-height:2;">
          📦 Pacchetti richiesti: <strong>${numPackages}</strong><br/>
          ⏱ Durata: <strong>${numPackages} session${numPackages === 1 ? "e tecnica" : "i tecniche"} da 90 minuti${numPackages > 1 ? ", una per pacchetto" : ""}</strong><br/>
          💰 Totale: <strong style="color:#c8741e;">€${totalPrice}${numPackages >= 2 ? " (sconto 10% applicato)" : ""}</strong><br/>
          🎓 Attestato di merito: <strong>incluso</strong>
        </div>
      </div>
      <p style="color:#555;line-height:1.7;">Nel frattempo, puoi consultare gli articoli del blog per approfondire gli argomenti che ti interessano.</p>
      <a href="https://www.consulenzapizzaiolo.it/blog" style="display:inline-block;background:#c8741e;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-top:8px;">Vai al Blog →</a>
    </div>
    <div style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#aaa;">Consulenza Pizzaiolo — Stefano Porro<br/><a href="https://www.consulenzapizzaiolo.it" style="color:#c8741e;text-decoration:none;">consulenzapizzaiolo.it</a></p>
    </div>
  </div>
</body>
</html>`,
    }),
  });

  return NextResponse.json({ ok: true });
}
