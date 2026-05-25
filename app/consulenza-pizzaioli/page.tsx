import Link from "next/link";
import {
  ArrowRight, CheckCircle2, ChefHat, TrendingUp,
  Target, Zap, Lightbulb, Heart, Star, Flame,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const problemi = [
  {
    icon: Target,
    titolo: "Sai fare la pizza, ma qualcosa non torna",
    desc: "L'impasto non è sempre costante, la lievitazione ti tradisce, il cliente nota la differenza. Spesso il problema non è la ricetta — è capire dove si nasconde l'errore.",
  },
  {
    icon: Flame,
    titolo: "Hai tanta passione ma pochi strumenti",
    desc: "La passione è il punto di partenza, non il punto di arrivo. Senza una guida tecnica rischi di girare in tondo per anni, migliorando poco e perdendo motivazione.",
  },
  {
    icon: Lightbulb,
    titolo: "Vuoi crescere ma non sai da dove iniziare",
    desc: "Diventare titolare, migliorare il menù, differenziarti dalla concorrenza. I sogni ci sono ma il percorso è nebuloso. Serve qualcuno che conosce la strada.",
  },
];

const servizi = [
  {
    icon: ChefHat,
    titolo: "Analisi e miglioramento del prodotto",
    desc: "Analizzo il tuo impasto, la tua tecnica e i tuoi processi. Individuo le criticità specifiche e definiamo insieme un piano di miglioramento concreto e misurabile. Non teorie — soluzioni pratiche calate sulla tua realtà.",
    punti: [
      "Analisi tecnica dell'impasto e della lievitazione",
      "Ottimizzazione di idratazione e fermentazione",
      "Gestione delle temperature e dei tempi",
      "Costanza e ripetibilità del risultato",
    ],
  },
  {
    icon: Target,
    titolo: "Studio delle tue criticità",
    desc: "Ogni pizzaiolo ha le sue sfide. Non esiste una soluzione uguale per tutti. Ascolto, osservo e capisco il tuo contesto specifico — che tu lavori in una piccola pizzeria o in un locale di alto livello.",
    punti: [
      "Analisi del tuo contesto lavorativo",
      "Identificazione dei punti di debolezza",
      "Piano d'azione personalizzato",
      "Supporto continuativo nel tempo",
    ],
  },
  {
    icon: TrendingUp,
    titolo: "Crescita professionale e di carriera",
    desc: "Sei un dipendente con l'ambizione di diventare titolare? Sei un titolare che vuole portare la sua pizzeria a un livello superiore? Ti accompagno in ogni fase della crescita, con gli strumenti giusti per ogni tappa.",
    punti: [
      "Percorso da dipendente a titolare",
      "Sviluppo del concept della tua pizzeria",
      "Posizionamento e differenziazione",
      "Gestione del locale e del personale",
    ],
  },
  {
    icon: Heart,
    titolo: "Affiancamento su misura",
    desc: "Non scompaio dopo la prima sessione. Ti affianco nel tempo, rispondo ai tuoi dubbi, ti aiuto ad adattare le soluzioni quando cambiano le condizioni. Sono un punto di riferimento, non solo un consulente.",
    punti: [
      "Sessioni di follow-up periodiche",
      "Supporto su problemi pratici quotidiani",
      "Aggiornamento continuo su tecniche e tendenze",
      "Accesso alla mia rete di professionisti del settore",
    ],
  },
];

const perChi = [
  {
    icon: "👨‍🍳",
    titolo: "Il pizzaiolo dipendente",
    desc: "Lavori in pizzeria da anni ma senti che stai girando in tondo. Vuoi migliorare la tecnica, essere riconosciuto come professionista e magari un giorno aprire la tua attività.",
  },
  {
    icon: "🏪",
    titolo: "Il titolare appassionato",
    desc: "Hai aperto la tua pizzeria con passione ma i risultati non rispecchiano le aspettative. Il prodotto non è costante, i clienti non tornano abbastanza. Vuoi capire cosa non funziona e sistemarlo.",
  },
  {
    icon: "🚀",
    titolo: "Chi vuole aprire una pizzeria",
    desc: "Hai il sogno di aprire la tua pizzeria e vuoi farlo nel modo giusto: con un prodotto solido, un'identità chiara e una base tecnica che regga nel tempo.",
  },
];

const faqItems = [
  {
    q: "Lavori con tutti gli stili di pizza?",
    a: "Sì. Napoletana, romana, in teglia, alla pala, al padellino. Ogni stile ha le sue specificità tecniche e ogni pizzaiolo ha il suo contesto. Mi adatto a entrambi.",
  },
  {
    q: "Serve esperienza minima per lavorare con te?",
    a: "No. Lavoro con pizzaioli a tutti i livelli: chi è agli inizi e vuole costruire bene dalle fondamenta, e chi ha anni di esperienza ma cerca il salto di qualità.",
  },
  {
    q: "Le sessioni sono in presenza o online?",
    a: "Entrambe le opzioni sono disponibili. Per l'analisi pratica dell'impasto preferisco la presenza, ma molto del lavoro strategico e di supporto può avvenire anche da remoto.",
  },
  {
    q: "Quanto tempo ci vuole per vedere miglioramenti?",
    a: "I primi risultati tecnici si vedono in poche settimane. La crescita professionale e commerciale è un percorso più lungo — ma con le basi giuste, ogni passo è solido.",
  },
  {
    q: "Quanto costa la consulenza?",
    a: "Dipende dal percorso e dalle tue esigenze. La prima consulenza è gratuita e senza impegno — parliamo, capisco la tua situazione e ti propongo un piano su misura.",
  },
];

export default function ConsulenzaPizzaioliPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <ChefHat size={13} />
            Consulenza specializzata per Pizzaioli
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            La passione è tua.
            <br />
            <span className="gradient-text">Il metodo lo costruiamo insieme.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Miglioro il tuo impasto, studio le tue criticità e ti accompagno
            nella crescita professionale. Che tu sia dipendente o titolare,
            appassionato o ambizioso — c&apos;è un percorso per te.
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
              href="#servizi"
              className="inline-flex items-center gap-3 border border-dark-500 hover:border-brand-500/50 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base"
            >
              Scopri come funziona
            </a>
          </div>
        </div>
      </section>

      {/* ── RISULTATI ────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-dark-700 bg-dark-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-display text-5xl font-bold gradient-text mb-3">100%</div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">dei pizzaioli con cui ho lavorato ha migliorato il proprio prodotto</p>
            </div>
            <div>
              <div className="font-display text-5xl font-bold gradient-text mb-3">∞</div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">livelli di partenza — lavoro con dipendenti, titolari e chi vuole aprire</p>
            </div>
            <div>
              <div className="font-display text-5xl font-bold gradient-text mb-3">🏆</div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">alcuni dei pizzaioli seguiti sono diventati punti di riferimento nel loro mercato</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PER CHI È ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Per chi è</p>
            <h2 className="section-title text-white mb-4">
              Ti riconosci in<br />
              <span className="gradient-text">uno di questi?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {perChi.map((p) => (
              <div key={p.titolo} className="card group hover:border-brand-500/30 transition-all duration-300 text-center">
                <div className="text-4xl mb-5">{p.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-3">{p.titolo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMI ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-dark-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Il problema</p>
            <h2 className="section-title text-white mb-4">
              La passione non basta.<br />
              <span className="gradient-text">Serve anche il metodo.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Questi sono i blocchi più comuni che incontrano i pizzaioli appassionati.
              Li riconosci?
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
      <section id="servizi" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Come lavoro</p>
            <h2 className="section-title text-white mb-4">
              Un percorso <span className="gradient-text">su misura per te.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Non esiste una formula uguale per tutti. Ogni pizzaiolo è diverso
              e ogni percorso è costruito intorno alla tua situazione specifica.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {servizi.map((s, i) => (
              <div key={s.titolo} className="card flex flex-col md:flex-row gap-8 hover:border-brand-500/30 transition-all duration-300">
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
      <section className="py-24 px-6 bg-dark-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-subtitle mb-4">Perché scegliere me</p>
              <h2 className="section-title text-white mb-6">
                Ho visto centinaia<br />
                <span className="gradient-text">di impasti. E so cosa non va.</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Non ti dico cosa leggere o cosa guardare su YouTube. Vengo da te,
                guardo il tuo impasto, ascolto i tuoi problemi e ti dico esattamente
                cosa migliorare e come farlo.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Ho lavorato con pizzaioli a tutti i livelli — dai neofiti agli esperti,
                dai dipendenti ai titolari. Tutti hanno migliorato. Alcuni sono diventati
                dei punti di riferimento nel loro mercato.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Approccio pratico, non teorico",
                  "Analisi personalizzata della tua situazione",
                  "Esperienza con tutti gli stili di pizza italiana",
                  "Supporto continuo, non solo una tantum",
                  "Risultati concreti e misurabili",
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
                  <Star key={i} size={18} className="text-brand-400 fill-brand-400" />
                ))}
              </div>
              <p className="text-gray-200 text-lg leading-relaxed italic mb-6">
                &ldquo;La passione per la pizza è il punto di partenza migliore che esista.
                Ma è il metodo che trasforma un appassionato in un professionista.
                Tutti i pizzaioli con cui ho lavorato lo hanno capito —
                e i risultati parlano da soli.&rdquo;
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
                Raccontami dove sei e dove vuoi arrivare — il resto lo costruiamo insieme.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Consulenza Pizzaiolo — Richiesta informazioni"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, sono un pizzaiolo e vorrei informazioni sulla tua consulenza.")}`}
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
            Sei un molino?{" "}
            <Link href="/consulenza-molini" className="text-brand-400 hover:text-brand-300 transition-colors">
              Guarda la pagina dedicata ai molini →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
