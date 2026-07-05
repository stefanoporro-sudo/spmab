import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_url: string;
  published_at: string;
  created_at: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  Pizza: "bg-brand-500/15 text-brand-300 border-brand-500/20",
  Panificazione: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Consulenza: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Business: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  Generale: "bg-gray-500/15 text-gray-300 border-gray-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
  });
}

async function getLatestPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, cover_url, published_at, created_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);
  return (data as Post[]) ?? [];
}

export default async function UltimiArticoli() {
  const posts = await getLatestPosts();
  if (posts.length === 0) return null;

  return (
    <section className="py-24 px-6 border-t border-dark-700">
      <div className="max-w-7xl mx-auto">

        {/* Header sezione */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="section-subtitle mb-3">Aggiornamenti</p>
            <h2 className="font-display text-4xl font-bold text-white">
              Dal blog
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors group"
          >
            Tutti gli articoli
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Griglia articoli */}
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
              <article className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 h-full flex flex-col">
                {/* Immagine */}
                <div className="h-48 bg-dark-700 overflow-hidden flex-shrink-0">
                  {post.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-brand-400/20 w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Contenuto */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Generale}`}>
                      {post.category}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {formatDate(post.published_at ?? post.created_at)}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white mb-2 leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="inline-flex items-center gap-1.5 text-brand-400 group-hover:text-brand-300 text-xs font-semibold mt-4 transition-colors">
                    Leggi l&apos;articolo
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
