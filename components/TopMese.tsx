"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

type TopPost = {
  post: {
    id: string;
    title: string;
    slug: string;
    category: string;
    cover_url: string;
    published_at: string;
    created_at: string;
  };
  views: number;
};

const MEDALS = ["🥇", "🥈", "🥉"];

const CATEGORY_COLORS: Record<string, string> = {
  Pizza: "bg-brand-500/15 text-brand-300 border-brand-500/20",
  Panificazione: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  Consulenza: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Business: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  Generale: "bg-gray-500/15 text-gray-300 border-gray-500/20",
};

export default function TopMese() {
  const [items, setItems] = useState<TopPost[]>([]);

  useEffect(() => {
    fetch("/api/blog/top")
      .then((r) => r.json())
      .then((d) => setItems(d.posts ?? []));
  }, []);

  if (items.length === 0) return null;

  const monthName = new Date().toLocaleDateString("it-IT", { month: "long" });

  return (
    <div className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
          <TrendingUp className="text-brand-400 w-4 h-4" />
        </div>
        <span className="text-white font-semibold text-base">
          Top di {monthName}
        </span>
        <div className="flex-1 h-px bg-dark-700" />
      </div>

      {/* Classifica */}
      <div className="grid sm:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <Link key={item.post.id} href={`/blog/${item.post.slug}`} className="block group">
            <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/5 flex gap-4 p-4 items-start">
              {/* Medaglia */}
              <span className="text-2xl flex-shrink-0 mt-0.5">{MEDALS[i]}</span>

              {/* Testo */}
              <div className="min-w-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-block mb-2 ${CATEGORY_COLORS[item.post.category] ?? CATEGORY_COLORS.Generale}`}>
                  {item.post.category}
                </span>
                <p className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
                  {item.post.title}
                </p>
                <p className="text-gray-600 text-xs mt-1.5">
                  {item.views} {item.views === 1 ? "visita" : "visite"} questo mese
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
