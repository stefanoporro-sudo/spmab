# Storico AIOS

## 2026-07-05
Avviata costruzione del layer AIOS (ispirato alla masterclass di Dario Fontanelli su "come creare il tuo sistema operativo AI") dentro la repo `spmab`, invece di crearlo in una cartella separata — perché il progetto ha già Infra (Git/GitHub/Vercel) e Data (Supabase) funzionanti.
Creati: `.claude/context/founder.md`, comando `/prime`, comando `/commit`, questo file.
Prossimi passi: script DataOS per generare `metrics.md` da Supabase, file di contesto sull'app mobile (in attesa di dettagli dalla sessione "Pizza consultation mobile app"), decisione sul ControlOS (estendere `/admin` esistente o farne uno nuovo).

## 2026-07-05 (continua)
Aggiunto `.claude/context/app-mobile.md` (dati recuperati dalla sessione "Pizza consultation mobile app": app React Native/Expo, repo separata, v9 in test Google Play).
`npm run metrics` testato e funzionante: bug corretto in `scripts/generate-metrics.mjs` — la tabella `posts` usa il campo booleano `published`, non un campo testo `status` come assunto inizialmente. `.env.local` configurato con credenziali Supabase reali (URL + service_role key, presi da Supabase dashboard perché marcati "Sensitive" su Vercel e non recuperabili da lì).
Ancora da fare: ControlOS (decisione su come estendere/creare la dashboard).
