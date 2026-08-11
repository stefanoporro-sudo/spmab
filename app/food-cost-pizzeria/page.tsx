import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Receipt, TrendingDown, Trash2, Star, Calculator,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const angoli = [
  {
    icon: Receipt,
    titolo: "I prezzi in menù sono a occhio",
    desc: "Sono stati fissati anni fa, magari copiati dalla concorrenza o alzati un po' quando è aumentato il costo della farina. Nessuno ha mai calcolato il costo reale di ogni singola pizza.",
  },
  {
    icon: Trash2,
    titolo: "Gli sprechi non si vedono, ma pesano",
    desc: "Ingredienti scaduti, porzioni non standardizzate, farciture troppo generose su alcune pizze e troppo scarse su altre. Ogni piccola dispersione erode il margine, ed è quasi impossibile vederla senza numeri precisi.",
  },
  {
    icon: TrendingDown,
    titolo: "Vendi tanto, ma il margine si assottiglia",
    desc: "Il locale è pieno, i tavoli girano, eppure a fine mese il margine è più basso di quanto dovrebbe essere. È il segnale più chiaro che il food cost non è mai stato calcolato davvero.",
  },
];

const percorso = [
  {
    numero: "01",
    titolo: "Calcolo il costo reale di ogni pizza",
    desc: "Analizzo ogni voce del tuo menù: ingredienti, grammature, sprechi medi, costi di gestione. Il risultato è un costo reale per ogni pizza, non una stima approssimativa.",
  },
  {
    numero: "02",
    titolo: "Confronto costo e prezzo di vendita",
    desc: "Metto a confronto il costo reale con il prezzo attuale in menù, voce per voce. Emergono subito le pizze che ti fanno guadagnare davvero e quelle che, di fatto, lavori quasi in perdita.",
  },
  {
    numero: "03",
    titolo: "Ti aiuto a correggere prezzi e menù",
    desc: "Non si tratta solo di alzare i prezzi: a volte basta riequilibrare le farciture, riposizionare alcune pizze in menù o rivedere un fornitore. Il piano è calibrato sui tuoi numeri reali.",
  },
];

const faqItems = [
  {
    q: "Non ho mai calcolato il food cost, da dove si parte?",
    a: "Si parte dal menù attuale e dalle fatture dei fornitori. Nella prima consulenza capiamo insieme che dati servono e come raccoglierli senza che diventi un lavoro complicato per te.",
  },
  {
    q: "Alzare i prezzi non rischia di far scappare i clienti?",
    a: "Non è sempre questione di alzare i prezzi. Spesso il problema si risolve riequilibrando le grammature o riposizionando alcune pizze — l'obiettivo è il margine, non necessariamente un menù più caro.",
  },
  {
    q: "Serve un software per gestire il food cost?",
    a: "Non è indispensabile. Ti fornisco uno strumento semplice e chiaro, calibrato sul tuo menù, che puoi aggiornare tu stesso quando cambiano i costi delle materie prime.",
  },
  {
    q: "Quanto costa questa consulenza?",
    a: "Dipende dalla dimensione del menù e dalla complessità della tua offerta. La prima consulenza è gratuita e senza impegno: parliamo della tua situazione e ti propongo un piano su misura.",
  },
];

export default function FoodCostPizzeriaPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <Calculator size={13} />
            Food cost e margini pizzeria
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sai quanto costa
            <br />
            <span className="gradient-text">davvero una tua pizza?</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Il menù è pieno e i tavoli girano, ma il margine non si vede.
            Calcolo il costo reale di ogni pizza e ti aiuto ad allineare
            i prezzi ai tuoi margini veri.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contatti"
              className="inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/30 text-base"
            >
              Prima consulenza gratuita
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
              Il locale lavora.<br />
              <span className="gradient-text">Il margine no.</span>
            </h2>
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
              Numeri veri.<br />
              <span className="gradient-text">Non stime a occhio.</span>
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
              &ldquo;Quasi nessun titolare ha calcolato il costo reale della sua pizza
              margherita e della sua pizza più farcita. Eppure basta un pomeriggio di
              lavoro sui numeri per scoprire quali piatti ti fanno guadagnare
              davvero e quali, in realtà, ti costano.&rdquo;
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
                Parliamo dei tuoi numeri.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami il tuo menù — il resto lo calcoliamo insieme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Food Cost Pizzeria — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, vorrei capire il food cost reale della mia pizzeria.")}`}
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
            Il problema non è solo il margine, ma il locale in generale?{" "}
            <Link href="/consulenza-pizzeria" className="text-brand-400 hover:text-brand-300 transition-colors">
              Guarda la consulenza per pizzerie →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
