import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { supabase } from "@/lib/supabase";

function readContextFile(name: string): string {
  try {
    return readFileSync(path.join(process.cwd(), ".claude", "context", name), "utf-8");
  } catch {
    return "";
  }
}

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: totalPosts },
    { count: publishedPosts },
    { count: totalSubscribers },
    { count: totalRecipes },
    { count: viewsThisMonth },
    { count: socialDrafts },
    { count: forumThreads },
    { count: contactRequests },
  ] = await Promise.all([
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("subscribers").select("*", { count: "exact", head: true }),
    supabase.from("recipes").select("*", { count: "exact", head: true }),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    supabase.from("social_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("forum_threads").select("*", { count: "exact", head: true }),
    supabase.from("contact_requests").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
  ]);

  return NextResponse.json({
    metrics: {
      totalPosts: totalPosts ?? 0,
      publishedPosts: publishedPosts ?? 0,
      totalSubscribers: totalSubscribers ?? 0,
      totalRecipes: totalRecipes ?? 0,
      viewsThisMonth: viewsThisMonth ?? 0,
      socialDrafts: socialDrafts ?? 0,
      forumThreads: forumThreads ?? 0,
      contactRequestsThisMonth: contactRequests ?? 0,
      generatedAt: new Date().toISOString(),
    },
    context: {
      founder: readContextFile("founder.md"),
      appMobile: readContextFile("app-mobile.md"),
    },
  });
}
