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
- `recipes` — ricette con PDF e immagine (`image_url`). Può contenere anche bozze non attive (`active: false`) suggerite automaticamente dai cron social quando un argomento riguarda un ingrediente di pregio (vedi sezione "Materie prime di pregio" più sotto) — da rivedere nel pannello prima di attivarle
- `page_views` — visite al sito
- `forum_threads` — discussioni community
- `forum_replies` — risposte forum
- `social_posts` — bozze di post Instagram/Facebook/LinkedIn (caption generata da Claude, immagine generata automaticamente, stati `draft/approved/publishing/published/failed/rejected`). Colonna `content_type` (`post`/`reel`/`linkedin`) distingue i post foto (pubblicati via Meta API) da Reel e LinkedIn (caption pronta da copiare, pubblicazione sempre manuale — né Instagram né LinkedIn permettono l'automazione completa self-service per questi casi). Colonna `source_type` (`post`/`recipe`/`standalone`) indica se la caption parte da un articolo blog, una ricetta, o è un contenuto originale (`source_id` è null in quel caso). Colonna `angle` traccia quale delle 11 categorie tematiche è stata usata. Colonna `subtopic` traccia l'argomento/tesi specifico — per i contenuti standalone è il testo esatto dell'argomento assegnato dalla rotazione forzata sui 300 (vedi sotto), per quelli legati a un articolo/ricetta è la tesi scelta liberamente da Claude — evita che la stessa tesi centrale si ripeta anche quando l'angolo e l'apertura cambiano. Le ricette con un `collaborator_id` (non di Stefano) sono escluse dalle fonti social/reel/linkedin

## Storage Supabase (bucket)
- `blog` — copertine articoli (PNG 1600×840)
- `ricette` — immagini ricette (JPG/PNG/WebP, max 5MB, consigliato 800×450px)
- `social` — immagini dei post social (JPG/PNG/WebP, max 8MB)

## Integrazione social (Instagram/Facebook)
Il cron `/api/cron/social` genera 3 volte al giorno (12:00/18:00/20:30) una bozza di caption e **genera già anche un'immagine di copertina** e la salva in `social_posts` con `status: draft`. Stefano può sostituire l'immagine generata con una foto reale dal pannello `/admin` → tab **Social**, se preferisce. Solo dopo l'approvazione esplicita, il bottone "Pubblica ora" chiama `/api/social/[id]/publish`, che pubblica su Instagram e Facebook via Meta Graph API — nessuna pubblicazione è mai automatica senza approvazione.

**Immagine di copertina — stessa identità visiva del blog** (`generateSocialCoverImage` in `lib/social-image.tsx`, condivisa dai 3 cron social/reel/linkedin): Claude genera, insieme alla caption, un `image_prompt` (foto realistica in inglese) e un `unsplash_query` di fallback, esattamente come già avviene per le copertine degli articoli blog (`app/api/cron/blog/route.tsx`). La generazione prova prima **Stability AI** (`STABILITY_API_KEY`, formato verticale 4:5), poi **Unsplash** (`UNSPLASH_ACCESS_KEY`) come fallback, poi un grafico piatto senza foto se nessuna delle due è disponibile — stesse variabili d'ambiente già configurate per il blog, nessun setup aggiuntivo. Sopra la foto viene composto lo stesso overlay a gradiente + badge ("Post"/"Reel"/"LinkedIn") + frase ad effetto (`image_headline`, generata da Claude) + branding "consulenzapizzaiolo.it" delle copertine blog, a 1080×1350px (formato verticale social).

Il Page Access Token Meta scade ogni 60 giorni: il cron `daily-report` controlla la scadenza (`debug_token`) e invia un'email di avviso se mancano meno di 7 giorni.

**Reel**: il cron `/api/cron/reel` genera lun-ven alle 19:00 solo la caption (stile "hook" per video, più corta di un post normale) e notifica via **Telegram** (non email). Non c'è pubblicazione via Meta API: Stefano copia la caption pronta dal pannello (bottone "Copia caption"), monta il Reel con musica direttamente in Instagram, e poi clicca "Segna come pubblicato" per tracciarlo — l'API Instagram non permette di scegliere un brano dal catalogo musicale in automatico.

**LinkedIn**: il cron `/api/cron/linkedin` genera lun/mer/ven alle 08:30 un post con tono più professionale (paragrafi brevi, 3-5 hashtag di settore, pensato anche per decisori B2B — scuole, catene di ristorazione) e notifica via Telegram. A differenza di quanto inizialmente previsto, per l'uso su un singolo profilo personale il prodotto "Share on LinkedIn" è approvato **all'istante in self-service** (non serve partnership formale) — quindi la pubblicazione è **automatica** come per Instagram/Facebook: stesso flusso "Approva" → "Pubblica ora" nel pannello. Autenticazione OAuth via `/api/auth/linkedin/callback` (token valido 60 giorni, da rinnovare rifacendo il login OAuth — non c'è ancora un controllo automatico di scadenza come per Meta, da aggiungere in futuro).

Env vars LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` (dall'app developers.linkedin.com), `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_MEMBER_URN` (ottenuti tramite il flusso OAuth).

**Anti-ripetizione (fonte × angolo)**: post e Reel condividono lo stesso pool di contenuti (`posts` + `recipes`) a un ritmo di produzione molto più veloce di quanto blog/ricette crescano, quindi il riciclo delle fonti è inevitabile. Per non risultare ripetitivi: (1) **2 generazioni su 3** sono **contenuto standalone** — non partono da un articolo/ricetta esistente; solo 1 su 3 pesca da blog/ricette (alternati tra loro); (2) per le generazioni legate a un articolo/ricetta, la scelta della fonte privilegia quella che ha esaurito meno angoli possibili, e il prompt a Claude riceve esplicitamente quali angoli sono già stati usati su quella fonte specifica, per sceglierne uno diverso ogni volta.

⚠️ **Lasciare a Claude la scelta libera dell'argomento non funziona**: anche con istruzioni esplicite di non ripetersi, tende a gravitare sempre sugli stessi 4-5 temi "generici" dentro una categoria ampia e a ignorare gli altri a tempo indeterminato (verificato più volte: es. gli argomenti legati a Gabriele Bonci, pur elencati esplicitamente, non sono mai stati scelti spontaneamente in decine di generazioni). La soluzione strutturale, in vigore da fine luglio 2026: per i contenuti **standalone**, l'argomento non è più una scelta di Claude ma è **assegnato dal codice** tramite rotazione forzata su una lista di **300 argomenti/microargomenti** (`TOPICS` in `lib/social-topics.ts`, modulo condiviso dai 3 cron) — pizza, panificazione/arte bianca (pane incluso), business, storia, gourmet, miti, FAQ, ecc. `pickNextTopic()` sceglie sempre l'argomento mai usato (o usato meno di recente, per testo esatto sulla colonna `subtopic`), garantendo che nessun argomento si ripeta prima di un ciclo completo sui 300 (~100-130 giorni al ritmo di pubblicazione attuale). Le generazioni legate a un articolo/ricetta specifico restano invece a scelta libera di Claude tra gli 11 angoli (`ANGLES`/`ANGLE_CATEGORIES`, stesso file condiviso), perché lì il "cosa" è già dato dalla fonte — con lo stesso controllo su angolo/tesi già usati di recente descritto sopra.

Le 11 categorie (`angle`): tecnica (impasto), ingredienti, **panificazione** (arte bianca/pane, nuova categoria dedicata), attrezzatura, business, storia/cultura, ricette gourmet, miti e disinformazione, FAQ clienti, aprire un'attività, vita da pizzaiolo/fornaio.

**Materie prime di pregio**: circa 55 dei 300 argomenti riguardano un ingrediente specifico di qualità (prodotti De.Co./IGP/DOP/presidi Slow Food reali, es. Burrata di Andria, Pomodorino del Piennolo del Vesuvio, 'Nduja di Spilinga — mai certificazioni o dettagli storici inventati) e sono marcati con un campo `ingredient` in `TOPICS`. Quando la rotazione assegna uno di questi argomenti, il prompt chiede a Claude di **suggerire anche una ricetta** che valorizzi l'ingrediente; se presente nella risposta (`suggested_recipe`), il sistema la salva **automaticamente come bozza non attiva** nella tabella `recipes` (`active: false`, `collaborator_id: null`) — compare nel pannello admin, tab Ricette, da rivedere e attivare manualmente, mai pubblicata senza controllo. La notifica (email/Telegram) segnala quando è stata aggiunta una ricetta suggerita.

Ogni generazione riceve anche i titoli di **tutti** gli articoli blog pubblicati e l'apertura delle ultime 15 caption social/Reel già create — comprese quelle **rifiutate** da Stefano — con l'istruzione di non ritrattare lo stesso argomento specifico anche se l'angolo è diverso. Per questo motivo il bottone "Rifiuta" nel pannello admin non elimina più la riga (`status: rejected`, non una DELETE): la storia va preservata perché il sistema la usa per evitare di riproporre argomenti già scartati.

**Rigenera argomento**: nel pannello admin, accanto a "Rifiuta", il bottone "Rigenera argomento" (`app/api/social/[id]/regenerate/route.ts`) rifiuta la bozza corrente (stesso `status: rejected` di cui sopra — resta quindi in memoria per l'anti-ripetizione, così quel tipo di argomento non ricompare nei prossimi post) e richiama subito il cron corrispondente (`/api/cron/social|reel|linkedin`, stesso slot per i post) per generarne una nuova: arriva una nuova notifica (email o Telegram) come una generazione normale.

⚠️ **Due bug di ripetizione trovati confrontando dati reali** (due post consecutivi, uno standalone e uno da ricetta, entrambi angolo "storia" con la stessa tesi sulle differenze tra stili regionali, scritta con parole diverse): (1) l'avoidance dell'angolo era solo per-fonte, quindi due fonti diverse potevano scegliere lo stesso angolo di seguito senza che nessun controllo lo impedisse — ora ogni generazione riceve anche l'ultimo angolo usato **in assoluto** (qualsiasi fonte/piattaforma) e deve evitarlo; (2) il controllo anti-ripetizione sul `subtopic` faceva solo un confronto testuale esatto, quindi due tesi identiche ma riformulate con parole diverse sfuggivano al controllo — ora Claude si autovaluta con un campo `subtopic_is_similar_to_recent` (confronto sul significato, non sulle parole), usato come ulteriore innesco per il retry.

⚠️ **Bug di affidabilità trovato e riprodotto dal vivo**: `generateDraft()` nei 3 cron non aveva un try/catch complessivo — se la chiamata a Claude falliva o restituiva una risposta non valida, la funzione uscisva silenziosamente (nessuna riga creata, nessuna notifica, nessun errore visibile a Stefano). Riprodotto: un trigger manuale è rimasto senza alcun risultato per oltre 150 secondi, mentre un trigger successivo è riuscito in pochi secondi — conferma che è un fallimento intermittente (probabile hiccup della Claude API), non deterministico. Ora ogni punto di fallimento (API key mancante, nessuna fonte disponibile, errore/risposta non valida di Claude, errore Supabase, eccezione imprevista) invia sempre una notifica (email per i post, Telegram per Reel/LinkedIn) con il motivo, così un fallimento non passa più inosservato.

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
