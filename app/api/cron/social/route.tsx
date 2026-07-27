import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { waitUntil } from "@vercel/functions";
import { generateSocialCoverImage } from "@/lib/social-image";

export const maxDuration = 60;

const VALID_SLOTS = ["12:00", "18:00", "20:30"];

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = req.headers.get("x-admin-password");
  return (
    (!cronSecret || authHeader === `Bearer ${cronSecret}`) ||
    (!!process.env.ADMIN_PASSWORD && adminPassword === process.env.ADMIN_PASSWORD)
  );
}

const ANGLES = ["tecnica", "ingredienti", "attrezzatura", "business", "storia", "gourmet", "miti", "faq", "avviare", "vita"] as const;
type Angle = (typeof ANGLES)[number];

const ANGLE_CATEGORIES = `1. tecnica — Tecnica e impasto (idratazione, biga e poolish, gestione della biga a lunga fermentazione, temperatura dell'acqua, il ruolo dell'acqua e la sua durezza/pH, cornicione, autolisi, lievito madre, fermentazione, errori di cottura, il ruolo del malto, staglio e puntatura, differenza tra impasto diretto e indiretto, errori nella gestione delle farciture pre/post cottura)
2. ingredienti — Ingredienti e materie prime (il pomodoro giusto, stagionalità del pomodoro e alternative fuori stagione, la mozzarella e l'umidità, farine alternative, differenza tra farina 00, 0 e integrale nella resa, come leggere una scheda tecnica della farina (W, P/L), il ruolo dell'olio EVO, le sfide reali della pizza senza glutine, stagionalità)
3. attrezzatura — Attrezzatura e ambiente di lavoro (scelta del forno, manutenzione ordinaria del forno, cella frigorifera, attrezzi del pizzaiolo, la pala)
4. business — Business e gestione di una pizzeria già avviata (food cost, come calcolare il prezzo di una pizza dal food cost reale, il menù, marketing, recensioni online, il ruolo dei social nella scelta della pizzeria da parte del cliente, gestione del personale, gestione del rush del sabato sera, come formare un nuovo pizzaiolo assunto in due settimane, sostenibilità e sprechi in pizzeria)
5. storia — Cultura e storia (storia del grano e delle farine, storia della pizza, differenze tra stili regionali italiani, la filosofia della lunga lievitazione e alta idratazione diffusa da Gabriele Bonci, l'eredità di Gabriele Bonci nel rendere la pizza al taglio romana un prodotto gourmet popolare)
6. gourmet — Ricette gourmet (abbinamenti non convenzionali, contaminazioni con l'alta cucina, pizze gourmet stagionali, l'approccio alla pizza gourmet ma popolare in stile Gabriele Bonci, l'attenzione alla selezione e tracciabilità delle farine come nell'approccio di Bonci, il principio "meno ingredienti, più qualità" nella farcitura)
7. miti — Miti e disinformazione sulla pizza (falsi miti generali, es. "il forno a legna è sempre meglio dell'elettrico", "la pizza gourmet è solo marketing")
8. faq — Domande frequenti dei clienti (perché costa di più, tempi di attesa, opzioni senza glutine, come gestire allergie e intolleranze in menù, differenza tra pizza al piatto e pizza al taglio nella gestione del servizio, cosa chiedono spesso al banco)
9. avviare — Aprire e avviare una pizzeria o un percorso di formazione tecnica (errori tipici dei primi mesi, business plan, scelte iniziali, storie generiche di aperture riuscite)
10. vita — Vita da pizzaiolo/formatore (dietro le quinte, giornata tipo, aneddoti personali)`;

type SourceContent = {
  sourceType: "post" | "recipe" | "standalone";
  sourceId: string | null;
  title: string;
  summary: string;
  usedAngles: Angle[];
  forcedAngle?: Angle;
  forcedSubtopic?: string;
  lastUsedAngle?: string | null;
};

const BONCI_SUBTOPICS = [
  "la filosofia della lunga lievitazione e alta idratazione diffusa da Gabriele Bonci",
  "l'eredità di Gabriele Bonci nel rendere la pizza al taglio romana un prodotto gourmet popolare",
  "l'approccio alla pizza gourmet ma popolare in stile Gabriele Bonci",
  "l'attenzione alla selezione e tracciabilità delle farine come nell'approccio di Bonci",
  "il principio \"meno ingredienti, più qualità\" nella farcitura, in stile Bonci",
];

