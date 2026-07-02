import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const GRAPH_VERSION = "v21.0";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

type MetaErrorKind = "token" | "rate_limit" | "timeout" | "other";

class MetaApiError extends Error {
  kind: MetaErrorKind;
  step: string;
  raw: unknown;
  constructor(step: string, kind: MetaErrorKind, raw: unknown, message: string) {
    super(message);
    this.step = step;
    this.kind = kind;
    this.raw = raw;
  }
}

function classifyMetaError(step: string, raw: { error?: { code?: number; message?: string } }): MetaApiError {
  const code = raw?.error?.code;
  if (code === 190) {
    return new MetaApiError(step, "token", raw, "Token Meta scaduto o non valido — rigeneralo da developers.facebook.com e aggiorna META_PAGE_ACCESS_TOKEN su Vercel");
  }
  if (code === 4 || code === 32) {
    return new MetaApiError(step, "rate_limit", raw, "Limite richieste Meta raggiunto, riprova più tardi");
  }
  return new MetaApiError(step, "other", raw, raw?.error?.message ?? "Errore Meta API sconosciuto");
}

async function waitForContainerReady(creationId: string, token: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${creationId}?fields=status_code&access_token=${token}`
    );
    const data = await res.json();
    if (!res.ok) throw classifyMetaError("ig_status_check", data);
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") {
      throw new MetaApiError("ig_status_check", "other", data, "Instagram ha segnalato un errore nell'elaborazione del media");
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new MetaApiError("ig_status_check", "timeout", null, "Immagine non ancora processata da Instagram, riprova tra 1-2 minuti");
}

async function publishToInstagram(imageUrl: string, caption: string) {
  const igUserId = process.env.META_IG_USER_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!igUserId || !token) throw new MetaApiError("ig_config", "other", null, "META_IG_USER_ID o META_PAGE_ACCESS_TOKEN mancanti");

  const createRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw classifyMetaError("ig_create", createData);

  await waitForContainerReady(createData.id, token);

  const publishRes = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: createData.id, access_token: token }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok) throw classifyMetaError("ig_publish", publishData);

  return publishData;
}

async function publishToFacebook(imageUrl: string, caption: string) {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) throw new MetaApiError("fb_config", "other", null, "META_PAGE_ID o META_PAGE_ACCESS_TOKEN mancanti");

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl, caption, access_token: token }),
  });
  const data = await res.json();
  if (!res.ok) throw classifyMetaError("fb_publish", data);

  return data;
}

async function sendUrgentEmail(subject: string, message: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  if (!resendKey) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: `Social Consulenza Pizzaiolo <${fromEmail}>`,
      to: ["porroste80@gmail.com"],
      subject: `⚠️ ${subject}`,
      html: `<p>${message}</p>`,
    }),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const { id } = await params;

  const { data: post, error: fetchError } = await supabase.from("social_posts").select("*").eq("id", id).single();
  if (fetchError || !post) {
    return NextResponse.json({ error: "Post non trovato" }, { status: 404 });
  }
  if (!post.image_url) {
    return NextResponse.json({ error: "Carica un'immagine prima di pubblicare" }, { status: 400 });
  }

  const dryRun = process.env.SOCIAL_DRY_RUN === "true";
  const platforms: string[] = post.platforms ?? ["instagram", "facebook"];

  const results: Record<string, { success: boolean; data?: unknown; error?: string }> = {};

  const tasks = platforms.map(async (platform) => {
    if (dryRun) {
      return { platform, success: true, data: { id: `dry-run-${platform}` } };
    }
    try {
      const data =
        platform === "instagram"
          ? await publishToInstagram(post.image_url, post.caption)
          : await publishToFacebook(post.image_url, post.caption);
      return { platform, success: true, data };
    } catch (e) {
      const err = e instanceof MetaApiError ? e : new MetaApiError(platform, "other", null, String(e));
      return { platform, success: false, error: err };
    }
  });

  const settled = await Promise.all(tasks);

  let allSucceeded = true;
  let hasTimeout = false;
  const errorMessages: string[] = [];

  for (const r of settled) {
    if (r.success) {
      results[r.platform] = { success: true, data: r.data };
    } else {
      allSucceeded = false;
      const err = r.error as MetaApiError;
      results[r.platform] = { success: false, error: err.message };
      errorMessages.push(`${r.platform}: ${err.message}`);
      if (err.kind === "timeout") hasTimeout = true;
      if (err.kind === "token") {
        await sendUrgentEmail(
          "Token Meta scaduto",
          `La pubblicazione su ${r.platform} è fallita per token scaduto. Rigeneralo da developers.facebook.com e aggiorna META_PAGE_ACCESS_TOKEN su Vercel.`
        );
      }
    }
  }

  const finalStatus = allSucceeded ? "published" : hasTimeout ? "approved" : "failed";

  const updateData: Record<string, unknown> = {
    status: finalStatus,
    ig_result: results.instagram ?? post.ig_result,
    fb_result: results.facebook ?? post.fb_result,
    error_message: allSucceeded ? null : errorMessages.join(" | "),
  };
  if (finalStatus === "published") {
    updateData.published_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase.from("social_posts").update(updateData).eq("id", id);
  if (updateError) {
    console.error("Social publish update error:", updateError);
    return NextResponse.json({ error: "Pubblicato ma salvataggio stato fallito", detail: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ instagram: results.instagram, facebook: results.facebook, status: finalStatus });
}
