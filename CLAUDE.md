# Consulenza Pizzaiolo — Note per Claude

## Stack tecnico
- **Framework**: Next.js 15 App Router (`app/` directory)
- **Database + Storage**: Supabase
- **Deploy**: Vercel (auto-deploy su push a `main` via GitHub Desktop)
- **Email**: Resend API
- **AI**: Anthropic Claude API (claude-sonnet-4-6)

## Variabili d'ambiente (su Vercel)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — database
- `ANTHROPIC_API_KEY` — generazione articoli blog e caption social
- `RESEND_API_KEY` — invio email
- `FROM_EMAIL` — mittente email
- `ADMIN_PASSWORD` — `Spmab2024!` — protegge le API admin
- `CRON_SECRET` — usato da Vercel per i cron job
- `META_APP_ID`, `META_APP_SECRET` — app Meta for Developers (usati per il controllo scadenza token)
- `META_PAGE_ACCESS_TOKEN` — Page Access Token long-lived (60 giorni) per Graph API
- `META_PAGE_ID` — ID della Pagina Facebook collegata
- `META_IG_USER_ID` — ID dell'account Instagram Business collegato alla Pagina
- `SOCIAL_DRY_RUN` — se `true`, la pubblicazione social simula il successo senza chiamare davvero Meta (solo per test)
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — bot Telegram dedicato per le notifiche dei Reel

## Autenticazione admin
Le API admin accettano l'header `x-admin-password: Spmab2024!`.
Il pannello admin è su `/admin`.

## Cron job (automazioni giornaliere)
Due sistemi effettivi (la cartella `.github/workflows` esiste ma è vuota — GitHub Actions non è mai stato attivato nonostante fosse documentato qui):
1. **Vercel cron** (`vercel.json`) — `/api/cron/blog` gira lun-ven 8:30 CEST
2. **cron-job.org** (configurato manualmente, header `x-admin-password`) — usato per i job che Vercel non può gestire (più trigger al giorno, orari specifici)

⚠️ **Se su cron-job.org è configurato ANCHE un job per `/api/cron/blog`**, il blog genera due articoli al giorno invece di uno (non è un doppio sistema di sicurezza, sono due trigger reali che eseguono entrambi). Va lasciato attivo un solo trigger per il blog.

