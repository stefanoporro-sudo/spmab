import Link from "next/link";
import {
  ArrowRight, CheckCircle2, MapPinned, Wallet, Compass, Star, Rocket,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const angoli = [
  {
    icon: Compass,
    titolo: "Troppe decisioni, nessuna priorità",
    desc: "Location, concept, attrezzature, personale, fornitori, menù — tutto sembra urgente e importante insieme. Senza una guida rischi di decidere nell'ordine sbagliato, o di bloccarti.",
  },
  {
    icon: MapPinned,
    titolo: "Non sai valutare davvero una location",
    desc: "Un affitto conveniente può nascondere costi di adeguamento enormi, o un bacino di clienti sbagliato per il tuo concept. Servono criteri concreti, non solo intuito.",
  },
  {
    icon: Wallet,
    titolo: "Rischi di investire male i tuoi risparmi",
    desc: "L'errore più costoso in questa fase non è quasi mai un dettaglio — è una scelta strutturale sbagliata fatta all'inizio, che poi si paga per anni. Meglio sbagliare sulla carta che sul conto corrente.",
  },
];

const percorso = [
  {
    numero: "01",
    titolo: "Definiamo il concept prima di tutto",
    desc: "Prima di guardare locali o attrezzature, chiariamo cosa vuoi davvero essere: stile di pizza, target di clientela, posizionamento di prezzo. Ogni altra decisione discende da qui.",
  },
  {
    numero: "02",
    titolo: "Valutiamo location, costi e numeri insieme",
    desc: "Ti aiuto a leggere un contratto di affitto, stimare i costi reali di apertura e capire se i numeri del business plan reggono prima che tu firmi qualcosa.",
  },
  {
    numero: "03",
    titolo: "Costruiamo le basi tecniche solide",
    desc: "Impasto, attrezzature, organizzazione del lavoro fin dal primo giorno — perché aprire bene significa partire già con un prodotto e un metodo che reggono nel tempo.",
  },
];

const faqItems = [
  {
    q: "Sono all'inizio, non ho ancora un locale né un'idea precisa. Ha senso contattarti già ora?",
    a: "È il momento migliore per farlo. Le decisioni più importanti — e più costose da correggere dopo — si prendono proprio in questa fase, prima di firmare un contratto d'affitto.",
  },
  {
    q: "Mi aiuti anche con la parte burocratica e i finanziamenti?",
    a: "Non sono un commercialista né un consulente finanziario: per quella parte ti indirizzo verso i professionisti giusti. Il mio contributo è sul concept, il prodotto, la location e l'organizzazione operativa.",
  },
  {
    q: "Devo già avere esperienza come pizzaiolo per aprire una pizzeria?",
    a: "No. Ho seguito sia pizzaioli esperti che vogliono mettersi in proprio, sia persone che vengono da altri settori. In entrambi i casi il percorso parte dallo stesso punto: un concept chiaro e basi tecniche solide.",
  },
  {
    q: "Quanto costa questo tipo di consulenza?",
    a: "Dipende dall'ampiezza del percorso di cui hai bisogno. La prima consulenza è gratuita e senza impegno: parliamo del tuo progetto e ti dico come posso accompagnarti.",
  },
];

export default function AprirePizzeriaPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <Rocket size={13} />
            Consulenza per aprire una pizzeria
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Vuoi aprire una pizzeria.
            <br />
            <span className="gradient-text">Ma non sai da dove iniziare.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Troppe decisioni, nessuna guida, il rischio di investire male
            i tuoi risparmi. Ti accompagno nelle scelte che contano davvero,
            prima che tu firmi qualcosa.
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
              Il sogno c'è.<br />
              <span className="gradient-text">Il percorso è nebuloso.</span>
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
              Le decisioni giuste,<br />
              <span className="gradient-text">nell'ordine giusto.</span>
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
              &ldquo;L'errore più costoso non si fa mai il primo giorno di apertura —
              si fa mesi prima, quando si firma un contratto sbagliato o si sceglie
              un concept che non regge. Il mio lavoro, in questa fase, è aiutarti
              a sbagliare sulla carta, non sul conto corrente.&rdquo;
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
                Parliamo del tuo progetto.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami la tua idea — il resto lo costruiamo insieme, un passo alla volta.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Aprire Pizzeria — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, vorrei aprire una pizzeria e non so da dove iniziare.")}`}
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
            La pizzeria è già aperta ma non rende?{" "}
            <Link href="/consulenza-pizzeria" className="text-brand-400 hover:text-brand-300 transition-colors">
              Guarda la consulenza per pizzerie avviate →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
