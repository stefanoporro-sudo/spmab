"use client";

import { useState, useEffect } from "react";
import { Download, ChefHat, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";

type Recipe = {
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  file_url: string;
  image_url: string;
  active: boolean;
  sort_order: number;
  likes_count: number;
  collaborators: { id: string; name: string; slug: string } | null;
};

const levelColor: Record<string, string> = {
  Base: "bg-green-500/15 text-green-300",
  Intermedio: "bg-yellow-500/15 text-yellow-300",
  Avanzato: "bg-red-500/15 text-red-300",
};

export default function RicettePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((d) => setRecipes(d.recipes ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="border-b border-dark-700 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-brand-300 transition-colors text-sm">
            <ArrowLeft size={16} />
            Torna al sito
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-white">Consulenza Pizzaiolo</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Page header */}
        <div className="text-center mb-14">
          <p className="section-subtitle mb-4">Risorse Gratuite</p>
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            Ricette <span className="gradient-text">Professionali</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Ricette testate da Stefano Porro per pizzaioli e panificatori professionali.
            Scaricale gratuitamente in formato PDF.
          </p>
        </div>

        {/* Recipe cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-400 w-8 h-8 animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Nessuna ricetta disponibile al momento. Torna presto!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {recipes.map((r) => (
              <div key={r.id} className="group bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:border-brand-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 flex flex-col">
                {/* Immagine */}
                {r.image_url ? (
                  <div className="w-full h-60 overflow-hidden flex-shrink-0">
                    <img
                      src={r.image_url}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-60 bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <ChefHat className="text-brand-400/30 w-14 h-14" />
                  </div>
                )}

                <div className="flex flex-col gap-3 p-6 flex-1">
                  {/* Badge livello e categoria */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/20 px-2.5 py-1 rounded-full">
                      {r.category}
                    </span>
                    {r.level && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        r.level === "Base"
                          ? "bg-green-500/10 text-green-300 border-green-500/20"
                          : r.level === "Intermedio"
                          ? "bg-yellow-500/10 text-yellow-300 border-yellow-500/20"
                          : "bg-red-500/10 text-red-300 border-red-500/20"
                      }`}>
                        {r.level}
                      </span>
                    )}
                  </div>

                  <h3 className="text-white font-semibold text-lg leading-snug">
                    {r.title}
                  </h3>

                  {r.description && (
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1">
                      {r.description}
                    </p>
                  )}

                  {r.collaborators ? (
                    <Link href={`/collaboratori/${r.collaborators.slug}`}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      di {r.collaborators.name}
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-600">di Stefano Porro</span>
                  )}

                  <LikeButton type="recipe" id={r.id} initialCount={r.likes_count ?? 0} />

                  {/* CTA download */}
                  {r.file_url ? (
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="mt-2 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25"
                    >
                      <Download size={15} />
                      Scarica ricetta PDF
                    </a>
                  ) : (
                    <div className="mt-2 flex items-center justify-center gap-2 bg-dark-700 text-gray-500 px-4 py-3 rounded-xl text-sm">
                      PDF in arrivo
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
