import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Eye, HelpCircle, ThermometerSun, Star, Search,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const angoli = [
  {
    icon: Eye,
    titolo: "Il cliente se ne accorge, tu no",
    desc: "Chi lavora ogni giorno con lo stesso impasto perde la capacità di vederne i difetti. Un occhio esterno nota in dieci minuti quello che a te sfugge da mesi.",
  },
  {
    icon: HelpCircle,
    titolo: "Hai provato a correggere, ma non è cambiato niente",
    desc: "Hai cambiato farina, tempi, temperature — magari seguendo un video o un consiglio letto online. Il problema persiste perché nessuno ha guardato davvero il tuo processo specifico.",
  },
  {
    icon: ThermometerSun,
    titolo: "Non sai se è la ricetta o il metodo",
    desc: "La ricetta può essere giusta sulla carta e sbagliata nella pratica: temperature ambiente, gestione dei tempi, manualità. Serve capire dove, nel processo reale, si perde la costanza.",
  },
];

const percorso = [
  {
    numero: "01",
    titolo: "Vengo a vedere il tuo lavoro dal vivo",
    desc: "Osservo l'impasto dall'inizio alla fine: ingredienti, tempi, manualità, ambiente. Non basta un video o una chiamata — la diagnosi seria si fa guardando il processo reale.",
  },
  {
    numero: "02",
    titolo: "Ti dico esattamente dove si perde la costanza",
    desc: "Individuo il punto preciso — o i punti — in cui il tuo processo introduce variabilità: può essere la fermentazione, l'idratazione, la gestione delle temperature o la manualità nella stesura.",
  },
  {
    numero: "03",
    titolo: "Un correttivo che puoi applicare da subito",
    desc: "Non ti lascio con una lista di teoria. Ti do un metodo preciso e ripetibile, e verifico con te che il risultato torni costante nel tempo.",
  },
];

const faqItems = [
  {
    q: "Come fai a capire il problema senza vedere il mio impasto in anticipo?",
    a: "Non lo faccio da remoto: la diagnosi seria richiede di vedere il processo dal vivo. Nella prima consulenza gratuita parliamo della tua situazione e valutiamo insieme se serve una visita in loco.",
  },
  {
    q: "Il problema può essere la farina o il forno, non solo il metodo?",
    a: "Sì, e fa parte della diagnosi. Valuto anche le attrezzature e le materie prime — a volte il metodo è corretto ma lo strumento o l'ingrediente non lo asseconda.",
  },
  {
    q: "Lavori con tutti gli stili di pizza?",
    a: "Sì. Napoletana, romana, in teglia, alla pala, al padellino — ogni stile ha le sue variabili specifiche, e la diagnosi si adatta al tuo stile, non il contrario.",
  },
  {
    q: "Quanto costa una diagnosi?",
    a: "Dipende da cosa emerge nella prima chiacchierata. La prima consulenza è gratuita e senza impegno: mi racconti la situazione e ti dico come posso aiutarti.",
  },
];

export default function ConsulentePizzaioloPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <Search size={13} />
            Diagnosi tecnica del prodotto
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            La tua pizza non è
            <br />
            <span className="gradient-text">sempre la stessa. Il cliente lo nota.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Serve un consulente pizzaiolo che guardi il tuo processo con occhi esterni
            e ti dica esattamente dove si perde la costanza — non teoria, una diagnosi vera.
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
              Stessa ricetta.<br />
              <span className="gradient-text">Risultato diverso ogni volta.</span>
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
              Guardo il tuo processo.<br />
              <span className="gradient-text">Non la tua ricetta scritta su un foglio.</span>
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
              &ldquo;Ho visto centinaia di impasti diversi, e la stessa storia si ripete:
              chi ci lavora dentro ogni giorno non riesce più a vederne i difetti.
              Non serve un altro video da guardare — serve qualcuno che guardi
              il tuo impasto con occhi che non l'hanno mai visto prima.&rdquo;
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
                Parliamo del tuo prodotto.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami cosa noti di incostante — il resto lo scopriamo insieme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Consulente Pizzaiolo — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, il mio prodotto non è costante e vorrei una diagnosi.")}`}
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
            Cerchi un percorso di crescita più ampio, non solo una diagnosi?{" "}
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
