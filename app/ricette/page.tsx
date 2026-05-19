"use client";

import { useState, useEffect } from "react";
import { Download, Lock, CheckCircle, ArrowLeft, ChefHat, Loader2 } from "lucide-react";
import Link from "next/link";

type Recipe = {
  id: string;
  title: string;
  category: string;
  description: string;
  level: string;
  file_url: string;
  active: boolean;
  sort_order: number;
};

const levelColor: Record<string, string> = {
  Base: "bg-green-500/15 text-green-300",
  Intermedio: "bg-yellow-500/15 text-yellow-300",
  Avanzato: "bg-red-500/15 text-red-300",
};

export default function RicettePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);

  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((d) => setRecipes(d.recipes ?? []))
      .finally(() => setLoadingRecipes(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Errore. Riprova.");
      return;
    }

    setUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="border-b border-dark-700 py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-brand-300 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Torna al sito
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-white">SPMAB</span>
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
            Iscriviti gratuitamente per scaricarle tutte.
          </p>
        </div>

        {/* Recipe cards */}
        {loadingRecipes ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-400 w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {recipes.map((r) => (
              <div
                key={r.id}
                className="card relative flex flex-col gap-4 group"
              >
                {!unlocked && (
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-dark-700 border border-dark-500 flex items-center justify-center">
                    <Lock size={12} className="text-gray-500" />
                  </div>
                )}

                <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
                  <ChefHat className="text-brand-400 w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs bg-brand-500/15 text-brand-300 px-2 py-0.5 rounded-full">
                      {r.category}
                    </span>
                    {r.level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${levelColor[r.level] ?? "bg-gray-500/15 text-gray-300"}`}>
                        {r.level}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-base leading-snug mb-2">
                    {r.title}
                  </h3>
                  {r.description && (
                    <p className="text-gray-400 text-sm leading-relaxed">{r.description}</p>
                  )}
                </div>

                {unlocked ? (
                  r.file_url ? (
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="mt-auto inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 self-start"
                    >
                      <Download size={14} />
                      Scarica PDF
                    </a>
                  ) : (
                    <span className="mt-auto inline-flex items-center gap-2 bg-dark-700 text-gray-500 px-4 py-2 rounded-full text-sm self-start">
                      PDF in arrivo
                    </span>
                  )
                ) : (
                  <div className="mt-auto inline-flex items-center gap-2 bg-dark-700/80 text-gray-500 px-4 py-2 rounded-full text-sm self-start cursor-not-allowed select-none">
                    <Lock size={12} />
                    Iscriviti per scaricare
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Gate / Success */}
        {unlocked ? (
          <div className="max-w-lg mx-auto bg-gradient-to-br from-green-900/30 to-dark-800 border border-green-500/30 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="text-green-400 w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-3">
              Accesso sbloccato!
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Benvenuto/a <strong className="text-white">{form.name}</strong>! Clicca{" "}
              <strong className="text-brand-300">Scarica PDF</strong> su ogni ricetta.
            </p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto bg-dark-800 border border-brand-500/25 rounded-3xl p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
                <Lock className="text-brand-400 w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Accesso gratuito
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Inserisci nome e email per sbloccare il download di tutte le ricette.
                Niente spam, solo contenuti di valore.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Il tuo nome *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Mario Rossi"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                  La tua email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="mario@example.com"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Iscrizione in corso...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Sblocca le ricette gratuite
                  </>
                )}
              </button>

              <p className="text-gray-600 text-xs text-center">
                Iscrivendoti accetti di ricevere comunicazioni da SPMAB. Puoi cancellarti in qualsiasi momento.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
