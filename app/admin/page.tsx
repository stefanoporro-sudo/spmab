"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Lock, LogOut, Download, Search, RefreshCw,
  ChefHat, Plus, Pencil, Trash2, X, Check, Loader2, ToggleLeft, ToggleRight, FileText,
  BookOpen, Eye, EyeOff, Star, BarChart2, Globe, Clock, TrendingUp, MessageCircle, Pin, Send, UserSquare2, MapPin, Upload, Share2,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
type Subscriber = { id: string; name: string; email: string; subscribed_at: string };
type Recipe = {
  id: string; title: string; category: string; description: string;
  level: string; file_url: string; image_url: string; active: boolean; sort_order: number;
  collaborator_id: string | null;
};
type RecipeForm = Omit<Recipe, "id">;
type Post = {
  id: string; title: string; slug: string; excerpt: string; content: string;
  category: string; cover_url: string; published: boolean; published_at: string; created_at: string;
};
type PostForm = Omit<Post, "id" | "published_at" | "created_at">;
type SocialPost = {
  id: string; source_type: "post" | "recipe"; source_id: string;
  caption: string; image_url: string; scheduled_slot: string;
  status: "draft" | "approved" | "publishing" | "published" | "failed" | "rejected";
  platforms: string[];
  ig_result: Record<string, unknown> | null; fb_result: Record<string, unknown> | null;
  error_message: string | null; created_at: string;
};
type Testimonial = { id: string; name: string; role: string; stars: number; text: string; active: boolean; sort_order: number };
type TestimonialForm = Omit<Testimonial, "id">;
type ForumThread = { id: string; title: string; body: string; author_name: string; author_email: string; visible: boolean; pinned: boolean; created_at: string; reply_count: number };
type ForumReply = { id: string; body: string; author_name: string; author_email: string; is_admin: boolean; visible: boolean; created_at: string };
type Collaborator = { id: string; name: string; slug: string; bio: string; photo_url: string; specialty: string; city: string; active: boolean; sort_order: number };
type CollaboratorForm = Omit<Collaborator, "id">;
type PageView = { path: string; referrer: string | null; created_at: string };
type StatsData = {
  recentViews: PageView[];
  dailyTotals: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  monthlyTotal: number;
  todayTotal: number;
};

const PAGE_LABELS: Record<string, string> = {
  "/": "🏠 Homepage",
  "/blog": "📝 Blog",
  "/ricette": "🍕 Ricette",
  "/consulenza-molini": "🌾 Consulenza Molini",
  "/consulenza-pizzaioli": "👨‍🍳 Consulenza Pizzaioli",
};
function pageName(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/blog/")) return `📄 ${path.replace("/blog/", "")}`;
  if (path.startsWith("/ricette/")) return `🍕 ${path.replace("/ricette/", "")}`;
  return path;
}
function referrerName(ref: string | null): string {
  if (!ref) return "Diretto";
  try { return new URL(ref).hostname.replace("www.", ""); } catch { return "Diretto"; }
}

