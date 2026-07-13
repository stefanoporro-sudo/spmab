import { NextRequest, NextResponse } from "next/server";

const REDIRECT_URI = "https://www.consulenzapizzaiolo.it/api/auth/linkedin/callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error, description: req.nextUrl.searchParams.get("error_description") }, { status: 400 });
  }

  if (!state || state !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "State non valido" }, { status: 401 });
  }

  if (!code) {
    return NextResponse.json({ error: "Nessun code ricevuto" }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "LINKEDIN_CLIENT_ID o LINKEDIN_CLIENT_SECRET mancanti" }, { status: 500 });
  }

  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Errore scambio token", detail: tokenData }, { status: 500 });
  }

  const userRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  return NextResponse.json({
    access_token: tokenData.access_token,
    expires_in_days: Math.round(tokenData.expires_in / 86400),
    member_urn: userData.sub ? `urn:li:person:${userData.sub}` : null,
    name: userData.name,
  });
}
