"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2, Bell } from "lucide-react";

export default function Newsletter() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Errore. Riprova.");
      return;
    }
    setSent(true);
  };

  return (
    <section id="newsletter" className="py-20 bg-dark-800 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-dark-700 to-dark-900 border border-brand-500/20 rounded-3xl p-10 md:p-14">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="text-green-400 w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">
                  Iscrizione confermata!
                </h3>
                <p className="text-gray-400">
                  Grazie <strong className="text-white">{form.name}</strong>! Riceverai aggiornamenti,
                  consigli e novità direttamente nella tua casella email.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-5 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center shrink-0">
                    <Bell className="text-brand-400 w-6 h-6" />
                  </div>
                  <div>
                    <p className="section-subtitle mb-2">Resta aggiornato</p>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                      Iscriviti alla <span className="gradient-text">newsletter</span>
                    </h2>
                    <p className="text-gray-400 leading-relaxed">
                      Ricevi consigli pratici, aggiornamenti sul settore, nuove ricette
                      e offerte esclusive direttamente nella tua email. Zero spam.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                        Il tuo nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="mario@example.com"
                        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {loading ? (
                        <><Loader2 size={16} className="animate-spin" /> Iscrizione...</>
                      ) : (
                        <><Mail size={16} /> Iscriviti gratis</>
                      )}
                    </button>
                    <p className="text-gray-600 text-xs">
                      Puoi cancellarti in qualsiasi momento. Nessuno spam.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
