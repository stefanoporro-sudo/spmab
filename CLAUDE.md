# Consulenza Pizzaiolo — Note per Claude

## Stack tecnico
- **Framework**: Next.js 15 App Router (`app/` directory)
- **Database + Storage**: Supabase
- **Deploy**: Vercel (auto-deploy su push a `main` via GitHub Desktop)
- **Email**: Resend API
- **AI**: Anthropic Claude API (claude-sonnet-4-6)

## Variabili d'ambiente (su Vercel)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — database
- `ANTHROPIC_API_KEY` — generazione articoli blog
- `RESEND_API_KEY` — invio email
- `FROM_EMAIL` — mittente email
- `ADMIN_PASSWORD` — `Spmab2024!` — protegge le API admin
- `CRON_SECRET` — usato da Vercel per i cron job

## Autenticazione admin
Le API admin accettano l'header `x-admin-password: Spmab2024!`.
Il pannello admin è su `/admin`.

## Cron job (automazioni giornaliere)
Tre sistemi in parallelo per massima affidabilità:
1. **Vercel cron** (`vercel.json`)
2. **GitHub Actions** (`.github/workflows/daily-blog.yml`)
3. **cron-job.org** (configurato manualmente, header `x-admin-password`)

| Job | Endpoint | Orario |
|-----|----------|--------|
| Articolo blog | `/api/cron/blog` | lun-ven 8:30 CEST |
| Report statistiche | `/api/cron/daily-report` | ogni giorno 9:00 CEST |

Il cron blog usa `waitUntil` da `@vercel/functions` — risponde in <1 secondo e genera l'articolo in background. L'email con la bozza arriva a **porroste80@gmail.com**.

## Tabelle Supabase principali
- `posts` — articoli blog (bozze e pubblicati)
- `subscribers` — iscritti newsletter
- `recipes` — ricette con PDF e immagine (`image_url`)
- `page_views` — visite al sito
- `forum_threads` — discussioni community
- `forum_replies` — risposte forum

## Storage Supabase (bucket)
- `blog` — copertine articoli (PNG 1600×840)
- `ricette` — immagini ricette (JPG/PNG/WebP, max 5MB, consigliato 800×450px)

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
