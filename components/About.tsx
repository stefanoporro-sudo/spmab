import { CheckCircle2, Award, Handshake, Target } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Approccio su misura",
    desc: "Ogni cliente è unico. Analizzo la tua situazione specifica e costruisco soluzioni personalizzate, non soluzioni standard.",
  },
  {
    icon: Award,
    title: "Competenza certificata",
    desc: "Anni di esperienza pratica sul campo nel settore della panificazione, molitura e gestione di attività food.",
  },
  {
    icon: Handshake,
    title: "Partner, non solo consulente",
    desc: "Ti affianco in ogni fase del percorso, con continuità e disponibilità concreta, anche dopo il lancio.",
  },
];

const credentials = [
  "Esperto nella gestione tecnica di impasti e lievitazioni naturali",
  "Consulente per l'avvio di attività nel settore food artigianale",
  "Supporto nella selezione di macchinari e attrezzature professionali",
  "Analisi finanziaria e redditività per pizzerie e panetterie",
  "Sviluppo menù, listini e posizionamento del brand",
  "Affiancamento diretto nelle fasi operative critiche",
];

export default function About() {
  return (
    <section id="chi-sono" className="py-28 bg-dark-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: image placeholder + decoration */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-900 to-dark-700 aspect-[4/5] max-w-md mx-auto lg:mx-0 border border-brand-700/30">
              {/* Decorative placeholder */}
              <img
  src="/stefano.jpg"
  alt="Stefano Porro - SPMAB"
  className="absolute inset-0 w-full h-full object-cover object-top"
/>
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-dark-900/90 backdrop-blur-sm border border-brand-500/30 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Award className="text-brand-400 w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Stefano Porro</div>
                    <div className="text-gray-400 text-xs">Fondatore & Consulente Senior SPMAB</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative orb */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Right: content */}
          <div className="order-1 lg:order-2">
            <p className="section-subtitle mb-4">Chi Sono</p>
            <h2 className="section-title text-white mb-6">
              Una guida esperta
              <br />
              <span className="gradient-text">per ogni fase del tuo progetto.</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Sono Stefano Porro, fondatore di SPMAB. Ho dedicato la mia carriera a supportare
              professionisti e imprenditori nel settore della panificazione e ristorazione artigianale,
              combinando competenza tecnica e visione imprenditoriale.
            </p>
            <p className="text-gray-400 leading-relaxed mb-10">
              Lavoro con pizzaioli che vogliono affinare la propria arte, con molini che cercano di
              crescere sul mercato, e con chi sogna di aprire la propria attività partendo da zero.
              Il mio metodo è concreto, pratico e orientato ai risultati.
            </p>

            {/* Credentials list */}
            <ul className="space-y-3 mb-10">
              {credentials.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-400 w-5 h-5 mt-0.5 shrink-0" />
                  <span className="text-gray-300 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <a href="#contatti" className="btn-primary">
              Parliamo del tuo progetto
            </a>
          </div>
        </div>

        {/* Values row */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 pt-20 border-t border-dark-600">
          {values.map((v) => (
            <div key={v.title} className="card group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-5 group-hover:bg-brand-500/25 transition-colors">
                <v.icon className="text-brand-400 w-6 h-6" />
              </div>
              <h4 className="text-white font-semibold text-lg mb-3">{v.title}</h4>
              <p className="text-gray-400 leading-relaxed text-sm">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