| Job | Endpoint | Orario |
|-----|----------|--------|
| Articolo blog | `/api/cron/blog` | lun-ven 8:30 CEST |
| Report statistiche | `/api/cron/daily-report` | ogni giorno 9:00 CEST |
| Bozza post social | `/api/cron/social?slot=12:00\|18:00\|20:30` | ogni giorno 12:00, 18:00, 20:30 CEST — trigger da **cron-job.org** (non vercel.json, gestisce nativamente il cambio ora legale). Orari scelti per intercettare le fasce di maggiore engagement food (pranzo, aperitivo, scroll serale) |
| Bozza Reel | `/api/cron/reel` | lun-ven 19:00 CEST — trigger da **cron-job.org**, notifica via Telegram (non email) |
| Bozza LinkedIn | `/api/cron/linkedin` | lun/mer/ven 08:30 CEST — trigger da **cron-job.org**, notifica via Telegram, tono più professionale/B2B, nessuna pubblicazione via API (LinkedIn non permette l'automazione self-service come Meta) |

Il cron blog usa `waitUntil` da `@vercel/functions` — risponde in <1 secondo e genera l'articolo in background. L'email con la bozza arriva a **porroste80@gmail.com**.

## Tabelle Supabase principali
- `posts` — articoli blog (bozze e pubblicati)
- `subscribers` — iscritti newsletter
- `recipes` — ricette con PDF e immagine (`image_url`)
- `page_views` — visite al sito
- `forum_threads` — discussioni community
- `forum_replies` — risposte forum
- `social_posts` — bozze di post Instagram/Facebook/LinkedIn (caption generata da Claude, immagine generata automaticamente, stati `draft/approved/publishing/published/failed/rejected`). Colonna `content_type` (`post`/`reel`/`linkedin`) distingue i post foto (pubblicati via Meta API) da Reel e LinkedIn (caption pronta da copiare, pubblicazione sempre manuale — né Instagram né LinkedIn permettono l'automazione completa self-service per questi casi). Colonna `source_type` (`post`/`recipe`/`standalone`) indica se la caption parte da un articolo blog, una ricetta, o è un contenuto originale (`source_id` è null in quel caso). Colonna `angle` traccia quale delle 10 categorie tematiche è stata usata, per evitare di ripetere lo stesso angolo sulla stessa fonte. Colonna `subtopic` traccia la tesi/sotto-argomento specifico scelto da Claude per quell'angolo (es. "business plan e conto economico" per l'angolo "avviare") — evita che la stessa tesi centrale si ripeta anche quando l'angolo e l'apertura cambiano. Le ricette con un `collaborator_id` (non di Stefano) sono escluse dalle fonti social/reel/linkedin

## Storage Supabase (bucket)
- `blog` — copertine articoli (PNG 1600×840)
- `ricette` — immagini ricette (JPG/PNG/WebP, max 5MB, consigliato 800×450px)
- `social` — immagini dei post social (JPG/PNG/WebP, max 8MB)

## Integrazione social (Instagram/Facebook)
Il cron `/api/cron/social` genera 3 volte al giorno (12:00/18:00/20:30) una bozza di caption e **genera già anche un'immagine di riepilogo** (card grafica automatica via `lib/social-image.tsx`, vedi sezione "Anti-ripetizione" più sotto) e la salva in `social_posts` con `status: draft`. Stefano può sostituire l'immagine generata con una foto reale dal pannello `/admin` → tab **Social**, se preferisce. Solo dopo l'approvazione esplicita, il bottone "Pubblica ora" chiama `/api/social/[id]/publish`, che pubblica su Instagram e Facebook via Meta Graph API — nessuna pubblicazione è mai automatica senza approvazione.

Il Page Access Token Meta scade ogni 60 giorni: il cron `daily-report` controlla la scadenza (`debug_token`) e invia un'email di avviso se mancano meno di 7 giorni.

**Reel**: il cron `/api/cron/reel` genera lun-ven alle 19:00 solo la caption (stile "hook" per video, più corta di un post normale) e notifica via **Telegram** (non email). Non c'è pubblicazione via Meta API: Stefano copia la caption pronta dal pannello (bottone "Copia caption"), monta il Reel con musica direttamente in Instagram, e poi clicca "Segna come pubblicato" per tracciarlo — l'API Instagram non permette di scegliere un brano dal catalogo musicale in automatico.

**LinkedIn**: il cron `/api/cron/linkedin` genera lun/mer/ven alle 08:30 un post con tono più professionale (paragrafi brevi, 3-5 hashtag di settore, pensato anche per decisori B2B — scuole, catene di ristorazione) e notifica via Telegram. A differenza di quanto inizialmente previsto, per l'uso su un singolo profilo personale il prodotto "Share on LinkedIn" è approvato **all'istante in self-service** (non serve partnership formale) — quindi la pubblicazione è **automatica** come per Instagram/Facebook: stesso flusso "Approva" → "Pubblica ora" nel pannello. Autenticazione OAuth via `/api/auth/linkedin/callback` (token valido 60 giorni, da rinnovare rifacendo il login OAuth — non c'è ancora un controllo automatico di scadenza come per Meta, da aggiungere in futuro).

Env vars LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (dall'app developers.linkedin.com), `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_MEMBER_URN` (ottenuti tramite il flusso OAuth).

**Anti-ripetizione (fonte × angolo)**: post e Reel condividono lo stesso pool di contenuti (`posts` + `recipes`) a un ritmo di produzione molto più veloce di quanto blog/ricette crescano, quindi il riciclo delle fonti è inevitabile. Per non risultare ripetitivi: (1) **2 generazioni su 3** sono **contenuto standalone** — non partono da un articolo/ricetta esistente, ma scrivono direttamente su una delle 10 categorie tematiche sotto; solo 1 su 3 pesca da blog/ricette (alternati tra loro); (2) per le generazioni legate a un articolo/ricetta, la scelta della fonte privilegia quella che ha esaurito meno angoli possibili, e il prompt a Claude riceve esplicitamente quali angoli sono già stati usati su quella fonte specifica, per sceglierne uno diverso ogni volta.

Le 10 categorie (`angle`): tecnica (impasto), ingredienti, attrezzatura, business (pizzeria avviata), storia/cultura, ricette gourmet, miti e disinformazione, FAQ clienti, aprire una pizzeria, vita da pizzaiolo. Ogni categoria include una lista estesa di sotto-argomenti concreti (definita in `ANGLE_CATEGORIES` in ognuno dei 3 cron) per dare a Claude molte più opzioni specifiche tra cui scegliere, comprese 5 legate all'approccio pubblicamente noto di Gabriele Bonci (alta idratazione, tracciabilità delle farine, pizza al taglio gourmet popolare) — mai citazioni inventate.

⚠️ Lasciare Claude libero di scegliere tra i sotto-argomenti elencati in una categoria non basta: tende a gravitare sempre sugli stessi 1-2 sotto-argomenti "generici" e a ignorare gli altri a tempo indeterminato (verificato: gli 11 post storici con angolo storia/gourmet non avevano mai menzionato Bonci). Per questo, quando la generazione standalone sceglie l'angolo `storia` o `gourmet` e nessuno degli ultimi 30 post ha già trattato Bonci (`subtopic`/`caption` contiene "bonci"), il sotto-argomento viene **forzato** (`forcedSubtopic`, scelto a caso tra i 5 sotto-argomenti Bonci) invece di lasciarlo alla scelta libera di Claude — stesso meccanismo replicato identico nei 3 cron.

(3) Ogni generazione riceve anche i titoli di **tutti** gli articoli blog pubblicati e l'apertura delle ultime 15 caption social/Reel già create — comprese quelle **rifiutate** da Stefano — con l'istruzione di non ritrattare lo stesso argomento specifico (es. "autolisi") anche se l'angolo è diverso. Per questo motivo il bottone "Rifiuta" nel pannello admin non elimina più la riga (`status: rejected`, non una DELETE): la storia va preservata perché il sistema la usa per evitare di riproporre argomenti già scartati.

## Regole contenuto importanti
- Usare sempre **"fermentazione"** — mai "maturazione"
- **Non affermare** che la fermentazione migliora la digeribilità della pizza: è falso. La digeribilità dipende principalmente dalla farcitura e dalla cottura.

## Email di notifica
- Articolo blog generato → `porroste80@gmail.com`
- Richieste consulenza online → `stefano@consulenzapizzaiolo.it`
- Nuovi thread forum → `stefano@consulenzapizzaiolo.it`

## Obiettivo di business e visione
Stefano vuole che il sito diventi **la guida di riferimento per il pizzaiolo che vuole crescere** — un luogo onesto, senza mode o fuffa, che smonta le paure create da chi vende corsi costosi e dimostra che l'onestà e la competenza premiano sempre.

**Priorità strategiche:**
- Contenuti gratuiti e di qualità reale: ricette, articoli, guide pratiche
- Community attiva dove i pizzaioli si confrontano senza filtri
- Crescita organica basata sulla fiducia, non sul marketing aggressivo

**App mobile** (collegata al sito):
- L'obiettivo è che ogni pizzaiolo la scarichi — è gratuita
- Deve diventare virale perché offre valore concreto senza chiedere nulla in cambio
- L'unica "richiesta" all'utente è seguire Stefano sui social

**Sviluppi futuri pianificati:**
- Integrazione con i profili social di Stefano
- Generazione automatica di video tutorial tramite IA (partendo dagli articoli del blog)
- Crescita della platea social come obiettivo primario di engagement

## Pagine principali
- `/` — homepage
- `/blog` — lista articoli
- `/ricette` — ricette professionali con PDF
- `/consulenza-online` — pacchetti consulenza (€250/sessione, sconto 10% da 2+)
- `/community` — forum pubblico
- `/admin` — pannello di controllo (password protetto)
