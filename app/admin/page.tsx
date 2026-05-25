"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Lock, LogOut, Download, Search, RefreshCw,
  ChefHat, Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight, FileText,
  BookOpen, Eye, EyeOff,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
type Subscriber = { id: string; name: string; email: string; subscribed_at: string };
type Recipe = {
  id: string; title: string; category: string; description: string;
  level: string; file_url: string; active: boolean; sort_order: number;
};
type RecipeForm = Omit<Recipe, "id">;
type Post = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  category: string; cover_url: string; published: boolean; published_at: string; created_at: string;
};
type PostForm = Omit<Post, "id" | "published_at" | "created_at">;

const emptyRecipe: RecipeForm = {
  title: "", category: "Pizza", description: "", level: "Base",
  file_url: "", active: true, sort_order: 99,
};
const emptyPost: PostForm = {
  title: "", slug: "", excerpt: "", content: "",
  category: "Pizza", cover_url: "", published: false,
};
const POST_CATEGORIES = ["Pizza", "Panificazione", "Consulenza", "Business", "Generale"];

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const CATEGORIES = ["Pizza", "Focaccia", "Pane", "Altro"];
const LEVELS = ["Base", "Intermedio", "Avanzato"];

// ─── Admin App ──────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState<"iscritti" | "ricette" | "pdf" | "blog">("iscritti");

  // ── PDF Generator state ──
  const [pdfForm, setPdfForm] = useState({
    title: "",
    category: "Pizza",
    level: "Base",
    ingredienti: "",
    procedimento: "",
    note: "",
  });
  const [pdfFiles, setPdfFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [savingToDB, setSavingToDB] = useState(false);
  const [savedToDB, setSavedToDB] = useState(false);

  // ── Subscribers state ──
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [search, setSearch] = useState("");

  // ── Blog (Posts) state ──
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postForm, setPostForm] = useState<PostForm>(emptyPost);
  const [savingPost, setSavingPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postError, setPostError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

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

  // ── Fetch PDF files ──────────────────────────────────────────────
  const fetchPdfFiles = useCallback(async () => {
    const res = await fetch("/api/pdf-files", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setPdfFiles(data.files ?? []);
  }, [password]);

  // ── Fetch posts ──────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    const res = await fetch("/api/blog", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setPosts(data.posts ?? []);
    setPostsLoading(false);
  }, [password]);

  useEffect(() => {
    if (authenticated && tab === "ricette") { fetchRecipes(); fetchPdfFiles(); }
    if (authenticated && tab === "pdf") fetchPdfFiles();
    if (authenticated && tab === "blog") fetchPosts();
  }, [authenticated, tab, fetchRecipes, fetchPdfFiles, fetchPosts]);

  // ── Post form helpers ─────────────────────────────────────────────
  const openNewPost = () => {
    setEditingPost(null);
    setPostForm(emptyPost);
    setPostError("");
    setShowPostForm(true);
  };

  const openEditPost = (p: Post) => {
    setEditingPost(p);
    setPostForm({
      title: p.title, slug: p.slug, excerpt: p.excerpt,
      content: p.content, category: p.category,
      cover_url: p.cover_url, published: p.published,
    });
    setPostError("");
    setShowPostForm(true);
  };

  const savePost = async () => {
    if (!postForm.title.trim()) { setPostError("Il titolo è obbligatorio."); return; }
    if (!postForm.slug.trim()) { setPostError("Lo slug è obbligatorio."); return; }
    setSavingPost(true);
    setPostError("");

    const url = editingPost ? `/api/blog/${editingPost.id}` : "/api/blog";
    const method = editingPost ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(postForm),
    });

    setSavingPost(false);
    if (!res.ok) {
      const data = await res.json();
      setPostError(data.error ?? "Errore nel salvataggio. Riprova.");
      return;
    }
    setShowPostForm(false);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Eliminare questo articolo?")) return;
    setDeletingPostId(id);
    await fetch(`/api/blog/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    setDeletingPostId(null);
    fetchPosts();
  };

  const togglePublished = async (p: Post) => {
    await fetch(`/api/blog/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ published: !p.published }),
    });
    fetchPosts();
  };

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

  // ── Generate PDF ─────────────────────────────────────────────────
  const generatePDF = () => {
    const logoUrl = `${window.location.origin}/logo.png`;
    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8"/>
  <title>${pdfForm.title} — SPMAB</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;color:#1a1a1a;background:#fff;padding:40px 48px;}
    .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:3px solid #d47e28;margin-bottom:28px;}
    .header-right{text-align:right;font-size:12px;color:#555;line-height:1.8;}
    .header-right strong{color:#d47e28;font-size:13px;}
    .badges{display:flex;gap:10px;margin-bottom:20px;}
    .badge{background:#fff4e6;color:#b85c00;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;border:1px solid #fcd38d;}
    h1{font-size:30px;font-weight:900;color:#1a1a1a;margin-bottom:6px;letter-spacing:-0.5px;}
    .divider{height:1px;background:#f0e0c8;margin:24px 0;}
    .grid{display:grid;grid-template-columns:35% 65%;gap:32px;margin-bottom:24px;}
    .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#d47e28;margin-bottom:12px;}
    .content{font-size:13px;line-height:1.9;color:#333;white-space:pre-wrap;}
    .ingredienti-box{background:#fafafa;border:1px solid #f0e0c8;border-radius:10px;padding:16px;}
    .note-box{background:#fffbf5;border:1px solid #fcd38d;border-radius:10px;padding:16px 20px;margin-top:8px;}
    .note-box .content{font-size:12.5px;color:#555;}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#999;}
    .footer strong{color:#d47e28;}
    @media print{body{padding:30px 36px;}@page{margin:0;size:A4;}}
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" style="height:60px;max-width:160px;object-fit:contain;" />
    <div class="header-right">
      <strong>Stefano Porro — SPMAB</strong><br/>
      Consulenza Pizzaiolo & Panificazione<br/>
      +39 393 360 2014<br/>
      consulenzapizzaiolo.it
    </div>
  </div>

  <div class="badges">
    <span class="badge">${pdfForm.category}</span>
    <span class="badge">${pdfForm.level}</span>
  </div>

  <h1>${pdfForm.title}</h1>
  <div class="divider"></div>

  <div class="grid">
    <div>
      <div class="section-title">Ingredienti</div>
      <div class="ingredienti-box">
        <div class="content">${pdfForm.ingredienti || "—"}</div>
      </div>
    </div>
    <div>
      <div class="section-title">Procedimento</div>
      <div class="content">${pdfForm.procedimento || "—"}</div>
    </div>
  </div>

  ${pdfForm.note ? `
  <div class="divider"></div>
  <div class="section-title">Note del Maestro</div>
  <div class="note-box">
    <div class="content">${pdfForm.note}</div>
  </div>` : ""}

  <div class="footer">
    <span>© ${new Date().getFullYear()} SPMAB — Stefano Porro</span>
    <span><strong>consulenzapizzaiolo.it</strong> · stefano@consulenzapizzaiolo.it</span>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 800);
  };

  // ── Save recipe to DB ────────────────────────────────────────────
  const saveRecipeToDB = async () => {
    if (!pdfForm.title.trim()) return;
    setSavingToDB(true);
    await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({
        title: pdfForm.title,
        category: pdfForm.category,
        level: pdfForm.level,
        description: "",
        file_url: "",
        active: false,
        sort_order: 99,
      }),
    });
    setSavingToDB(false);
    setSavedToDB(true);
    fetchRecipes();
    setTimeout(() => setSavedToDB(false), 3000);
  };

  // ── Upload PDF to Supabase Storage ───────────────────────────────
  const uploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/pdf-files", {
      method: "POST",
      headers: { "x-admin-password": password },
      body: formData,
    });
    setUploadingPdf(false);
    fetchPdfFiles();
    e.target.value = "";
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
              {(["iscritti", "ricette", "pdf", "blog"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t
                      ? "bg-brand-500 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "iscritti" ? <Users size={14} />
                    : t === "ricette" ? <ChefHat size={14} />
                    : t === "pdf" ? <FileText size={14} />
                    : <BookOpen size={14} />}
                  {t === "iscritti" ? "Iscritti"
                    : t === "ricette" ? "Ricette"
                    : t === "pdf" ? "Crea PDF"
                    : "Blog"}
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
        {/* ══ TAB: PDF ══════════════════════════════════════════════ */}
        {tab === "pdf" && (
          <div className="max-w-3xl">
            <div className="mb-8">
              <h2 className="text-white font-semibold text-lg">Crea PDF Ricetta</h2>
              <p className="text-gray-500 text-sm">Compila i campi e genera un PDF professionale con il tuo logo.</p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Upload PDF */}
              <div className="card">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Carica PDF nel sistema</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 px-4 py-2.5 rounded-xl text-sm transition-colors">
                    {uploadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    {uploadingPdf ? "Caricamento..." : "Carica PDF"}
                    <input type="file" accept=".pdf" onChange={uploadPdf} className="hidden" disabled={uploadingPdf} />
                  </label>
                  {pdfFiles.length > 0 && (
                    <span className="text-gray-500 text-xs">{pdfFiles.length} PDF disponibili nel sistema</span>
                  )}
                </div>
                {pdfFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {pdfFiles.map(f => (
                      <span key={f.url} className="text-xs bg-dark-700 text-gray-400 px-3 py-1 rounded-full border border-dark-500">
                        📄 {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Title + meta */}
              <div className="card flex flex-col gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Nome Ricetta *</label>
                  <input
                    type="text" value={pdfForm.title}
                    onChange={(e) => setPdfForm({ ...pdfForm, title: e.target.value })}
                    placeholder="Es. Pizza Tonda Romana"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Categoria</label>
                    <select
                      value={pdfForm.category}
                      onChange={(e) => setPdfForm({ ...pdfForm, category: e.target.value })}
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c} className="bg-dark-700">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Livello</label>
                    <select
                      value={pdfForm.level}
                      onChange={(e) => setPdfForm({ ...pdfForm, level: e.target.value })}
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    >
                      {LEVELS.map((l) => <option key={l} value={l} className="bg-dark-700">{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ingredienti + Procedimento */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="card">
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Ingredienti</label>
                  <textarea
                    rows={10} value={pdfForm.ingredienti}
                    onChange={(e) => setPdfForm({ ...pdfForm, ingredienti: e.target.value })}
                    placeholder={"Farina 00  500g\nAcqua  325g\nSale  12g\nLievito  2g\n..."}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none font-mono"
                  />
                </div>
                <div className="card">
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Procedimento</label>
                  <textarea
                    rows={10} value={pdfForm.procedimento}
                    onChange={(e) => setPdfForm({ ...pdfForm, procedimento: e.target.value })}
                    placeholder={"1. Sciogliere il lievito...\n2. Aggiungere la farina...\n3. Impastare per 10 min...\n..."}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                  />
                </div>
              </div>

              {/* Note */}
              <div className="card">
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Note del Maestro (opzionale)</label>
                <textarea
                  rows={3} value={pdfForm.note}
                  onChange={(e) => setPdfForm({ ...pdfForm, note: e.target.value })}
                  placeholder="Consigli, varianti, temperature ideali..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={generatePDF}
                  disabled={!pdfForm.title.trim()}
                  className="btn-primary justify-center py-4 text-base flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FileText size={18} />
                  Genera e Scarica PDF
                </button>
                <button
                  onClick={saveRecipeToDB}
                  disabled={!pdfForm.title.trim() || savingToDB || savedToDB}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 font-semibold px-6 py-4 rounded-full transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingToDB ? <Loader2 size={18} className="animate-spin" /> : savedToDB ? <Check size={18} className="text-green-400" /> : <Plus size={18} />}
                  {savedToDB ? "Salvata nel pannello!" : "Salva nel pannello ricette"}
                </button>
              </div>
              <p className="text-gray-600 text-xs text-center -mt-2">
                &quot;Genera PDF&quot; apre la stampa → seleziona &quot;Salva come PDF&quot;. &quot;Salva nel pannello&quot; aggiunge la ricetta alla scheda Ricette.
              </p>
            </div>
          </div>
        )}

        {/* ══ TAB: BLOG ═════════════════════════════════════════════ */}
        {tab === "blog" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Gestione Blog</h2>
                <p className="text-gray-500 text-sm">
                  {posts.filter(p => p.published).length} pubblicati · {posts.filter(p => !p.published).length} in bozza
                </p>
              </div>
              <button onClick={openNewPost} className="btn-primary text-sm px-5 py-2.5">
                <Plus size={16} /> Nuovo articolo
              </button>
            </div>

            {postsLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="text-brand-400 w-7 h-7 animate-spin" /></div>
            ) : (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-dark-700 text-gray-500 text-xs uppercase tracking-wide font-semibold">
                  <div>Titolo</div><div>Categoria</div><div>Stato</div><div>Visibile</div><div>Azioni</div>
                </div>

                {posts.length === 0 ? (
                  <div className="px-6 py-16 text-center text-gray-600 text-sm">
                    Nessun articolo. Clicca &quot;Nuovo articolo&quot; per iniziare.
                  </div>
                ) : (
                  <div className="divide-y divide-dark-700">
                    {posts.map((p) => (
                      <div key={p.id} className="grid md:grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-6 py-4 items-center hover:bg-dark-700/40 transition-colors">
                        <div>
                          <div className="text-white text-sm font-medium">{p.title}</div>
                          <div className="text-gray-600 text-xs mt-0.5">/blog/{p.slug}</div>
                        </div>
                        <div className="text-gray-400 text-sm">{p.category}</div>
                        <div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            p.published
                              ? "bg-green-500/15 text-green-300"
                              : "bg-gray-500/15 text-gray-400"
                          }`}>
                            {p.published ? "Pubblicato" : "Bozza"}
                          </span>
                        </div>
                        <button
                          onClick={() => togglePublished(p)}
                          className="text-gray-400 hover:text-brand-300 transition-colors"
                          title={p.published ? "Pubblica → clicca per nascondere" : "Bozza → clicca per pubblicare"}
                        >
                          {p.published
                            ? <Eye size={20} className="text-green-400" />
                            : <EyeOff size={20} />}
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditPost(p)}
                            className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-brand-500/20 text-gray-400 hover:text-brand-300 flex items-center justify-center transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => deletePost(p.id)}
                            disabled={deletingPostId === p.id}
                            className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {deletingPostId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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

      {/* ══ POST FORM MODAL ══════════════════════════════════════════ */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-dark-700 flex-shrink-0">
              <h3 className="text-white font-semibold text-lg">
                {editingPost ? "Modifica articolo" : "Nuovo articolo"}
              </h3>
              <button onClick={() => setShowPostForm(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Titolo */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Titolo *</label>
                <input
                  type="text" value={postForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setPostForm(f => ({
                      ...f,
                      title,
                      slug: editingPost ? f.slug : toSlug(title),
                    }));
                  }}
                  placeholder="Es. Come scegliere la farina giusta per la pizza"
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Slug (URL) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm flex-shrink-0">/blog/</span>
                  <input
                    type="text" value={postForm.slug}
                    onChange={(e) => setPostForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="come-scegliere-la-farina"
                    className="flex-1 bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm font-mono"
                  />
                </div>
                <p className="text-gray-600 text-xs mt-1.5">Auto-generato dal titolo. Puoi modificarlo.</p>
              </div>

              {/* Categoria + Pubblicato */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Categoria</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  >
                    {POST_CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-700">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Stato</label>
                  <button
                    type="button"
                    onClick={() => setPostForm(f => ({ ...f, published: !f.published }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors w-full ${
                      postForm.published
                        ? "bg-green-500/20 border-green-500/40 text-green-300"
                        : "bg-dark-700 border-dark-500 text-gray-400"
                    }`}
                  >
                    {postForm.published ? <Eye size={16} /> : <EyeOff size={16} />}
                    {postForm.published ? "Pubblicato" : "Bozza"}
                  </button>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Breve descrizione (anteprima nella lista)
                </label>
                <textarea
                  rows={2} value={postForm.excerpt}
                  onChange={(e) => setPostForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="In poche righe di cosa parla l'articolo..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                />
              </div>

              {/* Cover image upload */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Immagine copertina (opzionale)
                </label>

                {/* Anteprima immagine già caricata */}
                {postForm.cover_url && (
                  <div className="relative mb-3 rounded-xl overflow-hidden border border-dark-500 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={postForm.cover_url}
                      alt="Copertina"
                      className="w-full h-36 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPostForm(f => ({ ...f, cover_url: "" }))}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      title="Rimuovi immagine"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}

                {/* Bottone upload */}
                {!postForm.cover_url && (
                  <label className="cursor-pointer flex items-center justify-center gap-3 bg-dark-700 border border-dashed border-dark-400 hover:border-brand-500 rounded-xl px-4 py-5 transition-colors group">
                    {uploadingCover ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-brand-400" />
                        <span className="text-gray-400 text-sm">Caricamento in corso...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
                        <span className="text-gray-400 group-hover:text-gray-300 text-sm transition-colors">
                          Clicca per caricare un&apos;immagine
                        </span>
                        <span className="text-gray-600 text-xs">JPG, PNG, WebP · max 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCover(true);
                        setPostError("");
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/blog/upload", {
                          method: "POST",
                          headers: { "x-admin-password": password },
                          body: fd,
                        });
                        const data = await res.json();
                        setUploadingCover(false);
                        if (!res.ok) {
                          setPostError(data.error ?? "Errore nel caricamento immagine.");
                        } else {
                          setPostForm(f => ({ ...f, cover_url: data.url }));
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}

                {/* Cambia immagine già presente */}
                {postForm.cover_url && (
                  <label className="cursor-pointer inline-flex items-center gap-2 mt-2 text-xs text-gray-500 hover:text-brand-300 transition-colors">
                    {uploadingCover ? (
                      <><Loader2 size={12} className="animate-spin" /> Caricamento...</>
                    ) : (
                      <><Download size={12} /> Cambia immagine</>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingCover(true);
                        setPostError("");
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/blog/upload", {
                          method: "POST",
                          headers: { "x-admin-password": password },
                          body: fd,
                        });
                        const data = await res.json();
                        setUploadingCover(false);
                        if (!res.ok) {
                          setPostError(data.error ?? "Errore nel caricamento immagine.");
                        } else {
                          setPostForm(f => ({ ...f, cover_url: data.url }));
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Contenuto */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Contenuto articolo
                </label>
                <textarea
                  rows={14} value={postForm.content}
                  onChange={(e) => setPostForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={"Scrivi l'articolo qui...\n\nPuoi usare:\n## Titolo sezione\n### Sottotitolo\n- elemento lista\n> citazione\n\nLascia una riga vuota tra i paragrafi."}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none font-mono"
                />
                <p className="text-gray-600 text-xs mt-1.5">
                  ## Titolo · ### Sottotitolo · - lista · &gt; citazione · riga vuota = paragrafo
                </p>
              </div>

              {postError && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{postError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-dark-700 flex-shrink-0">
              <button onClick={() => setShowPostForm(false)} className="flex-1 border border-dark-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Annulla
              </button>
              <button
                onClick={savePost} disabled={savingPost}
                className="flex-1 btn-primary justify-center text-sm py-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {savingPost ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingPost ? "Salva modifiche" : "Crea articolo"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">File PDF</label>
                {pdfFiles.length > 0 ? (
                  <select
                    value={recipeForm.file_url}
                    onChange={(e) => setRecipeForm({ ...recipeForm, file_url: e.target.value })}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  >
                    <option value="" className="bg-dark-700">— Seleziona un PDF —</option>
                    {pdfFiles.map(f => (
                      <option key={f.url} value={f.url} className="bg-dark-700">📄 {f.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="url" value={recipeForm.file_url}
                    onChange={(e) => setRecipeForm({ ...recipeForm, file_url: e.target.value })}
                    placeholder="https://... (nessun PDF caricato nel sistema)"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                  />
                )}
                <p className="text-gray-600 text-xs mt-1.5">
                  {pdfFiles.length > 0 ? "Scegli il PDF dalla scheda \"Crea PDF\"" : "Carica prima un PDF dalla scheda \"Crea PDF\""}
                </p>
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
