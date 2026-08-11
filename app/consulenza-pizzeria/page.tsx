import Link from "next/link";
import {
  ArrowRight, CheckCircle2, TrendingDown, Users2, Wallet, Star, Store,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const angoli = [
  {
    icon: TrendingDown,
    titolo: "Lavori tanto, guadagni poco",
    desc: "Le comande non si fermano mai, ma a fine mese il conto non torna. Tra costi delle materie prime, personale e utenze, il margine reale si è ristretto senza che tu capissi esattamente dove.",
  },
  {
    icon: Users2,
    titolo: "La squadra non è organizzata",
    desc: "Ognuno fa un po' a modo suo, i turni si sovrappongono male, e la qualità cambia a seconda di chi è in cucina quella sera. Il locale gira, ma senza un metodo comune.",
  },
  {
    icon: Wallet,
    titolo: "Non sai più su cosa intervenire",
    desc: "Menù, prezzi, fornitori, orari, personale — i problemi sembrano tanti e slegati tra loro. Manca una diagnosi d'insieme che ti dica da dove partire davvero.",
  },
];

const percorso = [
  {
    numero: "01",
    titolo: "Analisi della situazione reale",
    desc: "Vengo nel tuo locale, osservo il flusso di lavoro, controllo numeri e margini, ascolto te e la tua squadra. Prima di proporre soluzioni, capisco esattamente dove si perde valore.",
  },
  {
    numero: "02",
    titolo: "Un piano concreto, non teoria",
    desc: "Ti indico le 2-3 leve che, nel tuo caso specifico, hanno il maggiore impatto: possono riguardare il prodotto, l'organizzazione, i costi o il menù. Niente liste generiche — solo ciò che serve a te.",
  },
  {
    numero: "03",
    titolo: "Affiancamento nell'applicazione",
    desc: "Non ti lascio da solo con un documento. Torno, verifico i risultati, correggo la rotta se serve. L'obiettivo è un miglioramento che si vede nei numeri, non solo sulla carta.",
  },
];

const faqItems = [
  {
    q: "La mia pizzeria è aperta da anni, ha senso una consulenza adesso?",
    a: "Sì, anzi è il caso più comune con cui lavoro. Un locale avviato spesso ha accumulato piccole inefficienze che nessuno ha mai messo in fila: è proprio lì che si trova il margine da recuperare.",
  },
  {
    q: "Ti occupi solo di impasto e prodotto, o anche di gestione?",
    a: "In questa consulenza guardo il quadro completo: prodotto, organizzazione del lavoro, costi e menù. Il problema di una pizzeria raramente è uno solo — vanno visti insieme per capire dove intervenire prima.",
  },
  {
    q: "Quanto tempo serve per vedere un cambiamento nei numeri?",
    a: "Dipende da cosa emerge dall'analisi. Alcune correzioni (es. sul menù o sugli sprechi) danno segnali già nel primo mese. Altre, più organizzative, richiedono qualche mese per consolidarsi.",
  },
  {
    q: "Quanto costa la consulenza?",
    a: "Dipende dalla dimensione del locale e da cosa emerge nell'analisi iniziale. La prima consulenza è gratuita e senza impegno: parliamo della tua situazione e ti dico se e come posso essere utile.",
  },
];

export default function ConsulenzaPizzeriaPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <Store size={13} />
            Consulenza per pizzerie già avviate
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            La pizzeria è aperta.
            <br />
            <span className="gradient-text">Ma non rende come dovrebbe.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Tanto lavoro, margini bassi, e non sai più a chi chiedere.
            Analizzo la tua pizzeria nel suo insieme e ti dico esattamente
            dove intervenire per invertire la rotta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contatti"
              className="inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/30 text-base"
            >
              Analisi iniziale della tua attività
              <ArrowRight size={18} />
            </a>
            <a
              href="#percorso"
              className="inline-flex items-center gap-3 border border-dark-500 hover:border-brand-500/50 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base"
            >
              Scopri come funziona
            </a>
          </div>
        </div>
      </section>

      {/* ── IL PROBLEMA ──────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-dark-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Ti riconosci?</p>
            <h2 className="section-title text-white mb-4">
              Il locale gira.<br />
              <span className="gradient-text">Ma qualcosa non torna.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Sono i segnali più comuni di una pizzeria che lavora, ma non sta
              rendendo quanto potrebbe.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {angoli.map((a) => (
              <div key={a.titolo} className="card group hover:border-brand-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-5 group-hover:bg-brand-500/25 transition-colors">
                  <a.icon className="text-brand-400 w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3 leading-snug">{a.titolo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERCORSO ─────────────────────────────────────────────── */}
      <section id="percorso" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Come lavoro</p>
            <h2 className="section-title text-white mb-4">
              Prima capiamo cosa non va.<br />
              <span className="gradient-text">Poi lo sistemiamo insieme.</span>
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {percorso.map((s) => (
              <div key={s.titolo} className="card flex flex-col md:flex-row gap-8 hover:border-brand-500/30 transition-all duration-300">
                <div className="md:w-56 shrink-0">
                  <span className="text-brand-500/50 text-xs font-mono font-bold">{s.numero}</span>
                  <h3 className="text-white font-semibold text-xl leading-snug mt-2">{s.titolo}</h3>
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CITAZIONE ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-dark-800">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-brand-600/15 to-amber-600/10 border border-brand-500/25 rounded-3xl p-8 md:p-10">
            <div className="flex gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} className="text-brand-400 fill-brand-400" />
              ))}
            </div>
            <p className="text-gray-200 text-lg leading-relaxed italic mb-6">
              &ldquo;Quasi sempre il problema non è uno solo, ed è quasi mai quello
              che il titolare pensa all'inizio. Per questo la prima cosa che faccio
              non è dare consigli — è guardare, misurare, capire. Solo dopo si costruisce
              il piano.&rdquo;
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
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
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
      <section id="contatti" className="py-24 px-6 bg-dark-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-amber-600 p-12">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Parliamo della tua pizzeria.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami la tua situazione — il resto lo costruiamo insieme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Consulenza Pizzeria — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, ho una pizzeria e vorrei informazioni sulla tua consulenza.")}`}
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
            Cerchi un percorso di crescita tecnica e professionale?{" "}
            <Link href="/consulenza-pizzaioli" className="text-brand-400 hover:text-brand-300 transition-colors">
              Guarda la consulenza per pizzaioli →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
