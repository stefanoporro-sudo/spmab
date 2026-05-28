import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  // Ultime 200 visite
  const { data: recentViews } = await supabase
    .from("page_views")
    .select("path, referrer, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  // Totali per i ultimi 7 giorni
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: weekViews } = await supabase
    .from("page_views")
    .select("path, created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  // Raggruppa per giorno
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = 0;
  }
  for (const v of weekViews ?? []) {
    const key = v.created_at.slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const dailyTotals = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

  // Top pages (ultimi 30 giorni)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: monthViews } = await supabase
    .from("page_views")
    .select("path")
    .gte("created_at", thirtyDaysAgo.toISOString());

  const pageCounts: Record<string, number> = {};
  for (const v of monthViews ?? []) {
    pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
  }
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Totale del mese
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: monthlyTotal } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  // Totale di oggi
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const { count: todayTotal } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfToday.toISOString());

  return NextResponse.json({
    recentViews: recentViews ?? [],
    dailyTotals,
    topPages,
    monthlyTotal: monthlyTotal ?? 0,
    todayTotal: todayTotal ?? 0,
  });
}
