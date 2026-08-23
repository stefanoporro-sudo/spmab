import { supabase } from "@/lib/supabase";

// Argomenti dedicati ai Reel "arte bianca" — lista separata dai 300 condivisi in
// lib/social-topics.ts (usati da post/reel-caption/LinkedIn). A differenza di quella lista,
// qui ogni voce è già scritta come gancio (mito da sfatare, errore comune, curiosità,
// confronto, tecnica veloce), non un'etichetta neutra: il prompt del cron reel deve solo
// svilupparla in schede di testo on-screen, non inventare l'angolo.
export const REEL_ANGLES = ["miti", "errori", "tecnica", "curiosita", "confronti"] as const;
export type ReelAngle = (typeof REEL_ANGLES)[number];

export type ReelTopic = {
  id: number;
  angle: ReelAngle;
  topic: string;
  /** Raggruppa argomenti sullo stesso soggetto specifico sotto angoli diversi
   * (es. lievito madre trattato sia in "errori" che in "curiosita"), stessa logica
   * di family in social-topics.ts — evita che due reel sullo stesso soggetto escano
   * a distanza ravvicinata anche se il testo del gancio è diverso. */
  family?: string;
};

export const REEL_TOPICS: ReelTopic[] = [
  // ── miti da sfatare (1-18) ─────────────────────────────────────────────
  { id: 1, angle: "miti", topic: "\"Il lievito madre è sempre più sano del lievito di birra\": il mito che va chiarito", family: "lievito-madre" },
  { id: 2, angle: "miti", topic: "\"Più lievitazione lunga è più digeribile\": cosa dice davvero la scienza", family: "digeribilita" },
  { id: 3, angle: "miti", topic: "\"L'impasto va lavorato il più possibile\": falso, e ecco perché rovina il pane" },
  { id: 4, angle: "miti", topic: "\"La farina 00 è sempre di bassa qualità\": il pregiudizio da sfatare" },
  { id: 5, angle: "miti", topic: "\"Impastare a mano è sempre meglio della planetaria\": non è così semplice", family: "impasto-a-mano" },
  { id: 6, angle: "miti", topic: "\"Il pane con la crosta dura è sempre più artigianale\": falso" },
  { id: 7, angle: "miti", topic: "\"Più acqua nell'impasto è sempre meglio\": il mito dell'alta idratazione a tutti i costi", family: "idratazione" },
  { id: 8, angle: "miti", topic: "\"Il lievito madre non muore mai\": quanto è vero davvero", family: "lievito-madre" },
  { id: 9, angle: "miti", topic: "\"Una farina con W alto è sempre la scelta giusta\": dipende da cosa stai facendo", family: "farina-forza" },
  { id: 10, angle: "miti", topic: "\"Il forno di casa non può fare un buon pane\": falso, con gli accorgimenti giusti" },
  { id: 11, angle: "miti", topic: "\"Basta seguire la ricetta alla lettera\": perché in panificazione non funziona mai così" },
  { id: 12, angle: "miti", topic: "\"Il sale uccide il lievito se li fai toccare\": mito o verità?", family: "sale" },
  { id: 13, angle: "miti", topic: "\"Più lievito, lievitazione più veloce e sicura\": il mito da correggere" },
  { id: 14, angle: "miti", topic: "\"L'impasto in frigo si ferma\": cosa succede davvero durante la fermentazione a freddo", family: "non-lievita" },
  { id: 15, angle: "miti", topic: "\"Il glutine è sempre un problema\": chiarire senza allarmismo" },
  { id: 16, angle: "miti", topic: "\"I grani antichi sono automaticamente più sani\": va contestualizzato", family: "grani-antichi" },
  { id: 17, angle: "miti", topic: "\"Se non raddoppia, l'impasto è da buttare\": falso" },
  { id: 18, angle: "miti", topic: "\"L'acqua della tua zona rovina sempre l'impasto\": quanto conta davvero" },

  // ── errori comuni (19-38) ──────────────────────────────────────────────
  { id: 19, angle: "errori", topic: "L'errore più comune quando l'impasto non si stacca mai dalle mani" },
  { id: 20, angle: "errori", topic: "Perché il tuo impasto non lievita: le cause più frequenti", family: "non-lievita" },
  { id: 21, angle: "errori", topic: "L'errore di temperatura che rovina la lievitazione anche seguendo la ricetta giusta" },
  { id: 22, angle: "errori", topic: "Perché il pane esce sempre troppo compatto: gli errori da controllare" },
  { id: 23, angle: "errori", topic: "L'errore nella puntatura che rovina l'alveolatura finale" },
  { id: 24, angle: "errori", topic: "Perché la crosta esce molle invece che croccante: la causa più ignorata", family: "crosta-croccante" },
  { id: 25, angle: "errori", topic: "L'errore di infarinatura che fa attaccare sempre l'impasto" },
  { id: 26, angle: "errori", topic: "Perché il lievito madre si indebolisce: l'errore nei rinfreschi", family: "lievito-madre" },
  { id: 27, angle: "errori", topic: "Il timing sbagliato tra impasto e forno che rovina tutto il lavoro fatto prima" },
  { id: 28, angle: "errori", topic: "Perché stagliare troppo presto rovina la struttura dell'impasto" },
  { id: 29, angle: "errori", topic: "L'errore di misurare gli ingredienti a occhio invece che a bilancia" },
  { id: 30, angle: "errori", topic: "Perché aprire il forno troppo presto rovina la lievitazione in cottura" },
  { id: 31, angle: "errori", topic: "L'errore di usare farina fredda da frigo senza pensarci" },
  { id: 32, angle: "errori", topic: "Perché il tuo impasto non lievita quando fa freddo in casa", family: "non-lievita" },
  { id: 33, angle: "errori", topic: "L'errore di coprire male l'impasto durante la lievitazione" },
  { id: 34, angle: "errori", topic: "Perché versare tutta l'acqua subito è spesso un errore" },
  { id: 35, angle: "errori", topic: "L'errore di non far riposare l'impasto abbastanza prima di stenderlo" },
  { id: 36, angle: "errori", topic: "Perché il pane fatto in casa non ha mai il buco (l'alveolatura) come quello del forno" },
  { id: 37, angle: "errori", topic: "L'errore di sale che rovina sia il sapore che la lievitazione", family: "sale" },
  { id: 38, angle: "errori", topic: "Perché rimpastare troppo un impasto già lievitato è quasi sempre un errore" },

  // ── tecnica veloce (39-56) ─────────────────────────────────────────────
  { id: 39, angle: "tecnica", topic: "La prova del velo in 15 secondi: come capire se l'impasto è pronto" },
  { id: 40, angle: "tecnica", topic: "Il trucco per capire la temperatura giusta dell'acqua senza termometro" },
  { id: 41, angle: "tecnica", topic: "Come recuperare un impasto troppo appiccicoso in pochi gesti" },
  { id: 42, angle: "tecnica", topic: "Come velocizzare la lievitazione in modo sicuro quando hai poco tempo" },
  { id: 43, angle: "tecnica", topic: "Il trucco per ottenere una crosta più croccante senza cambiare ricetta", family: "crosta-croccante" },
  { id: 44, angle: "tecnica", topic: "Come capire se il forno di casa è davvero caldo abbastanza" },
  { id: 45, angle: "tecnica", topic: "Il metodo veloce per rinfrescare il lievito madre senza sbagliare", family: "lievito-madre" },
  { id: 46, angle: "tecnica", topic: "Come dare vapore al forno di casa per un pane con la crosta giusta" },
  { id: 47, angle: "tecnica", topic: "Il trucco per stendere l'impasto senza farlo sgonfiare" },
  { id: 48, angle: "tecnica", topic: "Come capire a occhio se hai messo abbastanza sale" },
  { id: 49, angle: "tecnica", topic: "Il modo giusto per far riposare l'impasto quando fa molto caldo in casa" },
  { id: 50, angle: "tecnica", topic: "Come salvare un impasto sovralievitato prima che sia troppo tardi" },
  { id: 51, angle: "tecnica", topic: "Il trucco per dare forza a un impasto che si sfalda mentre lo lavori" },
  { id: 52, angle: "tecnica", topic: "Come capire quando fermare l'impasto in planetaria" },
  { id: 53, angle: "tecnica", topic: "Il modo più semplice per iniziare un lievito madre da zero", family: "lievito-madre" },
  { id: 54, angle: "tecnica", topic: "Come conservare l'impasto avanzato senza sprecarlo" },
  { id: 55, angle: "tecnica", topic: "Il trucco per capire quanto lievito usare in base alla temperatura di casa" },
  { id: 56, angle: "tecnica", topic: "Come ottenere un cornicione più alto anche in un forno normale" },

  // ── curiosità e storia (57-70) ──────────────────────────────────────────
  { id: 57, angle: "curiosita", topic: "Perché il pane italiano cambia forma e nome ogni 50 km" },
  { id: 58, angle: "curiosita", topic: "Da dove viene davvero il lievito madre che usiamo ancora oggi", family: "lievito-madre" },
  { id: 59, angle: "curiosita", topic: "Il motivo storico per cui il pane di ieri si tagliava, non si affettava" },
  { id: 60, angle: "curiosita", topic: "Perché per secoli si pagava per usare il forno del paese" },
  { id: 61, angle: "curiosita", topic: "La vera differenza tra biga e poolish, spiegata in 30 secondi" },
  { id: 62, angle: "curiosita", topic: "Perché il pane raffermo non si buttava mai nella tradizione contadina" },
  { id: 63, angle: "curiosita", topic: "Il motivo per cui alcune regioni italiane il pane si fa ancora senza sale" },
  { id: 64, angle: "curiosita", topic: "Da dove viene il nome \"pasta madre\" e cosa significa davvero" },
  { id: 65, angle: "curiosita", topic: "Perché la segale ha reso possibile il pane anche dove il grano non cresceva" },
  { id: 66, angle: "curiosita", topic: "Il ruolo del sale come conservante prima ancora che come sapore", family: "sale" },
  { id: 67, angle: "curiosita", topic: "Perché in montagna si panificava una volta ogni due settimane" },
  { id: 68, angle: "curiosita", topic: "Come si misurava la temperatura del forno prima dei termometri" },
  { id: 69, angle: "curiosita", topic: "Il motivo per cui il pane pugliese si riconosce dalla crosta spessa" },
  { id: 70, angle: "curiosita", topic: "Perché il grano usato oggi non è lo stesso di 100 anni fa", family: "grani-antichi" },

  // ── confronti (71-80) ────────────────────────────────────────────────────
  { id: 71, angle: "confronti", topic: "Lievito madre vs lievito di birra: differenza reale in tempi e sapore", family: "lievito-madre" },
  { id: 72, angle: "confronti", topic: "Impasto diretto vs indiretto: cosa cambia per chi impasta in casa" },
  { id: 73, angle: "confronti", topic: "Farina 00 vs tipo 1: quale scegliere e quando" },
  { id: 74, angle: "confronti", topic: "Lievitazione a temperatura ambiente vs in frigo: cosa conviene davvero", family: "non-lievita" },
  { id: 75, angle: "confronti", topic: "Impastatrice vs impasto a mano: tempi e risultato a confronto", family: "impasto-a-mano" },
  { id: 76, angle: "confronti", topic: "Idratazione alta vs bassa: cosa cambia davvero nel risultato finale", family: "idratazione" },
  { id: 77, angle: "confronti", topic: "Farina forte vs farina debole: quale per quale lievitato", family: "farina-forza" },
  { id: 78, angle: "confronti", topic: "Cottura in forno statico vs ventilato per il pane fatto in casa" },
  { id: 79, angle: "confronti", topic: "Lievito madre solido vs licoli: differenze pratiche per chi inizia", family: "lievito-madre" },
  { id: 80, angle: "confronti", topic: "Autolisi sì o no: quando conviene farla e quando è tempo perso" },
];

