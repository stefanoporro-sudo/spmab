import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Wheat, TrendingUp,
  Target, Users, BarChart3, Handshake, ChefHat, Zap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const problemi = [
  {
    icon: Target,
    titolo: "La tua farina è ottima, ma nessuno lo sa",
    desc: "Produrre una farina di qualità non basta. Il mercato pizza è competitivo e i pizzaioli scelgono in base alla fiducia e alle performance testate sul campo.",
  },
  {
    icon: BarChart3,
    titolo: "Difficile entrare nel mercato pizzerie",
    desc: "I distributori e i pizzaioli sono difficili da raggiungere senza dimostrazioni concrete. Una presentazione commerciale non basta — serve una demo che convinca.",
  },
  {
    icon: Wheat,
    titolo: "Le farine generiche non si differenziano",
    desc: "Una farina 'per pizza' non basta più. I pizzaioli cercano farine studiate per il loro specifico stile: romana, napoletana, teglia. La specializzazione vince.",
  },
];

const servizi = [
  {
    icon: ChefHat,
    titolo: "Sviluppo farine specifiche per target",
    desc: "Analizzo le caratteristiche tecniche delle tue farine e le bilancio per ottenere performance ottimali su stili di pizza definiti: napoletana, romana, in teglia, pala. Il pizzaiolo ottiene risultati ripetibili — tu ottieni un prodotto che si vende.",
    punti: [
      "Analisi forza, assorbimento e tenacia",
      "Bilanciamento per fermentazioni brevi e lunghe",
      "Test con pizzaioli professionisti",
      "Scheda tecnica con parametri chiari",
    ],
  },
  {
    icon: Users,
    titolo: "Demo presso distributori e pizzerie",
    desc: "Vado io di persona presso i tuoi distributori o direttamente nelle pizzerie target. Preparo l'impasto, faccio la pizza, spiego perché la tua farina fa la differenza. Una demo vale cento brochure.",
    punti: [
      "Demo tecniche in presenza",
      "Materiale di supporto per i rivenditori",
      "Formazione del personale commerciale",
      "Follow-up con i clienti acquisiti",
    ],
  },
  {
    icon: TrendingUp,
    titolo: "Strategia di distribuzione nel mercato pizza",
    desc: "Identifico i canali giusti per il tuo prodotto — grossisti, cash & carry, distribuzione diretta — e definisco una strategia per entrare nel mercato pizza con il posizionamento corretto.",
    punti: [
      "Mappa dei distributori per area geografica",
      "Posizionamento di prezzo e qualità",
      "Strategia per grano 100% italiano",
      "Supporto alle trattative commerciali",
    ],
  },
  {
    icon: Handshake,
    titolo: "Affiancamento continuo",
    desc: "Non scompaio dopo la consulenza iniziale. Ti affianco nelle fasi critiche: lancio di nuovi prodotti, apertura di nuovi mercati, gestione dei feedback dai pizzaioli.",
    punti: [
      "Supporto nelle fasi di lancio",
      "Analisi feedback dal mercato",
      "Ottimizzazione continua del prodotto",
      "Monitoraggio risultati di vendita",
    ],
  },
];

const risultati = [
  { numero: "100%", label: "dei molini con cui ho collaborato ha migliorato le proprie vendite nel mercato pizza" },
  { numero: "3", label: "stili di pizza su cui specializzo le farine: napoletana, romana, in teglia" },
  { numero: "2", label: "tipologie di molini seguiti: industriali e artigianali con grano 100% italiano" },
];

const casoStudio = [
  { periodo: "Mesi 1–3", titolo: "Analisi tecnica", desc: "Analisi completa delle farine esistenti: forza, assorbimento, tenacia.", icon: BarChart3 },
  { periodo: "Mesi 4–5", titolo: "Test di prodotto", desc: "Differenziazione delle farine in base allo stile di pizza: napoletana, romana, in teglia.", icon: Wheat },
  { periodo: "Mese 6", titolo: "Lancio", desc: "I clienti storici del mulino riconoscono subito il miglioramento rispetto al prodotto precedente.", icon: Zap },
  { periodo: "Mesi 6–12", titolo: "Crescita", desc: "Aumento della produttività e ingresso in distributori locali in tutta Italia.", icon: TrendingUp },
  { periodo: "Dopo 1 anno", titolo: "Mercato consolidato", desc: "Risultati concreti sia sul mercato italiano che su quello estero.", icon: Handshake },
];