async function shouldForceBonci(): Promise<boolean> {
  const { data } = await supabase
    .from("social_posts")
    .select("subtopic, caption")
    .order("created_at", { ascending: false })
    .limit(30);
  return !(data ?? []).some(
    (row) => (row.subtopic ?? "").toLowerCase().includes("bonci") || (row.caption ?? "").toLowerCase().includes("bonci")
  );
}

async function pickLeastUsedAngle(avoid?: string | null): Promise<Angle> {
  const { data } = await supabase.from("social_posts").select("angle");
  const counts: Record<string, number> = Object.fromEntries(ANGLES.map((a) => [a, 0]));
  for (const row of data ?? []) {
    if (row.angle && counts[row.angle] !== undefined) counts[row.angle]++;
  }
  const min = Math.min(...ANGLES.map((a) => counts[a]));
  let tied = ANGLES.filter((a) => counts[a] === min);
  if (avoid && tied.length > 1) tied = tied.filter((a) => a !== avoid);
  return tied[Math.floor(Math.random() * tied.length)];
}

async function getLastUsedAngle(): Promise<string | null> {
  const { data } = await supabase
    .from("social_posts")
    .select("angle")
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0]?.angle ?? null;
}

async function pickBestCandidate<T extends { id: string }>(
  candidates: T[],
  sourceType: "post" | "recipe"
): Promise<{ chosen: T; usedAngles: Angle[] } | null> {
  if (candidates.length === 0) return null;

  const { data: used } = await supabase
    .from("social_posts")
    .select("source_id, angle, created_at")
    .eq("source_type", sourceType)
    .order("created_at", { ascending: true });

  const anglesBySource = new Map<string, Set<string>>();
  const lastUsedBySource = new Map<string, string>();
  for (const row of used ?? []) {
    if (!row.source_id) continue;
    if (!anglesBySource.has(row.source_id)) anglesBySource.set(row.source_id, new Set());
    if (row.angle) anglesBySource.get(row.source_id)!.add(row.angle);
    lastUsedBySource.set(row.source_id, row.created_at);
  }

  let bestCount = Infinity;
  for (const c of candidates) {
    const usedCount = anglesBySource.get(c.id)?.size ?? 0;
    if (usedCount < bestCount) bestCount = usedCount;
  }

  if (bestCount < ANGLES.length) {
    // Tra le fonti a pari merito (stesso numero di angoli usati), sceglie a caso invece di prendere sempre la prima
    const tied = candidates.filter((c) => (anglesBySource.get(c.id)?.size ?? 0) === bestCount);
    const chosen = tied[Math.floor(Math.random() * tied.length)];
    return { chosen, usedAngles: Array.from(anglesBySource.get(chosen.id) ?? []) as Angle[] };
  }

  // Tutte le fonti hanno esaurito i 6 angoli: ripiega sulla meno usata di recente
  const sorted = [...candidates].sort((a, b) => {
    const at = lastUsedBySource.get(a.id) ?? "";
    const bt = lastUsedBySource.get(b.id) ?? "";
    return at.localeCompare(bt);
  });
  const chosen = sorted[0];
  return { chosen, usedAngles: Array.from(anglesBySource.get(chosen.id) ?? []) as Angle[] };
}

async function pickSource(): Promise<SourceContent | null> {
  const { count } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true });
  const n = count ?? 0;
  const lastUsedAngle = await getLastUsedAngle();

  // 1 generazione su 3 pesca da blog/ricette (alternati), 2 su 3 sono contenuto standalone
  if (n % 3 !== 0) {
    const angle = await pickLeastUsedAngle(lastUsedAngle);
    let forcedSubtopic: string | undefined;
    if ((angle === "storia" || angle === "gourmet") && (await shouldForceBonci())) {
      forcedSubtopic = BONCI_SUBTOPICS[Math.floor(Math.random() * BONCI_SUBTOPICS.length)];
    }
    return { sourceType: "standalone", sourceId: null, title: "", summary: "", usedAngles: [], forcedAngle: angle, forcedSubtopic, lastUsedAngle };
  }

  const useRecipe = Math.floor(n / 3) % 2 === 1;

  if (!useRecipe) {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, title, excerpt")
      .eq("published", true);
    const result = await pickBestCandidate(posts ?? [], "post");
    if (!result) return null;
    return {
      sourceType: "post",
      sourceId: result.chosen.id,
      title: result.chosen.title,
      summary: result.chosen.excerpt,
      usedAngles: result.usedAngles,
      lastUsedAngle,
    };
  }

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, description, category")
    .eq("active", true)
    .is("collaborator_id", null);
  const result = await pickBestCandidate(recipes ?? [], "recipe");
  if (!result) return null;
  return {
    sourceType: "recipe",
    sourceId: result.chosen.id,
    title: result.chosen.title,
    summary: result.chosen.description || result.chosen.category,
    usedAngles: result.usedAngles,
    lastUsedAngle,
  };
}

