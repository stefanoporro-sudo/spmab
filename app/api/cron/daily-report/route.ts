import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Nomi leggibili per le pagine
const PAGE_LABELS: Record<string, string> = {
  "/": "🏠 Homepage",
  "/blog": "📝 Blog",
  "/ricette": "🍕 Ricette",
  "/consulenza-molini": "🌾 Consulenza Molini",
  "/consulenza-pizzaioli": "👨‍🍳 Consulenza Pizzaioli",
};

function pageName(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/blog/")) return `📄 Blog: ${path.replace("/blog/", "")}`;
  if (path.startsWith("/ricette/")) return `🍕 Ricetta: ${path.replace("/ricette/", "")}`;
  return path;
}

export async function GET(req: NextRequest) {
  // Verifica il cron secret (Vercel lo invia automaticamente)
  // Oppure accetta ?token=<CRON_SECRET> per test manuali dal browser
  const authHeader = req.headers.get("authorization");
  const tokenParam = req.nextUrl.searchParams.get("token");
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    !cronSecret ||
    authHeader === `Bearer ${cronSecret}` ||
    tokenParam === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Calcolo date ---
  // Ieri (giorno completo UTC, corrispondente all'ora italiana)
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const startOfYesterday = new Date(
    Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 0, 0, 0)
  );
  const endOfYesterday = new Date(
    Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate(), 23, 59, 59)
  );

  // Inizio mese corrente
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );

  // --- Query: visite di ieri ---
  const { data: yesterdayViews } = await supabase
    .from("page_views")
    .select("path, referrer, created_at")
    .gte("created_at", startOfYesterday.toISOString())
    .lte("created_at", endOfYesterday.toISOString());

  const totalYesterday = yesterdayViews?.length ?? 0;

  // Conteggio per pagina
  const pageCounts: Record<string, number> = {};
  for (const v of yesterdayViews ?? []) {
    pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  // Provenienza traffico (referrer)
  const referrerCounts: Record<string, number> = {};
  for (const v of yesterdayViews ?? []) {
    if (v.referrer) {
      try {
        const hostname = new URL(v.referrer).hostname.replace("www.", "");
        referrerCounts[hostname] = (referrerCounts[hostname] || 0) + 1;
      } catch {
        referrerCounts["diretto"] = (referrerCounts["diretto"] || 0) + 1;
      }
    } else {
      referrerCounts["diretto"] = (referrerCounts["diretto"] || 0) + 1;
    }
  }
  const topReferrers = Object.entries(referrerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // --- Query: visite del mese ---
  const { count: monthlyTotal } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  // --- Query: nuovi iscritti ieri ---
  const { count: newSubscribers } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .gte("subscribed_at", startOfYesterday.toISOString())
    .lte("subscribed_at", endOfYesterday.toISOString());

  // --- Query: totale iscritti ---
  const { count: totalSubscribers } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true });

  // --- Costruzione email HTML ---
  const dateStr = yesterday.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Rome",
  });
  const dateStrShort = yesterday.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Rome",
  });

  const topPagesHtml =
    topPages.length > 0
      ? topPages
          .map(
            ([path, count], i) => `
        <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"};">
          <td style="padding:10px 14px;font-size:14px;color:#333;">${pageName(path)}</td>
          <td style="padding:10px 14px;text-align:center;font-size:14px;font-weight:bold;color:#d47e28;">${count}</td>
          <td style="padding:10px 14px;text-align:center;font-size:13px;color:#888;">
            ${totalYesterday > 0 ? Math.round((count / totalYesterday) * 100) : 0}%
          </td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="3" style="padding:16px;color:#888;text-align:center;font-size:14px;">Nessuna visita registrata ieri</td></tr>`;

  const topReferrersHtml =
    topReferrers.length > 0
      ? topReferrers
          .map(
            ([source, count], i) => `
        <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"};">
          <td style="padding:8px 14px;font-size:13px;color:#333;">${source === "diretto" ? "🔗 Diretto / Digitato" : `🌐 ${source}`}</td>
          <td style="padding:8px 14px;text-align:center;font-size:13px;font-weight:bold;color:#555;">${count}</td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="2" style="padding:12px;color:#888;text-align:center;font-size:13px;">—</td></tr>`;

  const trend = totalYesterday === 0 ? "😶" : totalYesterday < 5 ? "📉" : totalYesterday < 20 ? "📊" : "🚀";

  const html = `
<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#d47e28,#b86a1e);padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <div style="width:40px;height:40px;background:rgba(255,255,255,0.25);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;">📊</div>
        <div>
          <div style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Consulenza Pizzaiolo</div>
          <div style="color:#fff;font-size:20px;font-weight:bold;">Report Giornaliero</div>
        </div>
      </div>
      <div style="color:rgba(255,255,255,0.85);font-size:14px;margin-top:4px;">
        Statistiche di <strong style="color:#fff;">${dateStr}</strong>
      </div>
    </div>

    <!-- KPI Cards -->
    <div style="padding:24px 32px 8px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:130px;background:#fff8f0;border:1px solid #f5ddb0;border-radius:10px;padding:16px 18px;text-align:center;">
          <div style="font-size:30px;font-weight:bold;color:#d47e28;">${totalYesterday} ${trend}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Visite ieri</div>
        </div>
        <div style="flex:1;min-width:130px;background:#f8f8f8;border:1px solid #eee;border-radius:10px;padding:16px 18px;text-align:center;">
          <div style="font-size:30px;font-weight:bold;color:#444;">${monthlyTotal ?? 0}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Visite questo mese</div>
        </div>
        <div style="flex:1;min-width:130px;background:#f0f9f0;border:1px solid #b8ddb8;border-radius:10px;padding:16px 18px;text-align:center;">
          <div style="font-size:30px;font-weight:bold;color:#2a7a2a;">+${newSubscribers ?? 0}</div>
          <div style="font-size:12px;color:#888;margin-top:4px;">Nuovi iscritti ieri</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:10px;color:#aaa;font-size:12px;">
        Totale iscritti alla newsletter: <strong style="color:#555;">${totalSubscribers ?? 0}</strong>
      </div>
    </div>

    <!-- Top Pages -->
    <div style="padding:20px 32px 8px;">
      <div style="font-size:15px;font-weight:bold;color:#333;margin-bottom:10px;">📄 Pagine più visitate — ${dateStrShort}</div>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #eee;">
        <thead>
          <tr style="background:#f5f0e8;">
            <th style="padding:10px 14px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Pagina</th>
            <th style="padding:10px 14px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Visite</th>
            <th style="padding:10px 14px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">%</th>
          </tr>
        </thead>
        <tbody>${topPagesHtml}</tbody>
      </table>
    </div>

    <!-- Traffic Sources -->
    <div style="padding:20px 32px 8px;">
      <div style="font-size:15px;font-weight:bold;color:#333;margin-bottom:10px;">🔀 Provenienza del traffico</div>
      <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #eee;">
        <thead>
          <tr style="background:#f5f0e8;">
            <th style="padding:8px 14px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Fonte</th>
            <th style="padding:8px 14px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Visite</th>
          </tr>
        </thead>
        <tbody>${topReferrersHtml}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="padding:24px 32px 32px;">
      <a href="https://www.consulenzapizzaiolo.it/admin"
         style="display:block;text-align:center;background:#d47e28;color:#fff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:bold;font-size:15px;">
        Apri il Pannello Admin →
      </a>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9;border-top:1px solid #eee;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#aaa;">
        Consulenza Pizzaiolo — Stefano Porro<br/>
        <a href="https://www.consulenzapizzaiolo.it" style="color:#d47e28;text-decoration:none;">consulenzapizzaiolo.it</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  // --- Invio email via Resend ---
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const toEmail = process.env.ADMIN_EMAIL ?? "porroste80@gmail.com";

  if (!resendKey) {
    console.error("RESEND_API_KEY mancante");
    return NextResponse.json({ error: "RESEND_API_KEY mancante" }, { status: 500 });
  }

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Consulenza Pizzaiolo Stats <${fromEmail}>`,
      to: [toEmail],
      subject: `📊 ${totalYesterday} visite ieri — Report ${dateStrShort}`,
      html,
    }),
  });

  if (!emailRes.ok) {
    const err = await emailRes.text();
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Errore invio email", detail: err }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    date: dateStr,
    totalYesterday,
    monthlyTotal,
    newSubscribers,
    topPages,
  });
}
