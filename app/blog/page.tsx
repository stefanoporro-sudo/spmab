"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
  Pizza: "bg-brand-500/15 text-brand-300",
  Panificazione: "bg-amber-500/15 text-amber-300",
  Consulenza: "bg-blue-500/15 text-blue-300",
  Business: "bg-purple-500/15 text-purple-300",
  Generale: "bg-gray-500/15 text-gray-300",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* Hero sezione blog */}
      <section className="pt-32 pb-16 px-6 border-b border-dark-700">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-300 text-sm transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            Torna al sito
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
              <BookOpen className="text-brand-400 w-5 h-5" />
            </div>
            <span className="text-brand-400 text-sm font-semibold uppercase tracking-widest">Blog</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Pizza, Pane &<br />
            <span className="gradient-text">Consulenza</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Consigli pratici, tecniche professionali e strategie per chi lavora
            con farina, lievito e passione.
          </p>
        </div>
      </section>

      {/* Lista articoli */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
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
            <div className="flex flex-col gap-8">
              {posts.map((post, i) => (
                <article
                  key={post.id}
                  className={`group bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 ${
                    i === 0 ? "md:flex" : ""
                  }`}
                >
                  {/* Immagine copertina (se presente) */}
                  {post.cover_url && (
                    <div
                      className={`bg-dark-700 overflow-hidden flex-shrink-0 ${
                        i === 0 ? "md:w-72 md:h-auto h-48" : "h-48"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Contenuto card */}
                  <div className="p-7 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.Generale
                          }`}
                        >
                          {post.category}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {formatDate(post.published_at ?? post.created_at)}
                        </span>
                      </div>

                      <h2
                        className={`font-display font-bold text-white mb-3 leading-snug group-hover:text-brand-300 transition-colors ${
                          i === 0 ? "text-2xl" : "text-xl"
                        }`}
                      >
                        {post.title}
                      </h2>

                      {post.excerpt && (
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-semibold mt-5 transition-colors group/link"
                    >
                      Leggi l&apos;articolo
                      <ArrowRight
                        size={15}
                        className="group-hover/link:translate-x-1 transition-transform"
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
