"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import TopMese from "@/components/TopMese";

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
    year: "numeric",
  });
}

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Generale;
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colors}`}>
      {category}
    </span>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* Hero sezione blog */}
      <section className="pt-32 pb-12 px-6 border-b border-dark-700">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-300 text-sm transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            Torna al sito
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center">
                  <BookOpen className="text-brand-400 w-4 h-4" />
                </div>
                <span className="text-brand-400 text-sm font-semibold uppercase tracking-widest">Blog</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                Pizza, Pane &{" "}
                <span className="gradient-text">Consulenza</span>
              </h1>
            </div>
            <p className="text-gray-400 text-base max-w-xs leading-relaxed">
              Tecniche professionali e strategie per chi lavora con farina, lievito e passione.
            </p>
          </div>
        </div>
      </section>

      {/* Contenuto */}
      <section className="py-14 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="text-brand-400 w-8 h-8 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-600 flex items-center justify-center mx-auto mb-5">
                <BookOpen className="text-gray-600 w-7 h-7" />
              </div>
              <p className="text-gray-500 text-lg mb-2">Nessun articolo ancora pubblicato.</p>
              <p className="text-gray-600 text-sm">Torna presto per i primi contenuti!</p>
            </div>
          ) : (
            <div className="space-y-10">

              {/* Top del mese */}
              <TopMese />

              {/* Articolo in evidenza */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="block group">
                  <article className="bg-dark-800 border border-dark-600 rounded-3xl overflow-hidden hover:border-brand-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/8 md:grid md:grid-cols-[1fr_420px]">
                    {/* Immagine */}
                    <div className="relative h-64 md:h-full bg-dark-700 overflow-hidden">
                      {featured.cover_url ? (
                        <img
                          src={featured.cover_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="text-brand-400/20 w-16 h-16" />
                        </div>
                      )}
                      {/* Badge "In evidenza" */}
                      <div className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                        In evidenza
                      </div>
                    </div>

                    {/* Testo */}
                    <div className="p-8 md:p-10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <CategoryBadge category={featured.category} />
                          <span className="text-gray-600 text-xs">
                            {formatDate(featured.published_at ?? featured.created_at)}
                          </span>
                        </div>

                        <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-4 leading-tight group-hover:text-brand-300 transition-colors">
                          {featured.title}
                        </h2>

                        {featured.excerpt && (
                          <p className="text-gray-400 text-base leading-relaxed line-clamp-4">
                            {featured.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="inline-flex items-center gap-2 text-brand-400 group-hover:text-brand-300 text-sm font-semibold mt-8 transition-colors">
                        Leggi l&apos;articolo
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Griglia articoli */}
              {rest.length > 0 && (
                <>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
                      Tutti gli articoli
                    </span>
                    <div className="flex-1 h-px bg-dark-700" />
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                        <article className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 h-full flex flex-col">
                          {/* Immagine */}
                          <div className="h-52 bg-dark-700 overflow-hidden flex-shrink-0">
                            {post.cover_url ? (
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
                              <CategoryBadge category={post.category} />
                              <span className="text-gray-600 text-xs">
                                {formatDate(post.published_at ?? post.created_at)}
                              </span>
                            </div>

                            <h2 className="font-display text-lg font-bold text-white mb-2 leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
                              {post.title}
                            </h2>

                            {post.excerpt && (
                              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="inline-flex items-center gap-1.5 text-brand-400 group-hover:text-brand-300 text-xs font-semibold mt-4 transition-colors">
                              Leggi
                              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </>
              )}

            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
