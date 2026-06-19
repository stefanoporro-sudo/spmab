"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, MessageCircle, Clock, Send, ChefHat, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

type Thread = { id: string; title: string; body: string; author_name: string; created_at: string; pinned: boolean };
type Reply = { id: string; body: string; author_name: string; is_admin: boolean; created_at: string };

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "ora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min fa`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ore fa`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} giorni fa`;
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ body: "", author_name: "", author_email: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetch(`/api/forum/threads/${id}`)
      .then((r) => r.json())
      .then((d) => { setThread(d.thread); setReplies(d.replies ?? []); setLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setFormError("");
    const res = await fetch(`/api/forum/threads/${id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    if (res.ok) {
      const { reply } = await res.json();
      setReplies((prev) => [...prev, reply]);
      setSent(true);
      setForm({ body: "", author_name: "", author_email: "" });
      setTimeout(() => setSent(false), 5000);
    } else {
      const d = await res.json().catch(() => ({}));
      setFormError(d.error ?? "Errore. Riprova.");
    }
  };

  if (loading) return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
      </main>
      <Footer />
    </>
  );

  if (!thread) return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400 text-lg">Discussione non trovata.</p>
        <Link href="/community" className="text-brand-400 hover:text-brand-300 transition-colors text-sm flex items-center gap-1">
          <ArrowLeft size={14} /> Torna alla community
        </Link>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24">
        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* Breadcrumb */}
          <Link href="/community" className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-300 text-sm transition-colors mb-8">
            <ArrowLeft size={14} /> Community
          </Link>

          {/* Thread principale */}
          <div className="card mb-6">
            <h1 className="text-white font-display text-2xl font-bold mb-4">{thread.title}</h1>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap mb-5">{thread.body}</p>
            <div className="flex items-center gap-4 text-xs text-gray-600 border-t border-dark-600 pt-4">
              <span>di <span className="text-gray-400 font-medium">{thread.author_name}</span></span>
              <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(thread.created_at)}</span>
              <span className="flex items-center gap-1"><MessageCircle size={11} />{replies.length} {replies.length === 1 ? "risposta" : "risposte"}</span>
            </div>
          </div>

          {/* Risposte */}
          {replies.length > 0 && (
            <div className="flex flex-col gap-4 mb-8">
              {replies.map((r) => (
                <div key={r.id}
                  className={`card ${r.is_admin ? "border-brand-500/40 bg-gradient-to-br from-brand-600/5 to-transparent" : ""}`}>
                  {r.is_admin && (
                    <div className="flex items-center gap-2 text-brand-300 text-xs font-bold uppercase tracking-wide mb-3">
                      <ChefHat size={13} /> Stefano Porro — Consulente
                    </div>
                  )}
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-3 pt-3 border-t border-dark-600">
                    <span className={r.is_admin ? "text-brand-400 font-medium" : "text-gray-400"}>{r.author_name}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(r.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Form risposta */}
          <div className="card">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MessageCircle size={16} className="text-brand-400" />
              Lascia una risposta
            </h2>
            {sent ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-300 text-sm">
                ✅ Risposta pubblicata! Grazie per il contributo.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">La tua risposta *</label>
                  <textarea required rows={4} value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder="Condividi la tua esperienza o risposta..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm resize-none" />
                </div>
                <p className="text-gray-600 text-xs">La tua email non verrà pubblicata.</p>
                {formError && <p className="text-red-400 text-sm">{formError}</p>}
                <button type="submit" disabled={sending} className="btn-primary self-start disabled:opacity-70">
                  {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                  Pubblica risposta
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
