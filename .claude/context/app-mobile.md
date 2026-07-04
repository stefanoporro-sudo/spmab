# App mobile — Consulenza Pizzaiolo

## Cos'è
App gratuita (senza pubblicità) per pizzaioli, gemella del sito consulenzapizzaiolo.it:
- Articoli blog (sincronizzati automaticamente dal sito)
- Ricette con PDF scaricabili
- Consigli/trucchi per la gestione della pizzeria
- Sezione community (aggiunta in v8/v9)
- Notifiche push su nuovi contenuti

## Stack e repo
- **React Native + Expo**, build con EAS (Expo Application Services)
- Repo separata da `spmab`: `/Users/stefanoporro/ConsulenzaPizzaiolo`
- **Backend condiviso**: stesso Supabase del sito — articoli, ricette e post community sono sincronizzati live via API, nessun DB duplicato

## Stato attuale (aggiornare quando cambia)
- **Google Play**: versione 9 in test interno chiuso, 12 tester attivi su 22 invitati, periodo obbligatorio di 14 giorni in corso (richiesto per account personali prima del rilascio pubblico)
- **App Store (iOS)**: non ancora sottomessa — roadmap non definita
- Privacy policy: https://consulenza-pizzaiolo-privacy.vercel.app
- Logo/icona "CP" aggiornati in v9

## Nota per Claude
Repo e sessione di lavoro di questa app sono separate da `spmab`. Se un task riguarda modifiche al codice dell'app, serve aprire quella repo — questo file serve solo a mantenere il contesto di business (stato, collegamento dati) leggibile da qui senza dover rispiegare tutto ogni volta.
