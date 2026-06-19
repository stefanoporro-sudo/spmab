"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Plus, ChevronRight, Pin, Clock, Send, X, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

type Thread = {
  id: string; title: string; body: string;
  author_name: string; created_at: string;
  visible: boolean; pinned: boolean; reply_count: number;
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} giorni fa`;
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", author_name: "", author_email: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch("/api/forum/threads")
      .then((r) => r.json())
      .then((d) => { setThreads(d.threads ?? []); setLoading(false); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setFormError("");
    const res = await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    if (res.ok) {
      const { thread } = await res.json();
      setThreads((prev) => [{ ...thread, reply_count: 0 }, ...prev]);
      setSent(true);
      setShowForm(false);
      setForm({ title: "", body: "", author_name: "", author_email: "" });
      setTimeout(() => setSent(false), 5000);
    } else {
      const d = await res.json().catch(() => ({}));
      setFormError(d.error ?? "Errore nell'invio. Riprova.");
    }
  };

  return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24">

        {/* Hero */}
        <section className="py-16 px-6 border-b border-dark-700">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-brand-400 text-sm font-medium mb-2">
                <Users size={15} /> Community
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                Domande & Discussioni
              </h1>
              <p className="text-gray-400 max-w-lg">
                Fai domande, condividi esperienze, confrontati con altri pizzaioli. Stefano risponde personalmente.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary shrink-0"
            >
              <Plus size={16} /> Nuova discussione
            </button>
          </div>
        </section>

        {/* Notifica inviato */}
        {sent && (
          <div className="max-w-4xl mx-auto px-6 mt-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 text-green-300 text-sm">
              ✅ Discussione pubblicata! Stefano riceverà una notifica e risponderà al più presto.
            </div>
          </div>
        )}

        {/* Lista thread */}
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse h-24 bg-dark-700" />
              ))
            ) : threads.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <MessageCircle size={40} className="mx-auto mb-4 opacity-30" />
                <p>Ancora nessuna discussione. Sii il primo!</p>
              </div>
            ) : (
              threads.map((t) => (
                <Link
                  key={t.id}
                  href={`/community/${t.id}`}
                  className="card group hover:border-brand-500/40 transition-all duration-200 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-500/20 transition-colors">
                    {t.pinned ? <Pin size={16} className="text-brand-400" /> : <MessageCircle size={16} className="text-brand-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-white font-semibold group-hover:text-brand-300 transition-colors line-clamp-1">
                        {t.pinned && <span className="text-brand-400 text-xs mr-2 font-normal">📌 In evidenza</span>}
                        {t.title}
                      </h2>
                      <ChevronRight size={16} className="text-gray-600 group-hover:text-brand-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                    <p className="text-gray-500 text-sm line-clamp-1 mb-2">{t.body}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>di <span className="text-gray-400">{t.author_name}</span></span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(t.created_at)}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={11} /> {t.reply_count} {t.reply_count === 1 ? "risposta" : "risposte"}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

      </main>
      <Footer />

      {/* Modal nuova discussione */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <h2 className="text-white font-semibold text-lg">Nuova discussione</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Nome *</label>
                  <input type="text" required value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    placeholder="Mario Rossi"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Email *</label>
                  <input type="email" required value={form.author_email}
                    onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                    placeholder="mario@example.com"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Titolo della discussione *</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Es: Come gestire l'impasto ad alta idratazione in estate?"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Messaggio *</label>
                <textarea required rows={4} value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Spiega la tua domanda o situazione nel dettaglio..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm resize-none" />
              </div>
              <p className="text-gray-600 text-xs">La tua email non sarà pubblicata. Riceverai una notifica quando qualcuno risponde.</p>
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-dark-500 text-gray-400 hover:text-white rounded-xl py-2.5 text-sm font-medium transition-colors">
                  Annulla
                </button>
                <button type="submit" disabled={sending}
                  className="flex-1 btn-primary justify-center py-2.5 text-sm disabled:opacity-70">
                  {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                  Pubblica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
