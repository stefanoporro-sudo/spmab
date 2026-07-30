import { ImageResponse } from "next/og";

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchStabilityImage(prompt: string, aspectRatio: string): Promise<string | null> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    console.log("[social-image] STABILITY_API_KEY non configurata, salto Stability AI");
    return null;
  }

  try {
    // Costruzione manuale del multipart/form-data (più affidabile in Vercel Node.js)
    const boundary = `StabilityBoundary${Date.now()}`;
    const CRLF = "\r\n";
    const field = (name: string, value: string) =>
      `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${value}${CRLF}`;

    const bodyStr = [
      field("prompt", prompt),
      field("aspect_ratio", aspectRatio),
      field("output_format", "jpeg"),
      `--${boundary}--${CRLF}`,
    ].join("");

    const bodyBuf = Buffer.from(bodyStr, "utf-8");

    console.log("[social-image] Chiamata Stability AI, prompt:", prompt.slice(0, 80));

    const res = await fetchWithTimeout(
      "https://api.stability.ai/v2beta/stable-image/generate/core",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "image/*",
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": String(bodyBuf.length),
        },
        body: bodyBuf,
      },
      20000
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[social-image] Stability AI error:", res.status, err);
      return null;
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buffer = await res.arrayBuffer();
    const b64 = Buffer.from(buffer).toString("base64");
    console.log(`[social-image] Stability AI OK: ${contentType}, ${buffer.byteLength} bytes`);
    return `data:${contentType};base64,${b64}`;
  } catch (e) {
    console.error("[social-image] Stability AI fetch failed:", e);
    return null;
  }
}

// Fallback: foto reale da Unsplash (gratuito, ma stile/luce non controllabili)
export async function fetchUnsplashImage(query: string): Promise<string | null> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetchWithTimeout(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&content_filter=high&client_id=${apiKey}`,
      { headers: { "Accept-Version": "v1" } },
      10000
    );
    if (!res.ok) return null;

    const data = (await res.json()) as { urls?: { regular?: string } };
    const imgUrl = data.urls?.regular;
    if (!imgUrl) return null;

    const photoRes = await fetchWithTimeout(imgUrl, {}, 10000);
    if (!photoRes.ok) return null;

    const mime = photoRes.headers.get("content-type") ?? "image/jpeg";
    const buf = await photoRes.arrayBuffer();
    return `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
  } catch (e) {
    console.error("[social-image] Unsplash fetch failed:", e);
    return null;
  }
}

type CoverOptions = {
  badgeLabel: string;
  headline: string;
  imagePrompt?: string;
  unsplashQuery?: string;
};

// Immagine di copertina per post/Reel/LinkedIn, stessa identità visiva delle copertine blog:
// foto reale (Stability AI, poi Unsplash come fallback gratuito) con overlay a gradiente, badge e
// titolo; fallback grafico se nessuna delle due è disponibile.
export async function generateSocialCoverImage(opts: CoverOptions): Promise<Buffer> {
  let photoDataUrl: string | null = null;
  if (opts.imagePrompt) {
    photoDataUrl = await fetchStabilityImage(opts.imagePrompt, "4:5");
  }
  if (!photoDataUrl && opts.unsplashQuery) {
    photoDataUrl = await fetchUnsplashImage(opts.unsplashQuery);
  }

  const titleLen = opts.headline.length;
  const titleSize = titleLen < 40 ? 62 : titleLen < 70 ? 50 : 40;

  const imgRes = new ImageResponse(
    photoDataUrl ? (
      <div
        style={{
          width: 1080,
          height: 1350,
          display: "flex",
          position: "relative",
          backgroundImage: `url(${photoDataUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.22) 35%, rgba(0,0,0,0.76) 65%, rgba(0,0,0,0.90) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ padding: "44px 48px", display: "flex" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "rgba(200,116,30,0.92)",
                padding: "10px 24px",
                borderRadius: 50,
              }}
            >
              <span style={{ fontSize: 22 }}>🍕</span>
              <span
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: "bold",
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                }}
              >
                {opts.badgeLabel}
              </span>
            </div>
          </div>

          <div style={{ padding: "0 56px 56px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: "bold",
                color: "#ffffff",
                lineHeight: 1.2,
                maxWidth: 960,
                textShadow: "0 2px 12px rgba(0,0,0,0.5)",
              }}
            >
              {opts.headline}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <div style={{ width: 4, height: 26, background: "#c8741e", borderRadius: 3 }} />
              <span style={{ fontSize: 19, color: "rgba(255,255,255,0.58)", letterSpacing: 1.2 }}>
                consulenzapizzaiolo.it
              </span>
            </div>
          </div>
        </div>
      </div>
    ) : (
      // Fallback grafico (nessuna foto disponibile)
      <div
        style={{
          width: 1080,
          height: 1350,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f7eede 0%, #efe0c4 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ background: "#c8741e", padding: "32px 48px", display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 40, color: "#fff" }}>🍕</span>
          <span
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.9)",
              fontWeight: "bold",
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            {opts.badgeLabel}
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
          <div style={{ fontSize: titleSize, fontWeight: "bold", color: "#3d2b1a", textAlign: "center", lineHeight: 1.25, maxWidth: 900 }}>
            {opts.headline}
          </div>
        </div>

        <div style={{ background: "#3d2b1a", padding: "22px 48px", display: "flex", justifyContent: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 19 }}>consulenzapizzaiolo.it</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );

  return Buffer.from(await imgRes.arrayBuffer());
}
