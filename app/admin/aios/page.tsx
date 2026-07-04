"use client";

import { useState, useEffect } from "react";
import { Lock, RefreshCw, Loader2 } from "lucide-react";

type AiosData = {
  metrics: {
    totalPosts: number;
    publishedPosts: number;
    totalSubscribers: number;
    totalRecipes: number;
    viewsThisMonth: number;
    socialDrafts: number;
    forumThreads: number;
    generatedAt: string;
  };
  context: {
    founder: string;
    appMobile: string;
  };
};

const STORAGE_KEY = "spmab_admin_aios";

export default function AiosPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [data, setData] = useState<AiosData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (pwd: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/aios", { headers: { "x-admin-password": pwd } });
    if (res.ok) {
      setData(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1") {
      const saved = sessionStorage.getItem(STORAGE_KEY + "_pwd") ?? "";
      if (saved) {
        setPassword(saved);
        setAuthenticated(true);
        fetchData(saved);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const res = await fetch("/api/admin/aios", { headers: { "x-admin-password": password } });
    if (res.ok) {
      localStorage.setItem(STORAGE_KEY, "1");
      sessionStorage.setItem(STORAGE_KEY + "_pwd", password);
      setAuthenticated(true);
      setData(await res.json());
    } else {
      setAuthError("Password errata");
    }
    setAuthLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="text-[#d47e28]" size={22} />
            <h1 className="text-lg font-bold text-gray-800">AIOS — Centro di controllo</h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password admin"
            className="w-full border rounded-lg px-3 py-2 mb-3"
          />
          {authError && <p className="text-red-600 text-sm mb-3">{authError}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-[#d47e28] text-white rounded-lg py-2 font-semibold"
          >
            {authLoading ? "Verifica..." : "Entra"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">AIOS — Centro di controllo</h1>
          <button
            onClick={() => fetchData(password)}
            className="flex items-center gap-2 text-sm bg-white border rounded-lg px-3 py-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Aggiorna
          </button>
        </div>

        {data && (
          <>
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Metriche correnti</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric label="Articoli" value={data.metrics.totalPosts} sub={`${data.metrics.publishedPosts} pubblicati`} />
                <Metric label="Iscritti" value={data.metrics.totalSubscribers} />
                <Metric label="Ricette" value={data.metrics.totalRecipes} />
                <Metric label="Visite (mese)" value={data.metrics.viewsThisMonth} />
                <Metric label="Bozze social" value={data.metrics.socialDrafts} />
                <Metric label="Discussioni community" value={data.metrics.forumThreads} />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Aggiornato: {new Date(data.metrics.generatedAt).toLocaleString("it-IT", { timeZone: "Europe/Rome" })}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Founder</h2>
              <pre className="bg-white border rounded-lg p-4 text-sm whitespace-pre-wrap font-sans">{data.context.founder || "—"}</pre>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">App mobile</h2>
              <pre className="bg-white border rounded-lg p-4 text-sm whitespace-pre-wrap font-sans">{data.context.appMobile || "—"}</pre>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white border rounded-lg p-4 text-center">
      <div className="text-2xl font-bold text-[#d47e28]">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-gray-400">{sub}</div>}
    </div>
  );
}
