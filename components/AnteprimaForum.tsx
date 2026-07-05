import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowRight, MessageCircle, Users } from "lucide-react";

type Thread = {
  id: string;
  title: string;
  category: string;
  created_at: string;
  reply_count: number;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "oggi";
  if (diffDays === 1) return "ieri";
  if (diffDays < 7) return `${diffDays} giorni fa`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

async function getLatestThreads(): Promise<Thread[]> {
  const { data: threads } = await supabase
    .from("forum_threads")
    .select("id, title, category, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  if (!threads || threads.length === 0) return [];

  const threadsWithCounts = await Promise.all(
    threads.map(async (t) => {
      const { count } = await supabase
        .from("forum_replies")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", t.id);
      return { ...t, reply_count: count ?? 0 };
    })
  );

  return threadsWithCounts;
}

export default async function AnteprimaForum() {
  const threads = await getLatestThreads();
  if (threads.length === 0) return null;

  return (
    <section className="py-24 px-6 border-t border-dark-700">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="section-subtitle mb-3">Community</p>
            <h2 className="font-display text-4xl font-bold text-white">
              Discussioni recenti
            </h2>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 font-medium text-sm transition-colors group"
          >
            Vai alla community
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Lista thread */}
        <div className="flex flex-col gap-3">
          {threads.map((thread) => (
            <Link key={thread.id} href="/community" className="block group">
              <div className="bg-dark-800 border border-dark-600 rounded-2xl px-6 py-5 flex items-center gap-5 hover:border-brand-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/5">
                {/* Icona */}
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-brand-400 w-5 h-5" />
                </div>

                {/* Testo */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base leading-snug group-hover:text-brand-300 transition-colors truncate">
                    {thread.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {thread.category && (
                      <span className="text-xs text-brand-400 font-medium">{thread.category}</span>
                    )}
                    <span className="text-xs text-gray-600">{formatDate(thread.created_at)}</span>
                  </div>
                </div>

                {/* Risposte */}
                <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                  <Users size={13} />
                  <span className="text-xs font-medium">{thread.reply_count}</span>
                </div>

                <ArrowRight size={15} className="text-gray-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA iscriviti */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-800 border border-dark-600 rounded-2xl px-6 py-5">
          <div>
            <p className="text-white font-semibold">Hai una domanda sulla pizza o la panificazione?</p>
            <p className="text-gray-400 text-sm mt-0.5">Unisciti alla community e confrontati con altri professionisti.</p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all hover:scale-105 flex-shrink-0"
          >
            Apri una discussione
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  );
}
