import { ImageResponse } from "next/og";

export async function generateSocialCard(kicker: string, bullets: string[]): Promise<Buffer> {
  const bulletSize = bullets.length <= 3 ? 42 : 34;

  const imgRes = new ImageResponse(
    (
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
        <div
          style={{
            background: "#c8741e",
            padding: "44px 64px",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <span style={{ fontSize: 46, color: "#fff" }}>🍕</span>
          <span
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.9)",
              fontWeight: "bold",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px 70px",
            gap: 36,
          }}
        >
          {bullets.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <span style={{ fontSize: bulletSize, color: "#c8741e", fontWeight: "bold", lineHeight: 1.2 }}>•</span>
              <span style={{ fontSize: bulletSize, fontWeight: 600, color: "#3d2b1a", lineHeight: 1.3 }}>{b}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#3d2b1a",
            padding: "30px 64px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 24 }}>consulenzapizzaiolo.it</span>
          <span style={{ color: "#c8741e", fontSize: 24, fontWeight: "bold" }}>Stefano Porro</span>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );

  return Buffer.from(await imgRes.arrayBuffer());
}
