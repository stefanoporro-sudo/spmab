"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, ArrowLeft, Trash2, FileText, ChefHat } from "lucide-react";
import { getSavedItems, type SavedItem } from "@/components/SaveButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SalvatiPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(getSavedItems());
    setLoaded(true);
  }, []);

  function remove(type: string, id: string) {
    const updated = items.filter((i) => !(i.type === type && i.id === id));
    localStorage.setItem("spmab_saved", JSON.stringify(updated));
    setItems(updated);
  }

  const posts = items.filter((i) => i.type === "post");
  const recipes = items.filter((i) => i.type === "recipe");

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-300 text-sm transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          Torna al sito
        </Link>

        {/* Titolo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
            <Bookmark className="text-brand-400 w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white">I miei salvati</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {loaded ? `${items.length} element${items.length === 1 ? "o" : "i"} salvat${items.length === 1 ? "o" : "i"}` : ""}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {loaded && items.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-600 flex items-center justify-center mx-auto mb-5">
              <Bookmark className="text-gray-600 w-7 h-7" />
            </div>
            <p className="text-gray-400 text-lg font-semibold mb-2">Nessun contenuto salvato</p>
            <p className="text-gray-600 text-sm mb-8">
              Clicca "Salva" su un articolo o una ricetta per ritrovarli qui.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/blog" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105">
                <FileText size={15} />
                Vai al blog
              </Link>
              <Link href="/ricette" className="inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-600 text-gray-200 font-semibold px-5 py-2.5 rounded-full text-sm transition-all border border-dark-600">
                <ChefHat size={15} />
                Vai alle ricette
              </Link>
            </div>
          </div>
        )}

        {/* Articoli salvati */}
        {posts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={15} className="text-brand-400" />
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Articoli</span>
              <div className="flex-1 h-px bg-dark-700" />
            </div>
            <div className="flex flex-col gap-3">
              {posts.map((item) => (
                <div key={item.id} className="bg-dark-800 border border-dark-600 rounded-2xl px-5 py-4 flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={15} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={item.url} className="text-white font-semibold text-sm hover:text-brand-300 transition-colors line-clamp-1">
                      {item.title}
                    </Link>
                    <p className="text-gray-600 text-xs mt-0.5">Salvato il {formatDate(item.savedAt)}</p>
                  </div>
                  <button
                    onClick={() => remove(item.type, item.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                    aria-label="Rimuovi dai salvati"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ricette salvate */}
        {recipes.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ChefHat size={15} className="text-brand-400" />
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Ricette</span>
              <div className="flex-1 h-px bg-dark-700" />
            </div>
            <div className="flex flex-col gap-3">
              {recipes.map((item) => (
                <div key={item.id} className="bg-dark-800 border border-dark-600 rounded-2xl px-5 py-4 flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <ChefHat size={15} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={item.url} className="text-white font-semibold text-sm hover:text-brand-300 transition-colors line-clamp-1">
                      {item.title}
                    </Link>
                    <p className="text-gray-600 text-xs mt-0.5">Salvata il {formatDate(item.savedAt)}</p>
                  </div>
                  <button
                    onClick={() => remove(item.type, item.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                    aria-label="Rimuovi dai salvati"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
