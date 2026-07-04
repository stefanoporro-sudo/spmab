// DataOS: legge i numeri reali da Supabase e genera .claude/context/metrics.md
// Uso: node --env-file=.env.local scripts/generate-metrics.mjs
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Mancano NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Copia .env.local.example in .env.local e incolla i valori da Vercel."
  );
  process.exit(1);
}

const supabase = createClient(url, key);

async function count(table, filters = (q) => q) {
  const { count, error } = await filters(
    supabase.from(table).select("*", { count: "exact", head: true })
  );
  if (error) throw new Error(`${table}: ${JSON.stringify(error)}`);
  return count ?? 0;
}

const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const [
  totalPosts,
  publishedPosts,
  totalSubscribers,
  totalRecipes,
  viewsThisMonth,
  socialDrafts,
  forumThreads,
] = await Promise.all([
  count("posts"),
  count("posts", (q) => q.eq("published", true)),
  count("subscribers"),
  count("recipes"),
  count("page_views", (q) => q.gte("created_at", startOfMonth.toISOString())),
  count("social_posts", (q) => q.eq("status", "draft")),
  count("forum_threads"),
]);

const now = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });

const md = `# Metriche correnti (DataOS)

_Generato automaticamente il ${now} da \`scripts/generate-metrics.mjs\`. Non modificare a mano — rilancia lo script per aggiornare._

- Articoli blog totali: **${totalPosts}** (pubblicati: ${publishedPosts})
- Iscritti newsletter: **${totalSubscribers}**
- Ricette pubblicate: **${totalRecipes}**
- Visite sito questo mese: **${viewsThisMonth}**
- Bozze social in attesa di approvazione: **${socialDrafts}**
- Discussioni community: **${forumThreads}**
`;

writeFileSync(new URL("../.claude/context/metrics.md", import.meta.url), md);
console.log("Scritto .claude/context/metrics.md");
console.log(md);
