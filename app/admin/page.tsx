"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Lock, LogOut, Download, Search, RefreshCw,
  ChefHat, Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
type Subscriber = { id: string; name: string; email: string; subscribed_at: string };
type Recipe = {
  id: string; title: string; category: string; description: string;
  level: string; file_url: string; active: boolean; sort_order: number;
};
type RecipeForm = Omit<Recipe, "id">;

const emptyRecipe: RecipeForm = {
  title: "", category: "Pizza", description: "", level: "Base",
  file_url: "", active: true, sort_order: 99,
};

const CATEGORIES = ["Pizza", "Focaccia", "Pane", "Altro"];
const LEVELS = ["Base", "Intermedio", "Avanzato"];

// ─── Admin App ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState<"iscritti" | "ricette">("iscritti");

  // ── Subscribers state ──
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ── Recipes state ──
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeForm, setRecipeForm] = useState<RecipeForm>(emptyRecipe);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState("");

  // ── Auth ────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const res = await fetch("/api/subscribers", { headers: { "x-admin-password": password } });
setAuthLoading(false);
const data = await res.json();
if (res.status === 401) { setAuthError("Password errata. Riprova."); return; }
if (!res.ok) { setAuthError(`Errore server: ${data.error ?? res.status}`); return; }
setSubscribers(data.subscribers);
setAuthenticated(true);
  };

  // ── Fetch subscribers ────────────────────────────────────────────
  const refreshSubscribers = useCallback(async () => {
    setSubsLoading(true);
    const res = await fetch("/api/subscribers", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setSubscribers(data.subscribers ?? []);
    setSubsLoading(false);
  }, [password]);

  // ── Fetch recipes ────────────────────────────────────────────────
  const fetchRecipes = useCallback(async () => {
    setRecipesLoading(true);
    const res = await fetch("/api/recipes/all", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setRecipes(data.recipes ?? []);
    setRecipesLoading(false);
  }, [password]);

  useEffect(() => {
    if (authenticated && tab === "ricette") fetchRecipes();
  }, [authenticated, tab, fetchRecipes]);

  // ── Recipe form helpers ──────────────────────────────────────────
  const openNewRecipe = () => {
    setEditingRecipe(null);
    setRecipeForm(emptyRecipe);
    setRecipeError("");
    setShowForm(true);
  };

  const openEditRecipe = (r: Recipe) => {
    setEditingRecipe(r);
    setRecipeForm({
      title: r.title, category: r.category, description: r.description,
      level: r.level, file_url: r.file_url, active: r.active, sort_order: r.sort_order,
    });
    setRecipeError("");
    setShowForm(true);
  };

  const saveRecipe = async () => {
    if (!recipeForm.title.trim()) { setRecipeError("Il titolo è obbligatorio."); return; }
    setSavingRecipe(true);
    setRecipeError("");

    const url = editingRecipe ? `/api/recipes/${editingRecipe.id}` : "/api/recipes";
    const method = editingRecipe ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(recipeForm),
    });

    setSavingRecipe(false);
    if (!res.ok) { setRecipeError("Errore nel salvataggio. Riprova."); return; }
    setShowForm(false);
    fetchRecipes();
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm("Eliminare questa ricetta?")) return;
    setDeletingId(id);
    await fetch(`/api/recipes/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    setDeletingId(null);
    fetchRecipes();
  };

  const toggleActive = async (r: Recipe) => {
    await fetch(`/api/recipes/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ active: !r.active }),
    });
    fetchRecipes();
  };

  const exportCSV = () => {
    const header = "Nome,Email,Data iscrizione\n";
    const rows = subscribers
      .map((s) => `"${s.name}","${s.email}","${new Date(s.subscribed_at).toLocaleString("it-IT")}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `iscritti-spmab-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredSubs = subscribers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  );

  // ═══════════════════════════════════════════════════════════════
  // LOGIN SCREEN
  // ═══════════════════════════════════════════════════════════════
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-brand-400 w-6 h-6" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Pannello Admin</h1>
            <p className="text-gray-500 text-sm">SPMAB — Area riservata</p>
          </div>
          <form onSubmit={handleLogin} className="bg-dark-800 border border-dark-600 rounded-2xl p-8 flex flex-col gap-5">
            <div>
              <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Password amministratore</label>
              <input
                type="password" required value={password}
                onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                placeholder="••••••••"
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
            {authError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{authError}</p>}
            <button type="submit" disabled={authLoading} className="btn-primary w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : "Accedi"}
            </button>
          </form>
          <p className="text-center mt-6">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">← Torna al sito</Link>
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top bar */}
      <div className="border-b border-dark-700 py-4 px-6 sticky top-0 bg-dark-900/95 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">S</span>
              </div>
              <span className="text-white font-semibold text-sm hidden sm:block">SPMAB Admin</span>
            </div>
            {/* Tabs */}
            <div className="flex bg-dark-800 border border-dark-600 rounded-xl p-1 gap-1">
              {(["iscritti", "ricette"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t
                      ? "bg-brand-500 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "iscritti" ? <Users size={14} /> : <ChefHat size={14} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setAuthenticated(false); setSubscribers([]); setPassword(""); }}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:block">Esci</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* ══ TAB: ISCRITTI ══════════════════════════════════════════ */}
        {tab === "iscritti" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-brand-400 w-5 h-5" />
                  <span className="text-gray-400 text-sm">Totale iscritti</span>
                </div>
                <div className="font-display text-4xl font-bold gradient-text">{subscribers.length}</div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-brand-400 w-5 h-5" />
                  <span className="text-gray-400 text-sm">Ultimo iscritto</span>
                </div>
                <div className="text-white font-semibold text-sm truncate">{subscribers[0]?.name ?? "—"}</div>
                <div className="text-gray-500 text-xs mt-1">{subscribers[0] ? new Date(subscribers[0].subscribed_at).toLocaleDateString("it-IT") : "—"}</div>
              </div>
              <div className="card col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="text-brand-400 w-5 h-5" />
                  <span className="text-gray-400 text-sm">Esporta lista</span>
                </div>
                <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 font-medium px-4 py-2 rounded-full text-sm transition-colors">
                  <Download size={13} /> Scarica CSV
                </button>
              </div>
            </div>

            {/* Search + refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per nome o email..."
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>
              <button onClick={refreshSubscribers} disabled={subsLoading} className="flex items-center gap-2 text-gray-400 hover:text-brand-300 text-sm transition-colors disabled:opacity-50">
                <RefreshCw size={14} className={subsLoading ? "animate-spin" : ""} /> Aggiorna
              </button>
            </div>

            <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-dark-700 text-gray-500 text-xs uppercase tracking-wide font-semibold">
                <div>Nome</div><div>Email</div><div>Data iscrizione</div>
              </div>
              {filteredSubs.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-600 text-sm">
                  {search ? "Nessun risultato." : "Nessun iscritto ancora."}
                </div>
              ) : (
                <div className="divide-y divide-dark-700">
                  {filteredSubs.map((s) => (
                    <div key={s.id} className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-dark-700/50 transition-colors">
                      <div className="text-white text-sm font-medium truncate">{s.name}</div>
                      <div className="text-gray-400 text-sm truncate">{s.email}</div>
                      <div className="text-gray-500 text-sm">
                        {new Date(s.subscribed_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ══ TAB: RICETTE ══════════════════════════════════════════ */}
        {tab === "ricette" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Gestione Ricette</h2>
                <p className="text-gray-500 text-sm">{recipes.length} ricette totali</p>
              </div>
              <button onClick={openNewRecipe} className="btn-primary text-sm px-5 py-2.5">
                <Plus size={16} /> Nuova ricetta
              </button>
            </div>

            {recipesLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="text-brand-400 w-7 h-7 animate-spin" /></div>
            ) : (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-dark-700 text-gray-500 text-xs uppercase tracking-wide font-semibold">
                  <div>Titolo</div><div>Categoria</div><div>Livello</div><div>Visibile</div><div>Azioni</div>
                </div>

                {recipes.length === 0 ? (
                  <div className="px-6 py-16 text-center text-gray-600 text-sm">
                    Nessuna ricetta. Clicca &quot;Nuova ricetta&quot; per aggiungerne una.
                  </div>
                ) : (
                  <div className="divide-y divide-dark-700">
                    {recipes.map((r) => (
                      <div key={r.id} className="grid md:grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-6 py-4 items-center hover:bg-dark-700/40 transition-colors">
                        <div>
                          <div className="text-white text-sm font-medium">{r.title}</div>
                          {r.file_url && <div className="text-gray-600 text-xs mt-0.5 truncate max-w-xs">{r.file_url}</div>}
                        </div>
                        <div className="text-gray-400 text-sm">{r.category}</div>
                        <div className="text-gray-400 text-sm">{r.level}</div>
                        <button onClick={() => toggleActive(r)} className="text-gray-400 hover:text-brand-300 transition-colors" title={r.active ? "Visibile — clicca per nascondere" : "Nascosta — clicca per mostrare"}>
                          {r.active ? <ToggleRight size={22} className="text-brand-400" /> : <ToggleLeft size={22} />}
                        </button>
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditRecipe(r)} className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-brand-500/20 text-gray-400 hover:text-brand-300 flex items-center justify-center transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deleteRecipe(r.id)}
                            disabled={deletingId === r.id}
                            className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {deletingId === r.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ RECIPE FORM MODAL ════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <h3 className="text-white font-semibold text-lg">
                {editingRecipe ? "Modifica ricetta" : "Nuova ricetta"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Titolo *</label>
                <input
                  type="text" value={recipeForm.title}
                  onChange={(e) => setRecipeForm({ ...recipeForm, title: e.target.value })}
                  placeholder="Es. Pizza Tonda Romana"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Categoria</label>
                  <select
                    value={recipeForm.category}
                    onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-dark-700">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Livello</label>
                  <select
                    value={recipeForm.level}
                    onChange={(e) => setRecipeForm({ ...recipeForm, level: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  >
                    {LEVELS.map((l) => <option key={l} value={l} className="bg-dark-700">{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Descrizione</label>
                <textarea
                  rows={3} value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  placeholder="Breve descrizione della ricetta..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Link PDF</label>
                <input
                  type="url" value={recipeForm.file_url}
                  onChange={(e) => setRecipeForm({ ...recipeForm, file_url: e.target.value })}
                  placeholder="https://... oppure /ricette/nome-file.pdf"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
                <p className="text-gray-600 text-xs mt-1.5">Incolla il link diretto al PDF (puoi usare Google Drive, Dropbox o caricare su GitHub)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Ordine visualizzazione</label>
                  <input
                    type="number" value={recipeForm.sort_order}
                    onChange={(e) => setRecipeForm({ ...recipeForm, sort_order: Number(e.target.value) })}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Visibile sul sito</label>
                  <button
                    type="button"
                    onClick={() => setRecipeForm({ ...recipeForm, active: !recipeForm.active })}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors w-full ${
                      recipeForm.active
                        ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                        : "bg-dark-700 border-dark-500 text-gray-400"
                    }`}
                  >
                    {recipeForm.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {recipeForm.active ? "Visibile" : "Nascosta"}
                  </button>
                </div>
              </div>

              {recipeError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{recipeError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-dark-700">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-dark-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Annulla
              </button>
              <button
                onClick={saveRecipe} disabled={savingRecipe}
                className="flex-1 btn-primary justify-center text-sm py-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {savingRecipe ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingRecipe ? "Salva modifiche" : "Crea ricetta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