function extractJson(rawText: string): { caption: string; hashtags: string[]; angle: string; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string; subtopic_is_similar_to_recent?: boolean } {
  const start = rawText.indexOf("{");
  if (start === -1) throw new Error("no {");
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = start; i < rawText.length; i++) {
    const ch = rawText[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\" && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("no closing }");
  return JSON.parse(rawText.slice(start, end + 1));
}

async function getRecentTopicHistory(): Promise<{ block: string; recentCaptions: string[] }> {
  const { data: blogPosts } = await supabase
    .from("posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(60);
  const blogTitles = (blogPosts ?? []).map((p) => `- ${p.title}`).join("\n") || "Nessuno";

  const { data: recentSocial } = await supabase
    .from("social_posts")
    .select("caption, created_at")
    .order("created_at", { ascending: false })
    .limit(15);
  const socialSnippets = (recentSocial ?? [])
    .map((p) => `- ${p.caption.split("\n")[0].slice(0, 120)}`)
    .join("\n") || "Nessuno";

  const block = `Titoli di TUTTI gli articoli blog già pubblicati (compresi quelli non usati finora per i social):
${blogTitles}

Apertura delle ultime caption social/Reel già create (comprese quelle rifiutate da Stefano — se un argomento specifico è già qui, evitalo, vuol dire che è già stato trattato o non è piaciuto):
${socialSnippets}`;

  return { block, recentCaptions: (recentSocial ?? []).map((p) => p.caption as string) };
}

async function getRecentSubtopicsByAngle(): Promise<{ block: string; byAngle: Map<string, string[]> }> {
  const { data } = await supabase
    .from("social_posts")
    .select("angle, subtopic, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  const byAngle = new Map<string, string[]>();
  for (const row of data ?? []) {
    if (!row.angle || !row.subtopic) continue;
    if (!byAngle.has(row.angle)) byAngle.set(row.angle, []);
    const list = byAngle.get(row.angle)!;
    if (list.length < 8) list.push(row.subtopic as string);
  }

  const block =
    byAngle.size === 0
      ? "Nessun sotto-argomento specifico usato finora."
      : Array.from(byAngle.entries())
          .map(([angle, subtopics]) => `- ${angle}: ${subtopics.join(" | ")}`)
          .join("\n");

  return { block, byAngle };
}

function normalizeOpening(text: string): string {
  return text
    .split("\n")[0]
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join(" ");
}

function openingCollides(caption: string, recentCaptions: string[]): boolean {
  const newOpening = normalizeOpening(caption);
  if (!newOpening) return false;
  return recentCaptions.some((c) => normalizeOpening(c) === newOpening);
}

function buildContentPrompt(source: SourceContent, history: string, subtopicsByAngle: string): string {
  const historyBlock = `${history}

IMPORTANTE: anche se l'angolo/categoria è diverso, NON ritrattare uno specifico argomento/tecnica (es. "autolisi", "biga e poolish") già coperto in dettaglio in uno dei titoli o caption sopra. Se il tema è già stato trattato, scegli un sotto-argomento distinto o un taglio narrativo chiaramente diverso.

Sotto-argomenti specifici già usati di recente per ciascun angolo (NON riusare la stessa tesi/argomento centrale, anche riformulato — scegline uno diverso della stessa categoria):
${subtopicsByAngle}

Dichiara nel campo "subtopic" una frase breve (3-6 parole) che descriva lo specifico sotto-argomento/tesi che hai scelto per QUESTA caption, diverso da quelli elencati sopra per lo stesso angolo.

ATTENZIONE — il confronto con i sotto-argomenti sopra deve essere sul SIGNIFICATO, non sulle parole usate: due tesi che raccontano la stessa idea di fondo con parole diverse (es. "differenze tra pizza napoletana e romana" e "origini degli stili regionali italiani" sono la STESSA tesi, solo riformulata) contano come ripetizione. Prima di rispondere, controlla onestamente se la tua tesi è concettualmente la stessa di una già elencata per questo angolo; imposta il campo "subtopic_is_similar_to_recent" a true se lo è (anche solo in parte), false se è davvero un'idea distinta.`;

  if (source.sourceType === "standalone") {
    const forcedSubtopicBlock = source.forcedSubtopic
      ? `\nSOTTO-ARGOMENTO GIÀ ASSEGNATO (obbligatorio, non sceglierne un altro): ${source.forcedSubtopic}. Scrivi la caption specificamente su questo tema — resta sugli aspetti pubblicamente noti, senza inventare citazioni dirette. Nel campo "subtopic" della risposta usa questa stessa frase (o una lieve riformulazione che la mantenga riconoscibile).\n`
      : "";

    return `Scrivi una caption per un post Instagram/Facebook come contenuto originale (non parte da un articolo specifico del sito), sul seguente angolo:

${ANGLE_CATEGORIES}

Angolo da trattare: "${source.forcedAngle}" (usa esattamente questo valore nel campo "angle" della risposta).
${forcedSubtopicBlock}
${historyBlock}

Scrivi un aneddoto storico verificabile, uno sfatamento di un mito comune, o un tip pratico su questo tema — mai inventare fatti falsi, se non sei sicuro di un dettaglio storico resta sul generico piuttosto che inventare date o nomi.`;
  }

  const avoidBlock = `${source.usedAngles.length
    ? `Angoli già usati per questa fonte (NON riusarli se possibile): ${source.usedAngles.join(", ")}.`
    : "Nessun angolo ancora usato per questa fonte."}${
    source.lastUsedAngle
      ? `\nATTENZIONE: l'ultimo angolo usato in assoluto (indipendentemente dalla fonte, anche su un altro articolo/ricetta) è "${source.lastUsedAngle}" — NON sceglierlo di nuovo per questa generazione anche se per questa fonte specifica risulta libero: serve varietà tra una pubblicazione e l'altra, non solo per singola fonte.`
      : ""
  }`;

  return `Scrivi una caption per un post Instagram/Facebook a partire da questo contenuto del sito:
Titolo: ${source.title}
Sintesi: ${source.summary}

Gli angoli possibili sono questi 6:
${ANGLE_CATEGORIES}

${avoidBlock}
Scegli un angolo NON ancora usato per questa fonte (se ce n'è almeno uno libero) e dichiaralo nel campo "angle" della risposta con il suo codice (tecnica/ingredienti/attrezzatura/business/storia/gourmet/miti/faq/avviare/vita). Reinterpreta il contenuto del sito sotto quella lente, senza inventare fatti che non c'entrano con la fonte.

${historyBlock}`;
}

type ParsedCaption = { caption: string; hashtags: string[]; angle: string; image_headline?: string; image_prompt?: string; unsplash_query?: string; subtopic?: string; subtopic_is_similar_to_recent?: boolean };

async function callClaudeForCaption(anthropicKey: string, promptBody: string): Promise<ParsedCaption | null> {
  try {
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: promptBody }],
      }),
    });

    if (!claudeRes.ok) {
      console.error("[social-cron] Errore Claude API", await claudeRes.text());
      return null;
    }

    const claudeData = await claudeRes.json();
    const rawText = (claudeData?.content?.[0]?.text as string | undefined)?.trim();
    if (!rawText) {
      console.error("[social-cron] Risposta Claude senza testo", JSON.stringify(claudeData));
      return null;
    }

    return extractJson(rawText);
  } catch (e) {
    console.error("[social-cron] Errore chiamata/parsing Claude", e);
    return null;
  }
}