function getFamily(topic: ReelTopic): string | undefined {
  return topic.family;
}

const FAMILY_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;

// Stessa logica di pickNextTopic() in social-topics.ts, ma scoped solo alle righe
// content_type='reel' create con questa lista dedicata (le righe reel storiche usavano
// il pool condiviso da 300 e hanno subtopic con testo diverso, quindi non collidono).
export async function pickNextReelTopic(): Promise<ReelTopic> {
  const { data } = await supabase
    .from("social_posts")
    .select("subtopic, created_at")
    .eq("content_type", "reel")
    .order("created_at", { ascending: false });

  const lastUsedAt = new Map<string, string>();
  for (const row of data ?? []) {
    if (!row.subtopic) continue;
    if (!lastUsedAt.has(row.subtopic)) lastUsedAt.set(row.subtopic, row.created_at);
  }

  const topicByText = new Map(REEL_TOPICS.map((t) => [t.topic, t]));
  const familyLastUsedAt = new Map<string, string>();
  for (const [subtopicText, createdAt] of lastUsedAt) {
    const family = getFamily(topicByText.get(subtopicText) ?? ({} as ReelTopic));
    if (!family) continue;
    const prev = familyLastUsedAt.get(family);
    if (!prev || createdAt > prev) familyLastUsedAt.set(family, createdAt);
  }

  const now = Date.now();
  const isFamilyCoolingDown = (topic: ReelTopic) => {
    const family = getFamily(topic);
    if (!family) return false;
    const last = familyLastUsedAt.get(family);
    if (!last) return false;
    return now - new Date(last).getTime() < FAMILY_COOLDOWN_MS;
  };

  const neverUsed = REEL_TOPICS.filter((t) => !lastUsedAt.has(t.topic));
  if (neverUsed.length > 0) {
    const neverUsedFresh = neverUsed.filter((t) => !isFamilyCoolingDown(t));
    const pool = neverUsedFresh.length > 0 ? neverUsedFresh : neverUsed;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const sorted = [...REEL_TOPICS].sort((a, b) => {
    const at = lastUsedAt.get(a.topic) ?? "";
    const bt = lastUsedAt.get(b.topic) ?? "";
    return at.localeCompare(bt);
  });
  return sorted[0];
}