const faqItems = [
  {
    q: "Lavori solo con molini di grandi dimensioni?",
    a: "No. Ho collaborato sia con molini industriali che con realtà artigianali specializzate in grano italiano. L'approccio cambia, ma il risultato è lo stesso: una farina posizionata correttamente nel mercato pizza.",
  },
  {
    q: "In quanto tempo si vedono i risultati?",
    a: "Dipende dalla fase di partenza. Lo sviluppo tecnico della farina richiede 4-8 settimane di test. L'ingresso nel mercato attraverso demo e distribuzione porta i primi risultati concreti in 2-4 mesi.",
  },
  {
    q: "Fai anche consulenza per farine biologiche o con grano italiano?",
    a: "Sì. Il posizionamento su grano 100% italiano o biologico è uno dei differenziatori più efficaci nel mercato pizza attuale. È un vantaggio competitivo enorme se comunicato nel modo giusto.",
  },
  {
    q: "Quanto costa la consulenza?",
    a: "Ogni progetto è diverso. La prima chiamata è gratuita e senza impegno — valutiamo insieme cosa serve e ti propongo un percorso su misura.",
  },
];

export default function ConsulenzaMoliniPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-brand-900/20 pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <Wheat size={13} />
            Consulenza specializzata per Molini
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            La tua farina merita
            <br />
            <span className="gradient-text">il mercato che si merita.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Sviluppo farine bilanciate per pizza napoletana, romana e in teglia.
            Porto il tuo prodotto dai distributori alle pizzerie con demo tecniche
            che convincono davvero.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contatti"
              className="inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/30 text-base"
            >
              Richiedi una consulenza gratuita
              <ArrowRight size={18} />
            </a>
            <a
              href="#servizi"
              className="inline-flex items-center gap-3 border border-dark-500 hover:border-brand-500/50 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base"
            >
              Scopri i servizi
            </a>
          </div>
        </div>
      </section>

      {/* ── RISULTATI ────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-dark-700 bg-dark-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {risultati.map((r) => (
              <div key={r.numero}>
                <div className="font-display text-5xl font-bold gradient-text mb-3">{r.numero}</div>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASO STUDIO ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Un caso reale</p>
            <h2 className="section-title text-white mb-4">
              Da fornitore di forni<br />
              <span className="gradient-text">a protagonista nel mercato pizza.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Un mulino industriale italiano, già fornitore di grandi catene di forni, voleva entrare
              nel mercato pizza. Il prodotto di partenza era già solido — mancava la specializzazione.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-brand-500/60 via-brand-500/30 to-transparent" />
            <div className="flex flex-col gap-6">
              {casoStudio.map((step) => (
                <div key={step.titolo} className="flex gap-5 items-start">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-dark-800 border-2 border-brand-500 flex items-center justify-center shrink-0">
                    <step.icon className="text-brand-400 w-4 h-4" />
                  </div>
                  <div className="card flex-1 hover:border-brand-500/30 transition-all duration-300">
                    <span className="text-brand-400 text-xs font-mono font-bold uppercase tracking-wide">
                      {step.periodo}
                    </span>
                    <h3 className="text-white font-semibold text-lg mt-1 mb-2">{step.titolo}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-500 text-center italic mt-10 max-w-xl mx-auto">
            Nessun cambio di grano, nessuna rivoluzione di prodotto — solo il lavoro di individuare
            cosa cercava davvero il pizzaiolo e costruire la farina intorno a quella risposta.
          </p>
        </div>
      </section>

      {/* ── PROBLEMI ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Il problema</p>
            <h2 className="section-title text-white mb-4">
              Produrre bene non basta.<br />
              <span className="gradient-text">Bisogna anche vendersi bene.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Molti molini producono farine eccellenti ma faticano a farle conoscere
              nel mercato pizza. Ecco i problemi più comuni che risolvo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {problemi.map((p) => (
              <div key={p.titolo} className="card group hover:border-brand-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-5 group-hover:bg-brand-500/25 transition-colors">
                  <p.icon className="text-brand-400 w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3 leading-snug">{p.titolo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVIZI ──────────────────────────────────────────────── */}
      <section id="servizi" className="py-24 px-6 bg-dark-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Come posso aiutarti</p>
            <h2 className="section-title text-white mb-4">
              Dalla farina <span className="gradient-text">alla pizzeria.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Un percorso completo che parte dallo sviluppo tecnico del prodotto
              e arriva alla distribuzione nel mercato pizza italiano.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {servizi.map((s, i) => (
              <div
                key={s.titolo}
                className="card flex flex-col md:flex-row gap-8 hover:border-brand-500/30 transition-all duration-300"
              >
                <div className="md:w-64 shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                      <s.icon className="text-brand-400 w-5 h-5" />
                    </div>
                    <span className="text-brand-500/50 text-xs font-mono font-bold">0{i + 1}</span>
                  </div>
                  <h3 className="text-white font-semibold text-xl leading-snug">{s.titolo}</h3>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 leading-relaxed mb-5">{s.desc}</p>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {s.punti.map((punto) => (
                      <li key={punto} className="flex items-start gap-2">
                        <CheckCircle2 className="text-brand-400 w-4 h-4 mt-0.5 shrink-0" />
                        <span className="text-gray-400 text-sm">{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERCHÉ ME ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-subtitle mb-4">Perché scegliere me</p>
              <h2 className="section-title text-white mb-6">
                Parlo la lingua<br />
                <span className="gradient-text">del pizzaiolo e del molino.</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Ho lavorato su entrambi i lati del banco. Conosco le esigenze tecniche
                dei pizzaioli professionisti e so come tradurle in specifiche concrete
                per chi produce le farine.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Questo mi permette di sviluppare farine che <strong className="text-white">funzionano davvero
                sul campo</strong> e di comunicarle in modo credibile ai pizzaioli durante
                le demo. Non vendo una farina — dimostro perché è la scelta giusta.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Esperienza diretta con molini industriali e artigianali",
                  "Conoscenza approfondita di tutti gli stili di pizza italiana",
                  "Rete di contatti con pizzaioli e distributori",
                  "Approccio tecnico e commerciale integrato",
                  "Tutti i molini con cui ho collaborato hanno migliorato le vendite",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Zap className="text-brand-400 w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card citazione */}
            <div className="bg-gradient-to-br from-brand-600/15 to-amber-600/10 border border-brand-500/25 rounded-3xl p-8">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-brand-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-200 text-lg leading-relaxed italic mb-6">
                &ldquo;Ogni molino con cui ho lavorato ha visto un netto miglioramento
                nel proprio mercato pizza. Non perché abbiamo cambiato il grano —
                ma perché abbiamo capito cosa cercava davvero il pizzaiolo
                e abbiamo costruito il prodotto intorno a quella risposta.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <div className="text-white font-semibold">Stefano Porro</div>
                  <div className="text-gray-500 text-sm">Consulente — Consulenza Pizzaiolo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-dark-800">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">FAQ</p>
            <h2 className="section-title text-white">Domande frequenti</h2>
          </div>
          <div className="flex flex-col gap-4">
            {faqItems.map((item) => (
              <div key={item.q} className="card">
                <h3 className="text-white font-semibold mb-3">{item.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINALE ───────────────────────────────────────────── */}
      <section id="contatti" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-amber-600 p-12">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Parliamo della tua farina.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami il tuo prodotto e capiamo insieme come farlo crescere nel mercato pizza.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Consulenza Molini — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, sono un molino e vorrei informazioni sulla tua consulenza per farine pizza.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 border border-white/30"
                >
                  WhatsApp diretto
                </a>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mt-8">
            Preferisci navigare il sito?{" "}
            <Link href="/" className="text-brand-400 hover:text-brand-300 transition-colors">
              Torna alla homepage →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