function buildFullPrompt(contentPrompt: string, retryNote?: string): string {
  return `Sei il social media manager di Stefano Porro, consulente pizzaiolo (consulenzapizzaiolo.it).

${contentPrompt}
${retryNote ?? ""}
Tono onesto e diretto, niente fuffa da corsi costosi, coerente con un brand che smonta le mode. 150-300 parole, in italiano, con una CTA finale verso consulenzapizzaiolo.it o l'invito a seguire Stefano. 5-8 hashtag pertinenti al mondo pizza/ristorazione.

REGOLE OBBLIGATORIE:
- Usa sempre "fermentazione" al posto di "maturazione" (parola vietata)
- NON affermare mai che la fermentazione migliora la digeribilità della pizza: è falso
- Se parli dell'approccio di Gabriele Bonci, resta sugli aspetti pubblicamente noti (alta idratazione, lunga lievitazione, tracciabilità delle farine, pizza al taglio gourmet popolare): non inventare mai citazioni dirette o dichiarazioni che non gli siano realmente attribuite

Aggiungi anche una breve frase ad effetto (4-8 parole, in italiano) da sovrimprimere sulla foto di copertina, e un prompt fotografico per generare quella foto — stessa logica delle copertine del blog: una foto realistica e pertinente, mai un grafico astratto.

Rispondi SOLO con questo JSON (nessun testo prima o dopo, nessun \`\`\`json):
{
  "caption": "testo della caption con eventuali a capo",
  "hashtags": ["hashtag1", "hashtag2"],
  "angle": "tecnica|ingredienti|attrezzatura|business|storia|gourmet|miti|faq|avviare|vita",
  "image_headline": "frase breve ad effetto per la foto di copertina (4-8 parole)",
  "image_prompt": "Cinematic [soggetto specifico legato al contenuto], warm amber light, Italian pizzeria or bakery, professional food photography, no text, no logos",
  "unsplash_query": "2-3 English keywords",
  "subtopic": "breve descrizione del sotto-argomento/tesi scelto (3-6 parole)",
  "subtopic_is_similar_to_recent": false
}`;
}

