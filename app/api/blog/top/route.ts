import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  // Visite a /blog/* nel mese corrente
  const { data: views } = await supabase
    .from("page_views")
    .select("path")
    .like("path", "/blog/%")
    .gte("created_at", startOfMonth.toISOString());

  if (!views || views.length === 0) {
    return NextResponse.json({ posts: [] });
  }

  // Conteggio visite per path
  const pathCounts: Record<string, number> = {};
  for (const v of views) {
    // esclude /blog (lista) — solo articoli singoli
    if (v.path === "/blog") continue;
    pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
  }

  // Top 3 slug per visite
  const topSlugs = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([path]) => path.replace("/blog/", ""));

  if (topSlugs.length === 0) {
    return NextResponse.json({ posts: [] });
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, category, cover_url, published_at, created_at")
    .in("slug", topSlugs)
    .eq("published", true);

  // Riordina secondo la classifica visite
  const ordered = topSlugs
    .map((slug) => ({
      post: posts?.find((p) => p.slug === slug),
      views: pathCounts[`/blog/${slug}`] ?? 0,
    }))
    .filter((item) => item.post != null);

  return NextResponse.json({ posts: ordered });
}
