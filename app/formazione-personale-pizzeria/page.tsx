import Link from "next/link";
import {
  ArrowRight, CheckCircle2, UserX, RefreshCcw, BookOpenCheck, Star, GraduationCap,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const angoli = [
  {
    icon: UserX,
    titolo: "Se manchi tu, la qualità crolla",
    desc: "Un giorno libero, una malattia, una ferie — e il prodotto cambia. Il locale non regge senza la tua presenza costante, e questo ti impedisce di staccare davvero.",
  },
  {
    icon: RefreshCcw,
    titolo: "Il turnover ti costringe a ripartire da zero",
    desc: "Ogni volta che cambia un dipendente, devi reinsegnare tutto daccapo, spesso senza un metodo scritto — solo per come lo fai tu, a memoria. È un tempo che perdi continuamente.",
  },
  {
    icon: BookOpenCheck,
    titolo: "Non hai un metodo trasferibile",
    desc: "Sai fare bene il tuo lavoro, ma non hai mai messo per iscritto un processo che un altro possa seguire con gli stessi risultati. La conoscenza resta solo nella tua testa.",
  },
];

const percorso = [
  {
    numero: "01",
    titolo: "Analizzo il tuo metodo attuale",
    desc: "Osservo come lavori oggi tu e la tua squadra, e individuo cosa, del tuo know-how, non è ancora scritto o insegnato in modo strutturato.",
  },
  {
    numero: "02",
    titolo: "Costruiamo un metodo replicabile",
    desc: "Trasformo il tuo modo di lavorare in un processo chiaro, con standard precisi su impasto, farciture, tempi e cottura — qualcosa che chiunque nella tua squadra può seguire con lo stesso risultato.",
  },
  {
    numero: "03",
    titolo: "Formo direttamente il tuo staff",
    desc: "Lavoro con la tua squadra sul campo, non solo con te. L'obiettivo è che il prodotto resti costante anche quando tu non sei in cucina.",
  },
];

const faqItems = [
  {
    q: "Formi direttamente i miei dipendenti o solo me?",
    a: "Entrambi, ma il punto centrale è lo staff: l'obiettivo è che la qualità non dipenda più solo da te. Il metodo lo costruiamo insieme, poi lo insegno direttamente a chi lavora con te.",
  },
  {
    q: "Ho un turnover alto, ha senso investire in formazione?",
    a: "Sì, anzi è proprio la situazione in cui la formazione rende di più: un metodo scritto e standard chiari accorciano drasticamente i tempi per portare una nuova persona a lavorare bene.",
  },
  {
    q: "Quanto tempo richiede formare la squadra?",
    a: "Dipende dalla dimensione della squadra e dal punto di partenza. Dopo la prima fase di analisi ti do una stima realistica per il tuo caso specifico.",
  },
  {
    q: "Quanto costa questo percorso?",
    a: "Dipende dal numero di persone da formare e dalla complessità del menù. La prima consulenza è gratuita e senza impegno: parliamo della tua situazione e ti propongo un piano su misura.",
  },
];

export default function FormazionePersonalePizzeriaPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <GraduationCap size={13} />
            Formazione dello staff
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Se manchi tu,
            <br />
            <span className="gradient-text">la qualità non dovrebbe crollare.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Formo il tuo staff con un metodo scritto e replicabile, perché
            il prodotto resti costante anche quando non ci sei tu in cucina.
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
              Il locale dipende<br />
              <span className="gradient-text">da una sola persona: te.</span>
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
              Dal tuo know-how<br />
              <span className="gradient-text">a un metodo che chiunque può seguire.</span>
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
              &ldquo;Un titolare che non può mai staccare non ha un'attività —
              ha un lavoro che non finisce mai. La differenza si vede quando
              il metodo esce dalla tua testa e diventa qualcosa che la tua
              squadra sa applicare da sola.&rdquo;
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
                Parliamo della tua squadra.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                La prima consulenza è gratuita e senza impegno.
                Raccontami la tua situazione — il resto lo costruiamo insieme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Formazione Personale Pizzeria — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, vorrei formare il mio staff perché il prodotto sia costante.")}`}
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
            Il problema è il prodotto, non solo il team?{" "}
            <Link href="/consulente-pizzaiolo" className="text-brand-400 hover:text-brand-300 transition-colors">
              Guarda la diagnosi tecnica del prodotto →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
