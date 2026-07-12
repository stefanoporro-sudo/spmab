import {
  ArrowRight, CheckCircle2, GraduationCap, Users,
  Target, Zap, Award, Building2, User, Flame,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const perChi = [
  {
    icon: Building2,
    titolo: "Scuole e centri di formazione",
    desc: "Vuoi offrire un corso tecnico di qualità ma non hai un formatore interno con esperienza reale in pizzeria. Porto competenza pratica, non solo teoria da manuale.",
  },
  {
    icon: Users,
    titolo: "Catene e gruppi di ristorazione",
    desc: "Hai più locali e il prodotto non è costante da un punto vendita all'altro. Formo il personale con uno standard tecnico unico, replicabile in ogni sede.",
  },
  {
    icon: User,
    titolo: "Il singolo che vuole specializzarsi",
    desc: "Vuoi una formazione tecnica seria per crescere professionalmente o cambiare lavoro, non l'ennesimo corso online che promette tutto e non insegna niente.",
  },
];

const problemi = [
  {
    icon: Target,
    titolo: "La formazione teorica non basta",
    desc: "Un corso senza pratica reale in laboratorio forma persone che sanno ripetere una ricetta a memoria, non che sanno reagire quando l'impasto si comporta diversamente dal previsto.",
  },
  {
    icon: Flame,
    titolo: "Il turnover del personale costa caro",
    desc: "Ogni volta che formi qualcuno da zero, perdi tempo e qualità. Serve un percorso strutturato che porti chiunque a un livello tecnico affidabile in tempi certi.",
  },
  {
    icon: GraduationCap,
    titolo: "Manca chi sa insegnare, non solo fare",
    desc: "Saper fare una pizza eccellente e saperla insegnare sono due competenze diverse. Un buon formatore tecnico spiega il perché di ogni passaggio, non solo il come.",
  },
];

const servizi = [
  {
    icon: GraduationCap,
    titolo: "Formazione tecnica in presenza",
    desc: "Il corso si svolge in laboratorio, con impasti veri e problemi veri da risolvere sul momento. Niente slide, niente teoria astratta scollegata dalla pratica quotidiana.",
    punti: [
      "Gestione dell'impasto e della fermentazione",
      "Lettura e correzione degli errori in tempo reale",
      "Gestione delle temperature e dei tempi di lavorazione",
      "Adattamento a diversi stili di pizza",
    ],
  },
  {
    icon: Building2,
    titolo: "Percorsi su misura per aziende e scuole",
    desc: "Il programma si adatta a chi lo riceve: personale già esperto che deve uniformarsi a uno standard, oppure principianti che partono da zero. Definiamo insieme obiettivi e durata prima di iniziare.",
    punti: [
      "Numero di partecipanti e durata concordati insieme",
      "Programma calibrato sul livello di partenza",
      "Materiale didattico incluso",
      "Possibilità di percorsi ripetuti per più sedi/gruppi",
    ],
  },
  {
    icon: Award,
    titolo: "Valutazione finale e attestato di partecipazione",
    desc: "Ogni percorso si chiude con una valutazione pratica e un attestato che certifica le ore svolte e le competenze trattate durante il corso.",
    punti: [
      "Valutazione pratica finale",
      "Attestato di partecipazione al corso",
      "Riepilogo scritto delle competenze acquisite",
    ],
  },
];

const faqItems = [
  {
    q: "I corsi sono per aziende/scuole o anche per singoli?",
    a: "Entrambi. Lavoro sia con scuole e realtà di ristorazione che vogliono formare il proprio personale, sia con singole persone che vogliono una formazione tecnica seria per crescere professionalmente.",
  },
  {
    q: "Dove si svolge il corso?",
    a: "In presenza, in laboratorio — presso la tua struttura se hai gli spazi adatti, oppure in una sede concordata insieme. La parte pratica richiede attrezzatura vera, non si può insegnare bene solo a distanza.",
  },
  {
    q: "Quanto dura un percorso di formazione?",
    a: "Dipende dagli obiettivi: da percorsi brevi e mirati su una competenza specifica, a programmi più estesi per chi parte da zero. La durata si definisce insieme dopo aver capito il livello di partenza e cosa serve davvero.",
  },
  {
    q: "Quanto costa?",
    a: "Il prezzo dipende dal numero di partecipanti, dalla durata e dal luogo. Non ho un listino fisso perché ogni percorso è diverso — richiedi un preventivo senza impegno e ti rispondo con una proposta su misura.",
  },
  {
    q: "Che differenza c'è con la consulenza per pizzaioli singoli?",
    a: "La consulenza è un percorso individuale su misura per un pizzaiolo o un titolare. La formazione tecnica è pensata per gruppi — personale di un locale, classi di una scuola, team di più sedi.",
  },
];

export default function TecnicoFormatorePage() {
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
            Formazione tecnica per pizzerie, scuole e team
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Non un altro corso teorico.
            <br />
            <span className="gradient-text">Formazione tecnica vera, in laboratorio.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Formo il personale di ristorazione, i gruppi di scuole professionali
            e i singoli che vogliono specializzarsi — con impasti veri, problemi
            veri, e uno standard tecnico che resta anche dopo che me ne sono andato.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contatti"
              className="inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-400 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-brand-500/30 text-base"
            >
              Richiedi un preventivo
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

      {/* ── PER CHI È ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">Per chi è</p>
            <h2 className="section-title text-white mb-4">
              Ti riconosci in<br />
              <span className="gradient-text">una di queste situazioni?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {perChi.map((p) => (
              <div key={p.titolo} className="card group hover:border-brand-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-5 group-hover:bg-brand-500/25 transition-colors">
                  <p.icon className="text-brand-400 w-6 h-6" />
                </div>
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
              La teoria non fa la pizza.<br />
              <span className="gradient-text">La pratica sì.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Questi sono i blocchi più comuni di chi deve formare personale
              o formarsi tecnicamente. Ti riconosci?
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
              Un percorso <span className="gradient-text">costruito sul tuo obiettivo.</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Che tu debba formare un team o formare te stesso, il programma
              parte dal livello reale di partenza, non da uno schema fisso.
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
                Insegno quello<br />
                <span className="gradient-text">che faccio davvero ogni giorno.</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Non porto un manuale da leggere insieme. Porto l'esperienza pratica
                di chi lavora con impasti reali ogni giorno, e la traduco in un
                percorso che chi partecipa può davvero applicare da subito.
              </p>
              <p className="text-gray-400 leading-relaxed mb-8">
                Lavoro sia con singoli pizzaioli in consulenza individuale, sia con
                gruppi — scuole, team di ristorazione, chi deve formare più persone
                con uno standard comune.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "Approccio pratico, in laboratorio",
                  "Programma calibrato sul livello reale del gruppo",
                  "Esperienza con tutti gli stili di pizza italiana",
                  "Materiale e attestato inclusi nel percorso",
                  "Nessun costo fisso: preventivo su misura per ogni richiesta",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Zap className="text-brand-400 w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-600/15 to-amber-600/10 border border-brand-500/25 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-5">
                <GraduationCap className="text-brand-400 w-6 h-6" />
                <span className="text-white font-semibold">Cosa include ogni percorso</span>
              </div>
              <ul className="flex flex-col gap-3">
                {[
                  "Analisi del livello di partenza prima di iniziare",
                  "Formazione pratica in laboratorio, non solo teoria",
                  "Materiale didattico di supporto",
                  "Valutazione finale e attestato di partecipazione",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="text-brand-400 w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
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
                Parliamo del tuo percorso di formazione.
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Raccontami chi devi formare e a che livello: singolo, team o classe.
                Ti rispondo con un preventivo su misura, senza impegno.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:stefano@consulenzapizzaiolo.it?subject=Richiesta preventivo — Formazione tecnica"
                  className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-8 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105"
                >
                  Scrivimi una email
                  <ArrowRight size={18} />
                </a>
                <a
                  href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano, vorrei informazioni sui corsi di formazione tecnica.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 border border-white/30"
                >
                  WhatsApp diretto
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
