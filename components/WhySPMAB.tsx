import { Zap, Shield, BarChart3, Clock } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    number: "01",
    title: "Risultati concreti, non teorie",
    desc: "Ogni consiglio che fornisco è testato sul campo. Non troverai teorie astratte, ma soluzioni pratiche che hanno già fatto la differenza per altri imprenditori.",
  },
  {
    icon: Shield,
    number: "02",
    title: "Riduci il rischio d'impresa",
    desc: "Aprire un'attività comporta rischi. Con SPMAB analizzi mercato, costi e strategie prima di investire, evitando gli errori più comuni e costosi.",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Crescita misurabile",
    desc: "Definiamo insieme KPI chiari e misurabili. Sai sempre dove sei, dove vuoi arrivare e quali leve azionare per accelerare la crescita.",
  },
  {
    icon: Clock,
    number: "04",
    title: "Risparmia tempo e denaro",
    desc: "Il costo di un errore in fase di avvio o espansione supera di gran lunga quello della consulenza. Investi in conoscenza per accelerare il ritorno.",
  },
];

export default function WhySPMAB() {
  return (
    <section id="perche-spmab" className="py-28 bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left sticky header */}
          <div className="lg:sticky lg:top-32">
            <p className="section-subtitle mb-4">Perché Sceglierci</p>
            <h2 className="section-title text-white mb-6">
              Perché SPMAB
              <br />
              <span className="gradient-text">fa la differenza.</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              In un mercato competitivo, avere al proprio fianco un consulente esperto può essere
              la differenza tra il successo e il fallimento. Ecco perché i nostri clienti scelgono SPMAB.
            </p>

            {/* Testimonial highlight */}
            <div className="bg-dark-800 border border-brand-500/20 rounded-2xl p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-brand-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-gray-300 italic leading-relaxed mb-4 text-sm">
                &ldquo;Grazie a SPMAB ho trasformato la mia passione per la pizza in una pizzeria
                avviata in soli 6 mesi. Stefano è stato fondamentale in ogni fase, dalla scelta
                del locale all&apos;assunzione del personale.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <span className="text-brand-300 font-bold text-sm">ML</span>
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">Marco L.</div>
                  <div className="text-gray-500 text-xs">Pizzeria Artigianale, Milano</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: reasons list */}
          <div className="flex flex-col gap-6">
            {reasons.map((reason) => (
              <div
                key={reason.number}
                className="card flex gap-6 items-start group cursor-default"
              >
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
                    <reason.icon className="text-brand-400 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-brand-500/50 text-xs font-mono font-bold mb-1">
                    {reason.number}
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">{reason.title}</h4>
                  <p className="text-gray-400 leading-relaxed text-sm">{reason.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
