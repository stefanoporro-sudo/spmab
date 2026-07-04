Chiudi la sessione di lavoro sul progetto:

1. Esegui `git status` e `git diff` per vedere tutte le modifiche
2. Scrivi un messaggio di commit che riassume cosa è stato fatto e perché (non solo "what")
3. Aggiungi una riga in `.claude/context/history.md` con data, riepilogo di cosa è cambiato in questa sessione, e perché — così le sessioni future hanno memoria di ciò che è successo
4. Fai il commit (`git add` solo dei file rilevanti, mai `-A`)
5. **Non fare push** a meno che Stefano non lo chieda esplicitamente — il push triggera il deploy automatico su Vercel in produzione
