# SPMAB — Sito Vetrina Professionale

Sito Next.js 15 + Tailwind CSS per Stefano Porro — SPMAB.

## Struttura file

```
spmab-website/
├── app/
│   ├── globals.css       # Stili globali + Tailwind
│   ├── layout.tsx        # Layout root (metadata SEO)
│   └── page.tsx          # Pagina principale (assembla i componenti)
├── components/
│   ├── Header.tsx        # Navbar sticky + menu mobile
│   ├── Hero.tsx          # Sezione hero con headline e CTA
│   ├── Services.tsx      # Due aree di servizio (Pizzaioli/Molini + Startup)
│   ├── About.tsx         # Chi sono + valori
│   ├── WhySPMAB.tsx      # Perché sceglierci + testimonianza
│   ├── CTA.tsx           # Banner call-to-action centrale
│   ├── ContactForm.tsx   # Form di contatto con validazione
│   └── Footer.tsx        # Footer con link e contatti
├── public/               # Immagini statiche (aggiungi qui le tue foto)
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

## Avvio locale

```bash
# 1. Installa Node.js da https://nodejs.org (LTS)
# 2. Entra nella cartella
cd spmab-website

# 3. Installa le dipendenze
npm install

# 4. Avvia il server di sviluppo
npm run dev

# Apri http://localhost:3000
```

## Pubblicazione su Vercel (metodo consigliato)

### Opzione A — Deploy diretto dal browser (più semplice)

1. Vai su [github.com](https://github.com) → crea un account gratuito se non ce l'hai
2. Crea un nuovo repository (es. `spmab-website`)
3. Carica tutti i file di questo progetto tramite il pulsante **"Add file → Upload files"**
4. Vai su [vercel.com](https://vercel.com) → accedi con GitHub
5. Clicca **"Add New Project"** → seleziona il repository `spmab-website`
6. Vercel rileva automaticamente Next.js → clicca **"Deploy"**
7. In 2 minuti il sito è online! Ricevi un URL tipo `spmab-website.vercel.app`

### Opzione B — Deploy da terminale (se hai Node.js installato)

```bash
# Installa Vercel CLI
npm install -g vercel

# Dalla cartella del progetto
vercel

# Segui le istruzioni interattive
# Al termine ricevi l'URL pubblico
```

### Dominio personalizzato (es. spmab.it)

1. Nel dashboard Vercel → vai su **Settings → Domains**
2. Aggiungi il tuo dominio
3. Segui le istruzioni per aggiornare i DNS presso il tuo registrar

## Personalizzazioni consigliate

- **Foto**: sostituisci il placeholder in `About.tsx` con una tua foto professionale
- **Numero telefono**: aggiorna in `ContactForm.tsx` riga contatti
- **LinkedIn**: aggiorna il link in `Footer.tsx`
- **Testimonianze reali**: aggiungile in `WhySPMAB.tsx`
- **Form di contatto reale**: integra [Formspree](https://formspree.io) sostituendo il `handleSubmit` simulato in `ContactForm.tsx`

## Integrazione form con Formspree (gratuito)

```tsx
// In ContactForm.tsx, sostituisci handleSubmit con:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const res = await fetch("https://formspree.io/f/IL_TUO_ID", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  setLoading(false);
  if (res.ok) setSent(true);
};
```
