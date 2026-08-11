import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Thermometer, Droplets, Timer, Star, FlaskConical,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const angoli = [
  {
    icon: Thermometer,
    titolo: "La temperatura ambiente ti tradisce",
    desc: "Lo stesso impasto si comporta in modo diverso d'estate e d'inverno, o anche solo tra un turno di lavoro e l'altro. Senza un metodo per compensarla, la fermentazione diventa imprevedibile.",
  },
  {
    icon: Droplets,
    titolo: "L'idratazione non è mai davvero sotto controllo",
    desc: "Un grammo di farina diverso, un'umidità ambiente diversa, e l'impasto cambia consistenza. Se non hai un sistema per adattarti, ogni infornata è una scommessa.",
  },
  {
    icon: Timer,
    titolo: "I tempi sulla carta non coincidono con la realtà",
    desc: "La ricetta dice 24 ore di fermentazione, ma il risultato di oggi non è quello di ieri. I tempi scritti non bastano se non sai leggere lo stato reale del tuo impasto.",
  },
];

const percorso = [
  {
    numero: "01",
    titolo: "Osservo il tuo impasto in ogni fase",
    desc: "Dall'impastamento alla stesura, seguo il processo dal vivo per vedere dove, esattamente, entra la variabilità che rovina la costanza del risultato.",
  },
  {
    numero: "02",
    titolo: "Isolo la causa reale, non il sintomo",
    desc: "Temperatura, idratazione, gestione dei tempi, manualità: individuo la variabile — o le variabili — che nel tuo caso specifico stanno facendo la differenza tra un impasto e l'altro.",
  },
  {
    numero: "03",
    titolo: "Ti do un metodo per leggere l'impasto, non solo seguire orari",
    desc: "Il vero salto di qualità è imparare a leggere lo stato dell'impasto in ogni momento, così puoi adattarti alle condizioni reali invece di seguire ciecamente un orologio.",
  },
];

const faqItems = [
  {
    q: "Uso sempre la stessa ricetta, perché il risultato cambia?",
    a: "Perché una ricetta scritta non tiene conto delle condizioni reali del tuo laboratorio: temperatura, umidità, tipo di farina, manualità. La costanza si ottiene imparando a leggere e correggere queste variabili, non seguendo solo i numeri sulla carta.",
  },
  {
    q: "Lavori su tutti gli stili di impasto?",
    a: "Sì: diretto, indiretto, con biga o poolish, alte idrature, impasti per teglia, pala o tondo napoletano. Ogni stile ha le sue variabili specifiche, e la diagnosi si adatta al tuo.",
  },
  {
    q: "Serve attrezzatura particolare per ottenere costanza?",
    a: "Non sempre. Spesso il problema si risolve con un metodo più preciso di lettura e gestione, non con nuove attrezzature. Se serve davvero uno strumento in più, te lo dico chiaramente — senza consigliare acquisti non necessari.",
  },
  {
    q: "Quanto costa questa consulenza?",
    a: "Dipende da cosa emerge dalla prima valutazione. La prima consulenza è gratuita e senza impegno: mi racconti la tua situazione e ti dico come posso aiutarti.",
  },
];

export default function ConsulenzaImpastiPizzeriaPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <FlaskConical size={13} />
            Consulenza tecnica sull'impasto
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Stessa ricetta.
            <br />
            <span className="gradient-text">Risultato diverso ogni volta.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Temperatura, idratazione, tempi di fermentazione — trovo il punto
            esatto del tuo processo in cui si perde la costanza dell'impasto.
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
              La ricetta è giusta.<br />
              <span className="gradient-text">Il processo no.</span>
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
              Non un'altra ricetta.<br />
              <span className="gradient-text">Un metodo per leggere l'impasto.</span>
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
              &ldquo;Una ricetta scritta è solo un punto di partenza. La vera
              competenza è saper leggere l'impasto davanti a te e adattarti
              alle condizioni reali — quello è ciò che trasforma un risultato
              casuale in un risultato costante.&rdquo;
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
                Parliamo del tuo impasto.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami cosa cambia da un'infornata all'altra — il resto lo scopriamo insieme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Consulenza Impasti Pizzeria — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, il mio impasto non è mai costante e vorrei capire perché.")}`}
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
            Il problema va oltre l'impasto?{" "}
            <Link href="/consulente-pizzaiolo" className="text-brand-400 hover:text-brand-300 transition-colors">
              Guarda la diagnosi tecnica completa del prodotto →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
