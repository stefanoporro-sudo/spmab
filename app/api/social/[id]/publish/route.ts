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

async function getPageAccessToken(pageId: string, userToken: string): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}?fields=access_token&access_token=${userToken}`
  );
  const data = await res.json();
  if (!res.ok || !data.access_token) throw classifyMetaError("fb_page_token", data);
  return data.access_token;
}

async function publishToFacebook(imageUrl: string, caption: string) {
  const pageId = process.env.META_PAGE_ID;
  const userToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageId || !userToken) throw new MetaApiError("fb_config", "other", null, "META_PAGE_ID o META_PAGE_ACCESS_TOKEN mancanti");

  // La Pagina è gestita tramite un portfolio business: /me/accounts non la restituisce,
  // va richiesto il suo access_token direttamente sul nodo della Pagina.
  const pageToken = await getPageAccessToken(pageId, userToken);

  const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: imageUrl, caption, access_token: pageToken }),
  });
  const data = await res.json();
  if (!res.ok) throw classifyMetaError("fb_publish", data);

  return data;
}

const LINKEDIN_VERSION = "202401";

class LinkedInApiError extends Error {
  kind: "token" | "other";
  raw: unknown;
  constructor(kind: "token" | "other", raw: unknown, message: string) {
    super(message);
    this.kind = kind;
    this.raw = raw;
  }
}

async function publishToLinkedIn(imageUrl: string, caption: string) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const memberUrn = process.env.LINKEDIN_MEMBER_URN;
  if (!token || !memberUrn) {
    throw new LinkedInApiError("other", null, "LINKEDIN_ACCESS_TOKEN o LINKEDIN_MEMBER_URN mancanti");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "LinkedIn-Version": LINKEDIN_VERSION,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };

  const initRes = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers,
    body: JSON.stringify({ initializeUploadRequest: { owner: memberUrn } }),
  });
  const initData = await initRes.json();
  if (!initRes.ok) {
    const isTokenError = initRes.status === 401;
    throw new LinkedInApiError(isTokenError ? "token" : "other", initData, initData?.message ?? "Errore nell'avvio upload immagine LinkedIn");
  }

  const uploadUrl = initData.value.uploadUrl;
  const imageUrn = initData.value.image;

  const imageRes = await fetch(imageUrl);
  const imageBuffer = await imageRes.arrayBuffer();
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    throw new LinkedInApiError("other", null, "Errore nel caricamento dell'immagine su LinkedIn");
  }

  const postRes = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers,
    body: JSON.stringify({
      author: memberUrn,
      commentary: caption,
      visibility: "PUBLIC",
      distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { id: imageUrn } },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  if (!postRes.ok) {
    const postData = await postRes.json().catch(() => null);
    const isTokenError = postRes.status === 401;
    throw new LinkedInApiError(isTokenError ? "token" : "other", postData, postData?.message ?? "Errore nella pubblicazione del post LinkedIn");
  }

  const postId = postRes.headers.get("x-restli-id");
  return { id: postId };
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

  if (post.content_type === "linkedin") {
    if (dryRun) {
      await supabase.from("social_posts").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
      return NextResponse.json({ linkedin: { success: true, data: { id: "dry-run-linkedin" } }, status: "published" });
    }
    try {
      const data = await publishToLinkedIn(post.image_url, post.caption);
      await supabase
        .from("social_posts")
        .update({ status: "published", published_at: new Date().toISOString(), error_message: null })
        .eq("id", id);
      return NextResponse.json({ linkedin: { success: true, data }, status: "published" });
    } catch (e) {
      const err = e instanceof LinkedInApiError ? e : new LinkedInApiError("other", null, String(e));
      await supabase.from("social_posts").update({ status: "failed", error_message: err.message }).eq("id", id);
      if (err.kind === "token") {
        await sendUrgentEmail(
          "Token LinkedIn scaduto",
          "La pubblicazione su LinkedIn è fallita per token scaduto. Rifai l'autorizzazione OAuth e aggiorna LINKEDIN_ACCESS_TOKEN su Vercel."
        );
      }
      return NextResponse.json({ linkedin: { success: false, error: err.message }, status: "failed" }, { status: 500 });
    }
  }

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
