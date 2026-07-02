import { NextRequest, NextResponse } from "next/server";

function isAdmin(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  const igUserId = process.env.META_IG_USER_ID;
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!token) {
    return NextResponse.json({ error: "META_PAGE_ACCESS_TOKEN non impostato" }, { status: 500 });
  }

  const permsRes = await fetch(`https://graph.facebook.com/v21.0/me/permissions?access_token=${token}`);
  const perms = await permsRes.json();

  const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${token}`);
  const me = await meRes.json();

  const accountsRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${token}`);
  const accountsRaw = await accountsRes.json();
  const accounts = {
    data: (accountsRaw.data ?? []).map((a: Record<string, unknown>) => ({ id: a.id, name: a.name, has_access_token: !!a.access_token })),
  };

  let debugToken = null;
  if (appId && appSecret) {
    const debugRes = await fetch(
      `https://graph.facebook.com/v21.0/debug_token?input_token=${token}&access_token=${appId}|${appSecret}`
    );
    debugToken = await debugRes.json();
  }

  return NextResponse.json({ pageId, igUserId, me, perms, accounts, debugToken });
}
