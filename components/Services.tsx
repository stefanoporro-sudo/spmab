import {
  Wheat,
  Store,
  TrendingUp,
  FileText,
  Users,
  ChefHat,
  Factory,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const serviceGroups = [
  {
    id: "pizzaioli-molini",
    badge: "Area 1",
    title: "Pizzaioli & Molini",
    description:
      "Supporto tecnico e strategico per professionisti della farina, dal grano alla pizza. Ottimizza processi, qualità e posizionamento di mercato.",
    icon: Wheat,
    color: "from-amber-500/20 to-brand-600/20",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
    services: [
      {
        icon: ChefHat,
        title: "Formazione Tecnica Pizzaioli",
        desc: "Tecniche avanzate di impasto, fermentazione e cottura per differenziarti dalla concorrenza.",
      },
      {
        icon: Factory,
        title: "Ottimizzazione Molini",
        desc: "Analisi e miglioramento dei processi produttivi per aumentare resa e qualità delle farine.",
      },
      {
        icon: TrendingUp,
        title: "Posizionamento di Mercato",
        desc: "Strategia commerciale per valorizzare prodotti artigianali e raggiungere clienti premium.",
      },
      {
        icon: FileText,
        title: "Certificazioni & Qualità",
        desc: "Supporto per ottenere certificazioni di qualità, biologico e tracciabilità filiera.",
      },
    ],
  },
  {
    id: "startup-aziendali",
    badge: "Area 2",
    title: "Startup Aziendali",
    description:
      "Dalla prima idea alla prima vendita. Affiancamento completo per aprire e far crescere pizzerie, panetterie e laboratori artigianali.",
    icon: Store,
    color: "from-brand-600/20 to-orange-500/20",
    borderColor: "border-brand-500/30",
    iconColor: "text-brand-400",
    services: [
      {
        icon: Lightbulb,
        title: "Business Plan & Analisi",
        desc: "Redazione di business plan dettagliati con analisi di mercato, concorrenza e proiezioni finanziarie.",
      },
      {
        icon: Store,
        title: "Apertura Attività",
        desc: "Guida completa: location, permessi, allestimento, fornitori e lancio operativo.",
      },
      {
        icon: Users,
        title: "Team Building & HR",
        desc: "Selezione e formazione del personale, organigrammi e procedure operative per il tuo locale.",
      },
      {
        icon: TrendingUp,
        title: "Crescita & Scaling",
        desc: "Strategie di espansione per replicare il modello vincente su nuove sedi o franchising.",
      },
    ],
  },
];

export default function Services() {
  return (
    <section id="servizi" className="py-28 bg-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-20">
          <p className="section-subtitle mb-4">I Nostri Servizi</p>
          <h2 className="section-title text-white mb-6">
            Due aree di competenza,
            <br />
            <span className="gradient-text">un unico obiettivo.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            SPMAB offre consulenza altamente specializzata in due ambiti distinti ma complementari
            del mondo food artigianale italiano.
          </p>
        </div>

        {/* Service groups */}
        <div className="flex flex-col gap-16">
          {serviceGroups.map((group, idx) => (
            <div
              key={group.id}
              className={`rounded-3xl bg-gradient-to-br ${group.color} border ${group.borderColor} p-8 md:p-12`}
            >
              {/* Group header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
                <div className="flex items-start gap-5">
                  <div
                    className={`p-4 rounded-2xl bg-dark-800 border ${group.borderColor} shrink-0`}
                  >
                    <group.icon className={`${group.iconColor} w-8 h-8`} />
                  </div>
                  <div>
                    <span className="section-subtitle text-xs mb-2 block">{group.badge}</span>
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                      {group.title}
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                      {group.description}
                    </p>
                  </div>
                </div>
                <a
                  href="#contatti"
                  className={`shrink-0 inline-flex items-center gap-2 border ${group.borderColor} text-gray-200 hover:text-white hover:border-white/50 font-medium px-6 py-3 rounded-full text-sm transition-all duration-300 self-start`}
                >
                  Richiedi info <ArrowRight size={15} />
                </a>
              </div>

              {/* Service cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {group.services.map((service) => (
                  <div
                    key={service.title}
                    className="bg-dark-900/60 backdrop-blur-sm border border-dark-600/50 rounded-2xl p-6 hover:border-brand-500/40 transition-all duration-300 group"
                  >
                    <service.icon
                      className={`${group.iconColor} w-6 h-6 mb-4 group-hover:scale-110 transition-transform`}
                    />
                    <h4 className="text-white font-semibold text-base mb-2 leading-snug">
                      {service.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