const emptyRecipe: RecipeForm = {
  title: "", category: "Pizza", description: "", level: "Base",
  file_url: "", image_url: "", active: true, sort_order: 99, collaborator_id: null,
};
const emptyPost: PostForm = {
  title: "", slug: "", excerpt: "", content: "",
  category: "Pizza", cover_url: "", published: false,
};
const POST_CATEGORIES = ["Pizza", "Panificazione", "Consulenza", "Business", "Generale"];
const emptyTestimonial: TestimonialForm = { name: "", role: "", stars: 5, text: "", active: true, sort_order: 99 };
const emptyCollaborator: CollaboratorForm = { name: "", slug: "", bio: "", photo_url: "", specialty: "", city: "", active: true, sort_order: 99 };

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
  const [tab, setTab] = useState<"iscritti" | "ricette" | "pdf" | "blog" | "social" | "recensioni" | "statistiche" | "forum" | "collaboratori">("iscritti");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

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
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubForm, setEditSubForm] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const [savingSub, setSavingSub] = useState(false);
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null);
  const [subError, setSubError] = useState("");

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
  const [deletingPdf, setDeletingPdf] = useState<string | null>(null);
  // Apertura diretta di un articolo via link email (/admin?edit=ID)
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  // ── Social state ──
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [savingSocialId, setSavingSocialId] = useState<string | null>(null);
  const [uploadingSocialId, setUploadingSocialId] = useState<string | null>(null);
  const [publishingSocialId, setPublishingSocialId] = useState<string | null>(null);
  const [deletingSocialId, setDeletingSocialId] = useState<string | null>(null);
  const [socialError, setSocialError] = useState("");
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  // Apertura diretta di un post social via link email (/admin?tab=social&edit=ID)
  const [pendingSocialEditId, setPendingSocialEditId] = useState<string | null>(null);

  // ── Testimonials state ───────────────────────────────────────────
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testiLoading, setTestiLoading] = useState(false);
  const [showTestiForm, setShowTestiForm] = useState(false);
  const [editingTesti, setEditingTesti] = useState<Testimonial | null>(null);
  const [testiForm, setTestiForm] = useState<TestimonialForm>(emptyTestimonial);
  const [savingTesti, setSavingTesti] = useState(false);
  const [deletingTestiId, setDeletingTestiId] = useState<string | null>(null);
  const [testiError, setTestiError] = useState("");

  // ── Forum state ──
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [forumLoading, setForumLoading] = useState(false);
  const [openThread, setOpenThread] = useState<{ thread: ForumThread; replies: ForumReply[] } | null>(null);
  const [forumReply, setForumReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [newThreadForm, setNewThreadForm] = useState({ title: "", body: "" });
  const [showNewThread, setShowNewThread] = useState(false);
  const [savingThread, setSavingThread] = useState(false);

  // ── Collaborators state ──
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [editingCollab, setEditingCollab] = useState<Collaborator | null>(null);
  const [collabForm, setCollabForm] = useState<CollaboratorForm>(emptyCollaborator);
  const [savingCollab, setSavingCollab] = useState(false);
  const [deletingCollabId, setDeletingCollabId] = useState<string | null>(null);
  const [collabError, setCollabError] = useState("");
  const [uploadingCollabPhoto, setUploadingCollabPhoto] = useState(false);

  // ── Recipes state ──
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeForm, setRecipeForm] = useState<RecipeForm>(emptyRecipe);
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [recipeError, setRecipeError] = useState("");
  const [uploadingRecipeImg, setUploadingRecipeImg] = useState(false);

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
localStorage.setItem("spmab_admin", "1");
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

  // ── Subscriber edit / delete helpers ─────────────────────────────
  const startEditSub = (s: Subscriber) => {
    setEditingSubId(s.id);
    setEditSubForm({ name: s.name, email: s.email });
    setSubError("");
  };
  const cancelEditSub = () => { setEditingSubId(null); setSubError(""); };
  const saveSub = async (id: string) => {
    if (!editSubForm.name.trim() || !editSubForm.email.trim()) { setSubError("Nome ed email sono obbligatori."); return; }
    setSavingSub(true); setSubError("");
    const res = await fetch(`/api/subscribers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(editSubForm),
    });
    setSavingSub(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSubError(d.error || "Errore nel salvataggio.");
      return;
    }
    setEditingSubId(null);
    refreshSubscribers();
  };
  const deleteSub = async (s: Subscriber) => {
    if (!confirm(`Eliminare l'iscritto "${s.name}" (${s.email})?`)) return;
    setDeletingSubId(s.id);
    await fetch(`/api/subscribers/${s.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    setDeletingSubId(null);
    refreshSubscribers();
  };

  // ── Fetch stats ──────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await fetch("/api/stats", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setStats(data);
    setStatsLoading(false);
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

  // ── Fetch social posts ───────────────────────────────────────────
  const fetchSocialPosts = useCallback(async () => {
    setSocialLoading(true);
    const res = await fetch("/api/social", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setSocialPosts(data.posts ?? []);
    setSocialLoading(false);
  }, [password]);

  const updateSocialPost = async (id: string, patch: Record<string, unknown>) => {
    setSavingSocialId(id);
    setSocialError("");
    const res = await fetch(`/api/social/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(patch),
    });
    setSavingSocialId(null);
    if (!res.ok) { setSocialError("Errore nel salvataggio."); return; }
    fetchSocialPosts();
  };

  const uploadSocialImage = async (id: string, file: File) => {
    setUploadingSocialId(id);
    setSocialError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/social/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    if (!res.ok) { setUploadingSocialId(null); setSocialError(data.error ?? "Errore nel caricamento immagine."); return; }
    await updateSocialPost(id, { image_url: data.url });
    setUploadingSocialId(null);
  };

  const publishSocialPost = async (id: string) => {
    setPublishingSocialId(id);
    setSocialError("");
    const res = await fetch(`/api/social/${id}/publish`, { method: "POST", headers: { "x-admin-password": password } });
    const data = await res.json();
    setPublishingSocialId(null);
    if (!res.ok) setSocialError(data.error ?? "Errore nella pubblicazione.");
    fetchSocialPosts();
  };

  const deleteSocialPost = async (id: string) => {
    if (!confirm("Rifiutare ed eliminare questa bozza?")) return;
    setDeletingSocialId(id);
    await fetch(`/api/social/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    setDeletingSocialId(null);
    fetchSocialPosts();
  };

  // ── Delete PDF ───────────────────────────────────────────────────
  const deletePdf = async (name: string) => {
    if (!confirm(`Eliminare il file "${name}"?`)) return;
    setDeletingPdf(name);
    await fetch("/api/pdf-files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ name }),
    });
    setDeletingPdf(null);
    fetchPdfFiles();
  };

  // ── Fetch testimonials ───────────────────────────────────────────
  const fetchTestimonials = useCallback(async () => {
    setTestiLoading(true);
    const res = await fetch("/api/testimonials", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setTestimonials(data.testimonials ?? []);
    setTestiLoading(false);
  }, [password]);

  // ── Forum helpers ────────────────────────────────────────────────
  const fetchForumThreads = useCallback(async () => {
    setForumLoading(true);
    const res = await fetch("/api/forum/threads", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setForumThreads(data.threads ?? []);
    setForumLoading(false);
  }, [password]);

  const openForumThread = async (t: ForumThread) => {
    const res = await fetch(`/api/forum/threads/${t.id}`, { headers: { "x-admin-password": password } });
    const data = await res.json();
    setOpenThread({ thread: data.thread, replies: data.replies ?? [] });
    setForumReply("");
  };

  const sendForumReply = async () => {
    if (!openThread || !forumReply.trim()) return;
    setSendingReply(true);
    await fetch(`/api/forum/threads/${openThread.thread.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ body: forumReply, author_name: "Stefano Porro", author_email: "stefano@consulenzapizzaiolo.it" }),
    });
    setSendingReply(false);
    setForumReply("");
    openForumThread(openThread.thread);
  };

  const toggleThreadVisible = async (t: ForumThread) => {
    await fetch(`/api/forum/threads/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ visible: !t.visible }),
    });
    fetchForumThreads();
    if (openThread?.thread.id === t.id) setOpenThread(null);
  };

  const toggleThreadPinned = async (t: ForumThread) => {
    await fetch(`/api/forum/threads/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ pinned: !t.pinned }),
    });
    fetchForumThreads();
  };

  const deleteThread = async (id: string) => {
    if (!confirm("Eliminare questa discussione e tutte le risposte?")) return;
    await fetch(`/api/forum/threads/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    setOpenThread(null);
    fetchForumThreads();
  };

  const deleteReply = async (replyId: string) => {
    if (!openThread) return;
    await fetch(`/api/forum/threads/${openThread.thread.id}/replies`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ reply_id: replyId }),
    });
    openForumThread(openThread.thread);
  };

  const createAdminThread = async () => {
    if (!newThreadForm.title.trim() || !newThreadForm.body.trim()) return;
    setSavingThread(true);
    await fetch("/api/forum/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ ...newThreadForm, author_name: "Stefano Porro", author_email: "stefano@consulenzapizzaiolo.it" }),
    });
    setSavingThread(false);
    setShowNewThread(false);
    setNewThreadForm({ title: "", body: "" });
    fetchForumThreads();
  };

  // ── Collaborators helpers ────────────────────────────────────────
  const fetchCollaborators = useCallback(async () => {
    setCollabLoading(true);
    const res = await fetch("/api/collaborators", { headers: { "x-admin-password": password } });
    const data = await res.json();
    setCollaborators(data.collaborators ?? []);
    setCollabLoading(false);
  }, [password]);

  const openNewCollab = () => { setEditingCollab(null); setCollabForm(emptyCollaborator); setCollabError(""); setShowCollabForm(true); };
  const openEditCollab = (c: Collaborator) => { setEditingCollab(c); setCollabForm({ name: c.name, slug: c.slug, bio: c.bio, photo_url: c.photo_url, specialty: c.specialty, city: c.city, active: c.active, sort_order: c.sort_order }); setCollabError(""); setShowCollabForm(true); };

  const saveCollab = async () => {
    if (!collabForm.name.trim()) { setCollabError("Il nome è obbligatorio."); return; }
    const slug = collabForm.slug.trim() || toSlug(collabForm.name);
    setSavingCollab(true); setCollabError("");
    const method = editingCollab ? "PUT" : "POST";
    const url = editingCollab ? `/api/collaborators/${editingCollab.id}` : "/api/collaborators";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ ...collabForm, slug }),
    });
    setSavingCollab(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setCollabError(d.error || "Errore nel salvataggio."); return; }
    setShowCollabForm(false);
    fetchCollaborators();
  };

  const deleteCollab = async (c: Collaborator) => {
    if (!confirm(`Eliminare "${c.name}"?`)) return;
    setDeletingCollabId(c.id);
    await fetch(`/api/collaborators/${c.id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    setDeletingCollabId(null);
    fetchCollaborators();
  };

  const uploadCollabPhoto = async (file: File) => {
    setUploadingCollabPhoto(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/collaborators/upload", { method: "POST", headers: { "x-admin-password": password }, body: fd });
    const data = await res.json();
    setUploadingCollabPhoto(false);
    if (data.url) setCollabForm((f) => ({ ...f, photo_url: data.url }));
    else setCollabError(data.error || "Errore nel caricamento foto.");
  };

  useEffect(() => {
    if (authenticated && tab === "ricette") { fetchRecipes(); fetchPdfFiles(); fetchCollaborators(); }
    if (authenticated && tab === "pdf") fetchPdfFiles();
    if (authenticated && tab === "blog") fetchPosts();
    if (authenticated && tab === "social") fetchSocialPosts();
    if (authenticated && tab === "recensioni") fetchTestimonials();
    if (authenticated && tab === "forum") fetchForumThreads();
    if (authenticated && tab === "collaboratori") fetchCollaborators();
  }, [authenticated, tab, fetchRecipes, fetchPdfFiles, fetchPosts, fetchSocialPosts, fetchTestimonials, fetchForumThreads, fetchCollaborators]);

  // Se l'URL contiene ?edit=ID (link dalla email), apri il tab blog o social
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (!editId) return;
    if (params.get("tab") === "social") { setPendingSocialEditId(editId); setTab("social"); }
    else { setPendingEditId(editId); setTab("blog"); }
  }, []);

  // Quando gli articoli sono caricati, apri direttamente quello richiesto dal link
  useEffect(() => {
    if (authenticated && pendingEditId && posts.length) {
      const p = posts.find((x) => x.id === pendingEditId);
      if (p) { openEditPost(p); setPendingEditId(null); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, posts, pendingEditId]);

  // Quando i post social sono caricati, evidenzia quello richiesto dal link email
  useEffect(() => {
    if (authenticated && pendingSocialEditId && socialPosts.length) {
      document.getElementById(`social-${pendingSocialEditId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [authenticated, socialPosts, pendingSocialEditId]);

  // ── Testimonial helpers ──────────────────────────────────────────
  const openNewTesti = () => { setEditingTesti(null); setTestiForm(emptyTestimonial); setTestiError(""); setShowTestiForm(true); };
  const openEditTesti = (t: Testimonial) => {
    setEditingTesti(t);
    setTestiForm({ name: t.name, role: t.role, stars: t.stars, text: t.text, active: t.active, sort_order: t.sort_order });
    setTestiError(""); setShowTestiForm(true);
  };
  const saveTesti = async () => {
    if (!testiForm.name.trim() || !testiForm.text.trim()) { setTestiError("Nome e testo sono obbligatori."); return; }
    setSavingTesti(true); setTestiError("");
    const url = editingTesti ? `/api/testimonials/${editingTesti.id}` : "/api/testimonials";
    const method = editingTesti ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify(testiForm) });
    setSavingTesti(false);
    if (!res.ok) { setTestiError("Errore nel salvataggio."); return; }
    setShowTestiForm(false); fetchTestimonials();
  };
  const deleteTesti = async (id: string) => {
    if (!confirm("Eliminare questa recensione?")) return;
    setDeletingTestiId(id);
    await fetch(`/api/testimonials/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    setDeletingTestiId(null); fetchTestimonials();
  };
  const toggleTesti = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, { method: "PUT", headers: { "Content-Type": "application/json", "x-admin-password": password }, body: JSON.stringify({ active: !t.active }) });
    fetchTestimonials();
  };

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
      level: r.level, file_url: r.file_url, image_url: r.image_url ?? "", active: r.active, sort_order: r.sort_order, collaborator_id: r.collaborator_id ?? null,
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
  <title>${pdfForm.title} — Consulenza Pizzaiolo</title>
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
      <strong>Stefano Porro — Consulenza Pizzaiolo</strong><br/>
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
    <span>© ${new Date().getFullYear()} Consulenza Pizzaiolo — Stefano Porro</span>
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
            <p className="text-gray-500 text-sm">Consulenza Pizzaiolo — Area riservata</p>
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
              <span className="text-white font-semibold text-sm hidden sm:block">Admin</span>
            </div>
            {/* Tabs */}
            <div className="flex bg-dark-800 border border-dark-600 rounded-xl p-1 gap-1">
              {(["iscritti", "ricette", "pdf", "blog", "social", "recensioni", "statistiche", "forum", "collaboratori"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); if (t === "statistiche" && !stats) fetchStats(); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tab === t
                      ? "bg-brand-500 text-white shadow"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t === "iscritti" ? <Users size={14} />
                    : t === "ricette" ? <ChefHat size={14} />
                    : t === "pdf" ? <FileText size={14} />
                    : t === "blog" ? <BookOpen size={14} />
                    : t === "social" ? <Share2 size={14} />
                    : t === "recensioni" ? <Star size={14} />
                    : t === "forum" ? <MessageCircle size={14} />
                    : t === "collaboratori" ? <UserSquare2 size={14} />
                    : <BarChart2 size={14} />}
                  <span className="hidden sm:inline">
                    {t === "iscritti" ? "Iscritti"
                      : t === "ricette" ? "Ricette"
                      : t === "pdf" ? "PDF"
                      : t === "blog" ? "Blog"
                      : t === "social" ? "Social"
                      : t === "recensioni" ? "Recensioni"
                      : t === "forum" ? "Forum"
                      : t === "collaboratori" ? "Collaboratori"
                      : "Statistiche"}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => { localStorage.removeItem("spmab_admin"); setAuthenticated(false); setSubscribers([]); setPassword(""); }}
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

            {subError && (
              <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{subError}</div>
            )}
            <div className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[2fr_3fr_2fr_auto] gap-4 px-6 py-3 border-b border-dark-700 text-gray-500 text-xs uppercase tracking-wide font-semibold">
                <div>Nome</div><div>Email</div><div>Data iscrizione</div><div className="text-right">Azioni</div>
              </div>
              {filteredSubs.length === 0 ? (
                <div className="px-6 py-16 text-center text-gray-600 text-sm">
                  {search ? "Nessun risultato." : "Nessun iscritto ancora."}
                </div>
              ) : (
                <div className="divide-y divide-dark-700">
                  {filteredSubs.map((s) => (
                    <div key={s.id} className="grid grid-cols-[2fr_3fr_2fr_auto] gap-4 px-6 py-4 hover:bg-dark-700/50 transition-colors items-center">
                      {editingSubId === s.id ? (
                        <>
                          <input
                            value={editSubForm.name}
                            onChange={(e) => setEditSubForm((f) => ({ ...f, name: e.target.value }))}
                            className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-500"
                          />
                          <input
                            value={editSubForm.email}
                            onChange={(e) => setEditSubForm((f) => ({ ...f, email: e.target.value }))}
                            className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-brand-500"
                          />
                          <div className="text-gray-500 text-sm">
                            {new Date(s.subscribed_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => saveSub(s.id)} disabled={savingSub} title="Salva" className="text-green-400 hover:text-green-300 disabled:opacity-50">
                              {savingSub ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button onClick={cancelEditSub} disabled={savingSub} title="Annulla" className="text-gray-400 hover:text-white disabled:opacity-50">
                              <X size={16} />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-white text-sm font-medium truncate">{s.name}</div>
                          <div className="text-gray-400 text-sm truncate">{s.email}</div>
                          <div className="text-gray-500 text-sm">
                            {new Date(s.subscribed_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => startEditSub(s)} title="Modifica" className="text-gray-400 hover:text-brand-300">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => deleteSub(s)} disabled={deletingSubId === s.id} title="Elimina" className="text-gray-400 hover:text-red-400 disabled:opacity-50">
                              {deletingSubId === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </div>
                        </>
                      )}
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
                  <div className="mt-4 flex flex-col gap-2">
                    {pdfFiles.map(f => (
                      <div key={f.url} className="flex items-center justify-between bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-gray-500 flex-shrink-0">📄</span>
                          <a href={f.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-gray-300 hover:text-brand-300 transition-colors truncate">
                            {f.name}
                          </a>
                        </div>
                        <button
                          onClick={() => deletePdf(f.name)}
                          disabled={deletingPdf === f.name}
                          className="flex-shrink-0 ml-3 w-7 h-7 rounded-lg bg-dark-600 hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="Elimina PDF"
                        >
                          {deletingPdf === f.name ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
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

        {/* ══ TAB: SOCIAL ═══════════════════════════════════════════ */}
        {tab === "social" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Post Social</h2>
                <p className="text-gray-500 text-sm">
                  {socialPosts.filter((p) => p.status === "draft").length} da revisionare · {socialPosts.filter((p) => p.status === "published").length} pubblicati
                </p>
              </div>
              <button onClick={fetchSocialPosts} disabled={socialLoading} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50">
                <RefreshCw size={14} className={socialLoading ? "animate-spin" : ""} /> Aggiorna
              </button>
            </div>

            {socialError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-3">{socialError}</div>
            )}

            {socialLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="text-brand-400 w-7 h-7 animate-spin" /></div>
            ) : socialPosts.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-600 text-sm bg-dark-800 border border-dark-600 rounded-2xl">
                Nessun post social ancora. Le bozze arrivano automaticamente 3 volte al giorno.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {socialPosts.map((p) => {
                  const highlighted = pendingSocialEditId === p.id;
                  return (
                    <div
                      key={p.id}
                      id={`social-${p.id}`}
                      className={`bg-dark-800 border rounded-2xl p-4 flex flex-col gap-3 ${highlighted ? "border-brand-500 ring-2 ring-brand-500/40" : "border-dark-600"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.status === "published" ? "bg-green-500/15 text-green-300"
                            : p.status === "approved" ? "bg-blue-500/15 text-blue-300"
                            : p.status === "failed" ? "bg-red-500/15 text-red-300"
                            : p.status === "rejected" ? "bg-gray-500/15 text-gray-500"
                            : "bg-yellow-500/15 text-yellow-300"
                        }`}>
                          {p.status === "published" ? "Pubblicato"
                            : p.status === "approved" ? "Approvato"
                            : p.status === "failed" ? "Errore"
                            : p.status === "rejected" ? "Rifiutato"
                            : "Bozza"}
                        </span>
                        <span className="text-gray-500 text-xs">{p.scheduled_slot} · {p.source_type === "post" ? "📝 Articolo" : "🍕 Ricetta"}</span>
                      </div>

                      {p.image_url ? (
                        <div className="relative rounded-xl overflow-hidden border border-dark-500 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image_url} alt="Immagine post" className="w-full h-48 object-cover" />
                          <button
                            type="button"
                            onClick={() => updateSocialPost(p.id, { image_url: "" })}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                            title="Rimuovi immagine"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex items-center justify-center gap-2 bg-dark-700 border border-dashed border-dark-400 hover:border-brand-500 rounded-xl px-4 py-6 transition-colors group">
                          {uploadingSocialId === p.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin text-brand-400" />
                              <span className="text-gray-400 text-sm">Caricamento...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
                              <span className="text-gray-400 group-hover:text-gray-300 text-sm">Carica immagine (foto reale o generata)</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={uploadingSocialId === p.id}
                            onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadSocialImage(p.id, file); e.target.value = ""; }}
                          />
                        </label>
                      )}

                      {editingCaptionId === p.id ? (
                        <textarea
                          rows={5}
                          value={captionDraft}
                          onChange={(e) => setCaptionDraft(e.target.value)}
                          className="w-full bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-brand-500"
                        />
                      ) : (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-6">{p.caption}</p>
                      )}

                      {p.status === "failed" && p.error_message && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-lg px-3 py-2">{p.error_message}</div>
                      )}

                      <div className="flex flex-wrap gap-2 mt-1">
                        {editingCaptionId === p.id ? (
                          <>
                            <button
                              onClick={() => { updateSocialPost(p.id, { caption: captionDraft }); setEditingCaptionId(null); }}
                              disabled={savingSocialId === p.id}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              Salva testo
                            </button>
                            <button onClick={() => setEditingCaptionId(null)} className="border border-dark-500 text-gray-400 rounded-lg px-3 py-1.5 text-xs">
                              Annulla
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => { setEditingCaptionId(p.id); setCaptionDraft(p.caption); }}
                            className="border border-dark-500 text-gray-400 hover:text-white rounded-lg px-3 py-1.5 text-xs transition-colors"
                          >
                            <Pencil size={12} className="inline mr-1" /> Modifica testo
                          </button>
                        )}

                        {(p.status === "draft" || p.status === "rejected") && (
                          <button
                            onClick={() => updateSocialPost(p.id, { status: "approved" })}
                            disabled={!p.image_url || savingSocialId === p.id}
                            className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                            title={!p.image_url ? "Carica prima un'immagine" : undefined}
                          >
                            <Check size={12} className="inline mr-1" /> Approva
                          </button>
                        )}

                        {(p.status === "approved" || p.status === "failed") && (
                          <button
                            onClick={() => publishSocialPost(p.id)}
                            disabled={publishingSocialId === p.id}
                            className="bg-brand-500 hover:bg-brand-400 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {publishingSocialId === p.id
                              ? <Loader2 size={12} className="inline animate-spin mr-1" />
                              : <Send size={12} className="inline mr-1" />}
                            {p.status === "failed" ? "Riprova pubblicazione" : "Pubblica ora"}
                          </button>
                        )}

                        {p.status !== "published" && (
                          <button
                            onClick={() => deleteSocialPost(p.id)}
                            disabled={deletingSocialId === p.id}
                            className="border border-dark-500 text-gray-500 hover:text-red-400 hover:border-red-500/40 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
                          >
                            {deletingSocialId === p.id ? <Loader2 size={12} className="inline animate-spin" /> : "Rifiuta"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══ TAB: FORUM ════════════════════════════════════════════ */}
        {tab === "forum" && (
          <div className="flex gap-6 h-[70vh]">
            {/* Lista thread */}
            <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white font-semibold">Discussioni</h2>
                <button onClick={() => setShowNewThread(true)}
                  className="flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                  <Plus size={14} /> Nuova
                </button>
              </div>
              {showNewThread && (
                <div className="bg-dark-700 border border-dark-500 rounded-xl p-4 flex flex-col gap-3">
                  <input type="text" placeholder="Titolo discussione" value={newThreadForm.title}
                    onChange={(e) => setNewThreadForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-dark-800 border border-dark-500 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-brand-500" />
                  <textarea rows={3} placeholder="Testo..." value={newThreadForm.body}
                    onChange={(e) => setNewThreadForm(f => ({ ...f, body: e.target.value }))}
                    className="w-full bg-dark-800 border border-dark-500 rounded-xl px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-brand-500" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowNewThread(false)}
                      className="flex-1 border border-dark-500 text-gray-400 rounded-lg py-1.5 text-xs">Annulla</button>
                    <button onClick={createAdminThread} disabled={savingThread}
                      className="flex-1 bg-brand-500 text-white rounded-lg py-1.5 text-xs font-medium disabled:opacity-60">
                      {savingThread ? "..." : "Pubblica"}
                    </button>
                  </div>
                </div>
              )}
              {forumLoading ? (
                <div className="text-gray-500 text-sm text-center py-8">Caricamento...</div>
              ) : forumThreads.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-8">Nessuna discussione</div>
              ) : (
                forumThreads.map((t) => (
                  <button key={t.id} onClick={() => openForumThread(t)}
                    className={`text-left p-3 rounded-xl border transition-all ${openThread?.thread.id === t.id ? "border-brand-500/60 bg-brand-500/10" : "border-dark-600 hover:border-dark-500"} ${!t.visible ? "opacity-50" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-white text-sm font-medium line-clamp-1">{t.pinned && "📌 "}{t.title}</span>
                      <span className="text-gray-600 text-xs shrink-0">{t.reply_count} risp.</span>
                    </div>
                    <div className="text-gray-500 text-xs line-clamp-1">{t.body}</div>
                    <div className="text-gray-600 text-xs mt-1">di {t.author_name}</div>
                  </button>
                ))
              )}
            </div>

            {/* Dettaglio thread */}
            <div className="flex-1 flex flex-col border border-dark-600 rounded-2xl overflow-hidden">
              {!openThread ? (
                <div className="flex-1 flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Seleziona una discussione</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header thread */}
                  <div className="p-4 border-b border-dark-600 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{openThread.thread.title}</h3>
                      <p className="text-gray-400 text-sm">{openThread.thread.body}</p>
                      <p className="text-gray-600 text-xs mt-1">di {openThread.thread.author_name} — {openThread.thread.author_email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleThreadPinned(openThread.thread)} title={openThread.thread.pinned ? "Rimuovi da evidenza" : "Metti in evidenza"}
                        className={`p-1.5 rounded-lg transition-colors ${openThread.thread.pinned ? "text-brand-400 bg-brand-500/10" : "text-gray-500 hover:text-brand-400"}`}>
                        <Pin size={14} />
                      </button>
                      <button onClick={() => toggleThreadVisible(openThread.thread)} title={openThread.thread.visible ? "Nascondi" : "Mostra"}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 transition-colors">
                        {openThread.thread.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => deleteThread(openThread.thread.id)} title="Elimina discussione"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Risposte */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    {openThread.replies.length === 0 && (
                      <p className="text-gray-600 text-sm text-center py-6">Nessuna risposta ancora.</p>
                    )}
                    {openThread.replies.map((r) => (
                      <div key={r.id} className={`rounded-xl p-3 ${r.is_admin ? "bg-brand-500/10 border border-brand-500/20" : "bg-dark-700 border border-dark-600"}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`text-xs font-semibold ${r.is_admin ? "text-brand-300" : "text-gray-300"}`}>
                            {r.is_admin ? "👨‍🍳 Stefano Porro" : r.author_name}
                          </span>
                          <button onClick={() => deleteReply(r.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{r.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Box risposta admin */}
                  <div className="p-4 border-t border-dark-600 flex gap-2">
                    <textarea rows={2} placeholder="Scrivi la tua risposta come Stefano Porro..."
                      value={forumReply}
                      onChange={(e) => setForumReply(e.target.value)}
                      className="flex-1 bg-dark-700 border border-dark-500 rounded-xl px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-brand-500" />
                    <button onClick={sendForumReply} disabled={sendingReply || !forumReply.trim()}
                      className="bg-brand-500 hover:bg-brand-400 text-white px-4 rounded-xl disabled:opacity-50 transition-colors">
                      {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: STATISTICHE ══════════════════════════════════════ */}
        {tab === "statistiche" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Statistiche sito</h2>
                <p className="text-gray-500 text-sm">Visite e pagine più viste</p>
              </div>
              <button onClick={fetchStats} disabled={statsLoading} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50">
                <RefreshCw size={14} className={statsLoading ? "animate-spin" : ""} />
                Aggiorna
              </button>
            </div>

            {statsLoading && (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2 size={24} className="animate-spin mr-3" /> Caricamento statistiche...
              </div>
            )}

            {!statsLoading && stats && (
              <>
                {/* KPI */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="card">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="text-brand-400 w-4 h-4" /><span className="text-gray-400 text-xs">Oggi</span></div>
                    <div className="font-display text-3xl font-bold gradient-text">{stats.todayTotal}</div>
                    <div className="text-gray-600 text-xs mt-1">visite</div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-2 mb-2"><BarChart2 className="text-brand-400 w-4 h-4" /><span className="text-gray-400 text-xs">Questo mese</span></div>
                    <div className="font-display text-3xl font-bold gradient-text">{stats.monthlyTotal}</div>
                    <div className="text-gray-600 text-xs mt-1">visite totali</div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-2 mb-2"><Globe className="text-brand-400 w-4 h-4" /><span className="text-gray-400 text-xs">Pagine uniche</span></div>
                    <div className="font-display text-3xl font-bold gradient-text">{stats.topPages.length}</div>
                    <div className="text-gray-600 text-xs mt-1">pagine visitate</div>
                  </div>
                  <div className="card">
                    <div className="flex items-center gap-2 mb-2"><Clock className="text-brand-400 w-4 h-4" /><span className="text-gray-400 text-xs">Ultime 200</span></div>
                    <div className="font-display text-3xl font-bold gradient-text">{stats.recentViews.length}</div>
                    <div className="text-gray-600 text-xs mt-1">visite registrate</div>
                  </div>
                </div>

                {/* Grafico 7 giorni */}
                <div className="card mb-6">
                  <h3 className="text-white font-semibold text-sm mb-4">📊 Ultimi 7 giorni</h3>
                  <div className="flex items-end gap-2 h-24">
                    {(() => {
                      const max = Math.max(...stats.dailyTotals.map(d => d.count), 1);
                      return stats.dailyTotals.map(({ date, count }) => {
                        const height = Math.max((count / max) * 100, 4);
                        const label = new Date(date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "short", day: "numeric" });
                        return (
                          <div key={date} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-gray-500 text-xs">{count > 0 ? count : ""}</span>
                            <div
                              className="w-full rounded-t-md bg-brand-500/70 hover:bg-brand-400 transition-colors"
                              style={{ height: `${height}%` }}
                              title={`${label}: ${count} visite`}
                            />
                            <span className="text-gray-600 text-xs text-center leading-tight">{label}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Top pagine */}
                  <div className="card">
                    <h3 className="text-white font-semibold text-sm mb-4">🏆 Pagine più visitate (30 gg)</h3>
                    <div className="space-y-2">
                      {stats.topPages.length === 0 && <p className="text-gray-500 text-sm">Nessun dato ancora</p>}
                      {stats.topPages.map(({ path, count }) => {
                        const max = stats.topPages[0]?.count || 1;
                        return (
                          <div key={path}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-300 truncate max-w-[200px]">{pageName(path)}</span>
                              <span className="text-brand-400 font-semibold ml-2">{count}</span>
                            </div>
                            <div className="h-1.5 bg-dark-700 rounded-full">
                              <div className="h-1.5 bg-brand-500 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Provenienza */}
                  <div className="card">
                    <h3 className="text-white font-semibold text-sm mb-4">🔀 Da dove vengono</h3>
                    <div className="space-y-2">
                      {(() => {
                        const refMap: Record<string, number> = {};
                        for (const v of stats.recentViews) {
                          const name = referrerName(v.referrer);
                          refMap[name] = (refMap[name] || 0) + 1;
                        }
                        const sorted = Object.entries(refMap).sort(([,a],[,b]) => b - a).slice(0, 8);
                        const max = sorted[0]?.[1] || 1;
                        return sorted.length === 0
                          ? <p className="text-gray-500 text-sm">Nessun dato ancora</p>
                          : sorted.map(([source, count]) => (
                            <div key={source}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300">{source === "Diretto" ? "🔗 Diretto" : `🌐 ${source}`}</span>
                                <span className="text-brand-400 font-semibold">{count}</span>
                              </div>
                              <div className="h-1.5 bg-dark-700 rounded-full">
                                <div className="h-1.5 bg-brand-400/70 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* Lista visite recenti */}
                <div className="card">
                  <h3 className="text-white font-semibold text-sm mb-4">🕐 Visite recenti</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-600">
                          <th className="text-left text-gray-500 text-xs uppercase tracking-wide pb-3 pr-4">Pagina</th>
                          <th className="text-left text-gray-500 text-xs uppercase tracking-wide pb-3 pr-4">Provenienza</th>
                          <th className="text-left text-gray-500 text-xs uppercase tracking-wide pb-3">Data e ora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentViews.map((v, i) => (
                          <tr key={i} className="border-b border-dark-700/50 hover:bg-dark-700/30 transition-colors">
                            <td className="py-2.5 pr-4 text-gray-300">{pageName(v.path)}</td>
                            <td className="py-2.5 pr-4 text-gray-400 text-xs">
                              {v.referrer ? (
                                <span title={v.referrer}>🌐 {referrerName(v.referrer)}</span>
                              ) : (
                                <span className="text-gray-600">🔗 Diretto</span>
                              )}
                            </td>
                            <td className="py-2.5 text-gray-500 text-xs whitespace-nowrap">
                              {new Date(v.created_at).toLocaleString("it-IT", {
                                day: "2-digit", month: "2-digit", year: "2-digit",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))}
                        {stats.recentViews.length === 0 && (
                          <tr><td colSpan={3} className="py-8 text-center text-gray-500">Nessuna visita registrata ancora</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══ TAB: RECENSIONI ═══════════════════════════════════════ */}
        {tab === "recensioni" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Gestione Recensioni</h2>
                <p className="text-gray-500 text-sm">
                  {testimonials.filter(t => t.active).length} visibili · {testimonials.filter(t => !t.active).length} nascoste
                </p>
              </div>
              <button onClick={openNewTesti} className="btn-primary text-sm px-5 py-2.5">
                <Plus size={16} /> Nuova recensione
              </button>
            </div>

            {testiLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="text-brand-400 w-7 h-7 animate-spin" /></div>
            ) : (
              <div className="flex flex-col gap-4">
                {testimonials.length === 0 ? (
                  <div className="bg-dark-800 border border-dark-600 rounded-2xl px-6 py-16 text-center text-gray-600 text-sm">
                    Nessuna recensione. Clicca &quot;Nuova recensione&quot; per aggiungerne una.
                  </div>
                ) : (
                  testimonials.map((t) => (
                    <div key={t.id} className="bg-dark-800 border border-dark-600 rounded-2xl p-5 flex items-start gap-4 hover:bg-dark-700/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{t.name}</span>
                          {t.role && <span className="text-gray-500 text-xs">· {t.role}</span>}
                          <div className="flex gap-0.5 ml-1">
                            {Array.from({ length: t.stars }).map((_, i) => (
                              <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">&ldquo;{t.text}&rdquo;</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => toggleTesti(t)} title={t.active ? "Visibile" : "Nascosta"}>
                          {t.active ? <ToggleRight size={22} className="text-brand-400" /> : <ToggleLeft size={22} className="text-gray-600" />}
                        </button>
                        <button onClick={() => openEditTesti(t)} className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-brand-500/20 text-gray-400 hover:text-brand-300 flex items-center justify-center transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteTesti(t.id)}
                          disabled={deletingTestiId === t.id}
                          className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          {deletingTestiId === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ══ TAB: COLLABORATORI ══════════════════════════════════════ */}
        {tab === "collaboratori" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Gestione Collaboratori</h2>
                <p className="text-gray-500 text-sm">{collaborators.length} collaboratori · la pagina pubblica è su /collaboratori</p>
              </div>
              <button onClick={openNewCollab} className="btn-primary text-sm px-5 py-2.5">
                <Plus size={16} /> Nuovo collaboratore
              </button>
            </div>

            {collabLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="text-brand-400 w-7 h-7 animate-spin" /></div>
            ) : collaborators.length === 0 ? (
              <div className="bg-dark-800 border border-dark-600 rounded-2xl px-6 py-16 text-center text-gray-600 text-sm">
                Nessun collaboratore. Clicca &quot;Nuovo collaboratore&quot; per aggiungerne uno.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collaborators.map((c) => (
                  <div key={c.id} className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden hover:bg-dark-700/40 transition-colors">
                    {c.photo_url ? (
                      <img src={c.photo_url} alt={c.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-dark-700 flex items-center justify-center">
                        <UserSquare2 className="text-gray-600 w-10 h-10" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="text-white font-semibold text-sm">{c.name}</div>
                          {c.specialty && <div className="text-brand-400 text-xs">{c.specialty}</div>}
                          {c.city && <div className="flex items-center gap-1 text-gray-500 text-xs mt-1"><MapPin size={10} />{c.city}</div>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => openEditCollab(c)} className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-brand-500/20 text-gray-400 hover:text-brand-300 flex items-center justify-center transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => deleteCollab(c)} disabled={deletingCollabId === c.id} className="w-7 h-7 rounded-lg bg-dark-700 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-colors disabled:opacity-50">
                            {deletingCollabId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>
                      {c.bio && <p className="text-gray-500 text-xs line-clamp-2 mt-2">{c.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>{/* fine max-w-6xl */}

      {/* ══ COLLABORATORE FORM MODAL ══════════════════════════════════ */}
      {showCollabForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <h3 className="text-white font-semibold text-lg">
                {editingCollab ? "Modifica collaboratore" : "Nuovo collaboratore"}
              </h3>
              <button onClick={() => setShowCollabForm(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">

              {/* Foto */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Foto</label>
                {collabForm.photo_url ? (
                  <div className="relative w-24 h-24 mb-2">
                    <img src={collabForm.photo_url} alt="Anteprima" className="w-24 h-24 rounded-xl object-cover" />
                    <button onClick={() => setCollabForm((f) => ({ ...f, photo_url: "" }))} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 cursor-pointer w-fit bg-dark-700 hover:bg-dark-600 border border-dark-500 rounded-xl px-4 py-2 text-sm text-gray-400 transition-colors">
                    {uploadingCollabPhoto ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingCollabPhoto ? "Caricamento..." : "Carica foto"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadCollabPhoto(e.target.files[0]); }} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Nome *</label>
                  <input type="text" value={collabForm.name} onChange={(e) => setCollabForm((f) => ({ ...f, name: e.target.value, slug: f.slug || toSlug(e.target.value) }))}
                    placeholder="Mario Rossi"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Slug URL</label>
                  <input type="text" value={collabForm.slug} onChange={(e) => setCollabForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="mario-rossi"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Specialità</label>
                  <input type="text" value={collabForm.specialty} onChange={(e) => setCollabForm((f) => ({ ...f, specialty: e.target.value }))}
                    placeholder="Pizza napoletana"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Città</label>
                  <input type="text" value={collabForm.city} onChange={(e) => setCollabForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Napoli"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Bio</label>
                <textarea rows={3} value={collabForm.bio} onChange={(e) => setCollabForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Breve descrizione della persona..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 text-sm resize-none" />
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setCollabForm((f) => ({ ...f, active: !f.active }))} className="text-gray-400 hover:text-white transition-colors">
                  {collabForm.active ? <ToggleRight size={24} className="text-brand-400" /> : <ToggleLeft size={24} />}
                </button>
                <span className="text-sm text-gray-400">{collabForm.active ? "Visibile sul sito" : "Nascosto"}</span>
              </div>

              {collabError && <p className="text-red-400 text-sm">{collabError}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCollabForm(false)} className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  Annulla
                </button>
                <button onClick={saveCollab} disabled={savingCollab} className="flex-1 btn-primary disabled:opacity-70">
                  {savingCollab ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {editingCollab ? "Salva modifiche" : "Crea collaboratore"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TESTIMONIAL FORM MODAL ═══════════════════════════════════ */}
      {showTestiForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-dark-600 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-dark-700">
              <h3 className="text-white font-semibold text-lg">
                {editingTesti ? "Modifica recensione" : "Nuova recensione"}
              </h3>
              <button onClick={() => setShowTestiForm(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Nome *</label>
                  <input type="text" value={testiForm.name} onChange={(e) => setTestiForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Mario Rossi"
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Ruolo</label>
                  <input type="text" value={testiForm.role} onChange={(e) => setTestiForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="Es. Pizzaiolo, Local Guide..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Stelle</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setTestiForm(f => ({ ...f, stars: n }))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${testiForm.stars >= n ? "bg-yellow-500/20 text-yellow-400" : "bg-dark-700 text-gray-600"}`}>
                      <Star size={16} className={testiForm.stars >= n ? "fill-yellow-400" : ""} />
                    </button>
                  ))}
                  <span className="text-gray-500 text-sm self-center ml-1">{testiForm.stars}/5</span>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Testo recensione *</label>
                <textarea rows={4} value={testiForm.text} onChange={(e) => setTestiForm(f => ({ ...f, text: e.target.value }))}
                  placeholder="Scrivi il testo della recensione..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Ordine</label>
                  <input type="number" value={testiForm.sort_order} onChange={(e) => setTestiForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Visibile</label>
                  <button type="button" onClick={() => setTestiForm(f => ({ ...f, active: !f.active }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-colors w-full ${testiForm.active ? "bg-brand-500/20 border-brand-500/40 text-brand-300" : "bg-dark-700 border-dark-500 text-gray-400"}`}>
                    {testiForm.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {testiForm.active ? "Visibile" : "Nascosta"}
                  </button>
                </div>
              </div>
              {testiError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{testiError}</p>}
            </div>
            <div className="flex items-center gap-3 p-6 border-t border-dark-700">
              <button onClick={() => setShowTestiForm(false)} className="flex-1 border border-dark-500 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">Annulla</button>
              <button onClick={saveTesti} disabled={savingTesti} className="flex-1 btn-primary justify-center text-sm py-2.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
                {savingTesti ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                {editingTesti ? "Salva modifiche" : "Aggiungi"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Autore</label>
                <select
                  value={recipeForm.collaborator_id ?? ""}
                  onChange={(e) => setRecipeForm({ ...recipeForm, collaborator_id: e.target.value || null })}
                  className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                >
                  <option value="" className="bg-dark-700">👨‍🍳 Stefano Porro (tu)</option>
                  {collaborators.map((c) => (
                    <option key={c.id} value={c.id} className="bg-dark-700">{c.name}</option>
                  ))}
                </select>
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

              {/* Immagine ricetta */}
              <div>
                <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Immagine ricetta</label>
                {recipeForm.image_url ? (
                  <div className="relative rounded-xl overflow-hidden mb-2">
                    <img src={recipeForm.image_url} alt="Anteprima" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => setRecipeForm({ ...recipeForm, image_url: "" })}
                      className="absolute top-2 right-2 bg-dark-900/80 text-white rounded-lg p-1.5 hover:bg-red-500/80 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-dark-500 rounded-xl p-6 cursor-pointer hover:border-brand-500/50 transition-colors">
                    {uploadingRecipeImg ? (
                      <Loader2 size={20} className="text-brand-400 animate-spin mb-2" />
                    ) : (
                      <ChefHat size={20} className="text-gray-600 mb-2" />
                    )}
                    <span className="text-gray-500 text-xs">{uploadingRecipeImg ? "Caricamento..." : "Clicca per caricare un'immagine"}</span>
                    <span className="text-gray-600 text-xs mt-0.5">JPG, PNG, WebP — max 5MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingRecipeImg}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingRecipeImg(true);
                        const fd = new FormData();
                        fd.append("file", file);
                        const res = await fetch("/api/recipes/upload", {
                          method: "POST",
                          headers: { "x-admin-password": password },
                          body: fd,
                        });
                        const data = await res.json();
                        setUploadingRecipeImg(false);
                        if (data.url) setRecipeForm(f => ({ ...f, image_url: data.url }));
                        else alert(data.error ?? "Errore upload");
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
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
