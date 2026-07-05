import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import LikeButton from "@/components/LikeButton";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string;
  published: boolean;
  published_at: string;
  created_at: string;
  likes_count: number;
};

async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return data as Post;
}

// SEO dinamico per ogni articolo
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Articolo non trovato" };
  }

  const siteUrl = "https://www.consulenzapizzaiolo.it";
  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url,
      type: "article",
      publishedTime: post.published_at,
      locale: "it_IT",
      ...(post.cover_url ? { images: [{ url: post.cover_url }] } : {}),
    },
  };
}

// Renderer semplice per il contenuto (nessuna libreria esterna)
function renderContent(content: string) {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Titolo H2
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="font-display text-2xl font-bold text-white mt-10 mb-4"
        >
          {trimmed.slice(3)}
        </h2>
      );
    }

    // Titolo H3
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="font-display text-xl font-semibold text-white mt-8 mb-3"
        >
          {trimmed.slice(4)}
        </h3>
      );
    }

    // Lista puntata
    const lines = trimmed.split("\n");
    if (lines.length > 0 && lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={i} className="my-5 space-y-2 pl-4">
          {lines.map((l, j) => (
            <li
              key={j}
              className="text-gray-300 leading-relaxed flex gap-3"
            >
              <span className="text-brand-400 mt-1 flex-shrink-0">•</span>
              <span>{l.trim().slice(2)}</span>
            </li>
          ))}
        </ul>
      );
    }

    // Lista numerata
    if (lines.length > 0 && lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
      return (
        <ol key={i} className="my-5 space-y-2 pl-4">
          {lines.map((l, j) => (
            <li key={j} className="text-gray-300 leading-relaxed flex gap-3">
              <span className="text-brand-400 font-semibold flex-shrink-0 min-w-[1.5rem]">
                {j + 1}.
              </span>
              <span>{l.trim().replace(/^\d+\.\s/, "")}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Citazione / blockquote
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={i}
          className="my-6 border-l-4 border-brand-500 pl-5 py-1"
        >
          <p className="text-gray-300 italic leading-relaxed">
            {trimmed.slice(2)}
          </p>
        </blockquote>
      );
    }

    // Paragrafo normale (con preservazione delle singole righe)
    return (
      <p key={i} className="text-gray-300 leading-relaxed my-4">
        {lines.map((line, j) => (
          <span key={j}>
            {line}
            {j < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <article className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-10 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-brand-300 transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-700">/</span>
            <Link
              href="/blog"
              className="text-gray-500 hover:text-brand-300 transition-colors"
            >
              Blog
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-400 truncate max-w-[200px]">
              {post.title}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-500/15 text-brand-300 px-3 py-1.5 rounded-full">
              <Tag size={11} />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar size={11} />
              {formatDate(post.published_at ?? post.created_at)}
            </span>
          </div>

          {/* Titolo */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-400 text-lg leading-relaxed mb-8 border-b border-dark-600 pb-8">
              {post.excerpt}
            </p>
          )}

          {/* Immagine copertina */}
          {post.cover_url && (
            <div className="mb-10 rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.cover_url}
                alt={post.title}
                className="w-full"
              />
            </div>
          )}

          {/* Contenuto */}
          <div className="prose-custom">
            {renderContent(post.content)}
          </div>

          {/* Footer articolo */}
          <div className="mt-14 pt-8 border-t border-dark-600">
            <div className="mb-6">
              <LikeButton type="post" id={post.id} initialCount={post.likes_count ?? 0} />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-display font-bold">S</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Stefano Porro</div>
                  <div className="text-gray-500 text-sm">
                    Consulente Pizzeria & Panificazione
                  </div>
                </div>
              </div>
              <Link
                href="/#contatti"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105"
              >
                Prenota una consulenza
              </Link>
            </div>
          </div>

          {/* Torna al blog */}
          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-300 text-sm transition-colors"
            >
              <ArrowLeft size={15} />
              Torna al blog
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