function normalizeSubtopic(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}

function subtopicCollides(subtopic: string | undefined, angle: string, subtopicsByAngleRaw: Map<string, string[]>): boolean {
  if (!subtopic) return false;
  const used = subtopicsByAngleRaw.get(angle) ?? [];
  const normalizedNew = normalizeSubtopic(subtopic);
  return used.some((s) => normalizeSubtopic(s) === normalizedNew);
}

async function sendFailureEmail(slot: string, reason: string) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  if (!resendKey) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `Social Consulenza Pizzaiolo <${fromEmail}>`,
        to: ["porroste80@gmail.com"],
        subject: `⚠️ Generazione post social fallita (slot ${slot})`,
        html: `<p>La generazione della bozza per lo slot <b>${slot}</b> non è andata a buon fine.</p><p>Motivo: ${reason}</p><p>Nessuna bozza è stata creata — puoi riprovare manualmente o aspettare il prossimo slot.</p>`,
      }),
    });
  } catch (e) {
    console.error("[social-cron] Impossibile inviare email di errore", e);
  }
}

async function generateDraft(slot: string) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.error("[social-cron] ANTHROPIC_API_KEY mancante");
    await sendFailureEmail(slot, "ANTHROPIC_API_KEY mancante");
    return;
  }

  try {
    const source = await pickSource();
    if (!source) {
      console.error("[social-cron] Nessun contenuto disponibile (post/ricette)");
      await sendFailureEmail(slot, "nessun contenuto disponibile (post/ricette)");
      return;
    }

    const history = await getRecentTopicHistory();
    const subtopics = await getRecentSubtopicsByAngle();
    const contentPrompt = buildContentPrompt(source, history.block, subtopics.block);

    let parsed = await callClaudeForCaption(anthropicKey, buildFullPrompt(contentPrompt));
    if (!parsed) {
      await sendFailureEmail(slot, "Claude non ha risposto o la risposta non era in JSON valido (vedi log Vercel)");
      return;
    }

    const collides =
      openingCollides(parsed.caption, history.recentCaptions) ||
      subtopicCollides(parsed.subtopic, parsed.angle, subtopics.byAngle) ||
      parsed.subtopic_is_similar_to_recent === true ||
      (!!source.lastUsedAngle && parsed.angle === source.lastUsedAngle);

    if (collides) {
      console.warn("[social-cron] Apertura, sotto-argomento o angolo già usati di recente, rigenero");
      const angleNote = source.lastUsedAngle && parsed.angle === source.lastUsedAngle
        ? ` Hai anche scelto l'angolo "${parsed.angle}", identico all'ultima pubblicazione in assoluto — cambia angolo.`
        : "";
      const retryNote = `\nATTENZIONE: la tua prima bozza per questa richiesta iniziava con "${parsed.caption.split("\n")[0]}" e trattava il sotto-argomento "${parsed.subtopic ?? "n/d"}" — troppo simili (anche solo nel significato) a qualcosa già usato di recente.${angleNote} Riscrivi con un'apertura E una tesi centrale DAVVERO diverse nel significato, non solo nelle parole.\n`;
      const retryParsed = await callClaudeForCaption(anthropicKey, buildFullPrompt(contentPrompt, retryNote));
      if (retryParsed) parsed = retryParsed;
    }

    await finalizeDraft(source, parsed, slot);
  } catch (e) {
    console.error("[social-cron] Errore imprevisto nella generazione", e);
    await sendFailureEmail(slot, `errore imprevisto: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function finalizeDraft(source: SourceContent, parsed: ParsedCaption, slot: string) {
  const sanitize = (t: string) =>
    t.replace(/\bMaturazione\b/g, "Fermentazione").replace(/\bmaturazione\b/g, "fermentazione");

  const hashtagsLine = parsed.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  const caption = `${sanitize(parsed.caption)}\n\n${hashtagsLine}`;
  const angle = ANGLES.includes(parsed.angle as Angle) ? parsed.angle : (source.forcedAngle ?? null);

  let imageUrl = "";
  try {
    const headline = sanitize(parsed.image_headline || parsed.caption.split("\n")[0].slice(0, 90));
    const buffer = await generateSocialCoverImage({
      badgeLabel: "Post",
      headline,
      imagePrompt: parsed.image_prompt,
      unsplashQuery: parsed.unsplash_query,
    });
    const fileName = `img-${Date.now()}-cover.png`;
    const { error: uploadErr } = await supabase.storage
      .from("social")
      .upload(fileName, buffer, { contentType: "image/png", upsert: false });
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from("social").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    } else {
      console.error("[social-cron] Errore upload immagine:", uploadErr.message);
    }
  } catch (e) {
    console.error("[social-cron] Generazione immagine fallita:", e);
  }

  const { data: draft, error } = await supabase
    .from("social_posts")
    .insert({
      source_type: source.sourceType,
      source_id: source.sourceId,
      angle,
      subtopic: parsed.subtopic ?? null,
      caption,
      image_url: imageUrl,
      scheduled_slot: slot,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("[social-cron] Errore Supabase", error.message);
    await sendFailureEmail(slot, `errore salvataggio su Supabase: ${error.message}`);
    return;
  }

  const adminUrl = `https://www.consulenzapizzaiolo.it/admin?tab=social&edit=${draft.id}`;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const fonteLabel =
    source.sourceType === "post" ? "articolo blog" : source.sourceType === "recipe" ? "ricetta" : "contenuto originale";

  if (resendKey) {
    const emailHtml = `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#c8741e,#a05c14);padding:28px 32px;">
      <div style="color:rgba(255,255,255,0.8);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Post social — slot ${slot}</div>
      <div style="color:#fff;font-size:22px;font-weight:bold;">Nuova bozza da revisionare</div>
    </div>
    <div style="padding:28px 32px;">
      <p style="color:#888;font-style:italic;font-size:13px;margin:0 0 16px;">Fonte: ${fonteLabel}${source.title ? ` — ${source.title}` : ""} · angolo: ${angle ?? "n/d"}</p>
      ${imageUrl ? `<img src="${imageUrl}" alt="Immagine post" style="width:100%;border-radius:8px;margin-bottom:20px"/>` : ""}
      <div style="font-size:15px;color:#333;white-space:pre-wrap;line-height:1.6;">${caption}</div>
    </div>
    <div style="margin:0 32px 24px;padding:20px;background:#fff8f0;border:1px solid #f5ddb0;border-radius:8px;text-align:center;">
      <div style="font-size:14px;color:#555;margin-bottom:16px;">
        ${imageUrl ? "🖼️ Immagine generata automaticamente — sostituiscila nel pannello se preferisci una foto tua." : "📸 Manca ancora l'immagine — caricala nel pannello prima di poter approvare e pubblicare."}
      </div>
      <a href="${adminUrl}" style="display:inline-block;background:#c8741e;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
        Apri nel pannello →
      </a>
    </div>
  </div>
</body>
</html>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Social Consulenza Pizzaiolo <${fromEmail}>`,
        to: ["porroste80@gmail.com"],
        subject: `Nuovo post social da revisionare (${slot})`,
        html: emailHtml,
      }),
    });
  }

  console.log(`[social-cron] Bozza creata (${draft.id}) fonte=${source.sourceType}:${source.sourceId} angolo=${angle} slot=${slot}`);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") ?? "12:00";
  if (!VALID_SLOTS.includes(slot)) {
    return NextResponse.json({ error: "Slot non valido" }, { status: 400 });
  }

  waitUntil(generateDraft(slot));

  return NextResponse.json({ ok: true, started: true, slot });
}
