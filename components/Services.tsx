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
  Sparkles,
  MapPin,
  Clock,
  UtensilsCrossed,
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
            Consulenza altamente specializzata in due ambiti distinti ma complementari
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

        {/* ── Personal Chef Pizzaiolo ─────────────────────────────── */}
        <div className="mt-16 relative rounded-3xl overflow-hidden border border-brand-500/40 bg-gradient-to-br from-dark-800 via-dark-800 to-brand-900/30">
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-transparent to-amber-600/10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-10 items-start">

              {/* Left content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-2 bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                    <Sparkles size={12} />
                    Servizio Esclusivo
                  </span>
                </div>

                <div className="flex items-start gap-5 mb-6">
                  <div className="p-4 rounded-2xl bg-dark-900 border border-brand-500/30 shrink-0">
                    <UtensilsCrossed className="text-brand-400 w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                      Personal Chef Pizzaiolo
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                      Porto la vera pizza artigianale direttamente a casa tua. Un&apos;esperienza
                      unica per eventi privati, cene tra amici, feste e occasioni speciali.
                      Impasti preparati da me, cotti al momento, davanti ai tuoi ospiti.
                    </p>
                  </div>
                </div>

                {/* Dettagli servizio */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-dark-900/70 border border-dark-600 rounded-2xl p-5">
                    <Users className="text-brand-400 w-5 h-5 mb-3" />
                    <div className="text-white font-semibold text-sm mb-1">Fino a 25 persone</div>
                    <div className="text-gray-500 text-xs">Perfetto per gruppi di amici, famiglie e piccoli eventi</div>
                  </div>
                  <div className="bg-dark-900/70 border border-dark-600 rounded-2xl p-5">
                    <MapPin className="text-brand-400 w-5 h-5 mb-3" />
                    <div className="text-white font-semibold text-sm mb-1">A domicilio</div>
                    <div className="text-gray-500 text-xs">Vengo io da te con impasti già pronti — tu pensi solo agli ospiti</div>
                  </div>
                  <div className="bg-dark-900/70 border border-dark-600 rounded-2xl p-5">
                    <Clock className="text-brand-400 w-5 h-5 mb-3" />
                    <div className="text-white font-semibold text-sm mb-1">Prenota in anticipo</div>
                    <div className="text-gray-500 text-xs">Date limitate disponibili — contattami per verificare la disponibilità</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-400 inline-block" /> Impasti artigianali inclusi</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" /> Farciture a carico del cliente</span>
                  <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-600 inline-block" /> Pernotto escluso se richiesto</span>
                </div>
              </div>

              {/* Right: Price card */}
              <div className="lg:w-72 w-full shrink-0">
                <div className="bg-dark-900 border border-brand-500/50 rounded-2xl p-7 text-center shadow-2xl shadow-brand-500/10">
                  <div className="text-gray-500 text-xs uppercase tracking-widest mb-2">A partire da</div>
                  <div className="font-display text-5xl font-bold text-white mb-1">
                    450<span className="text-brand-400">€</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-6">per serata · max 25 persone</div>

                  <div className="space-y-2.5 text-sm text-left mb-7">
                    {[
                      "Impasti artigianali freschi",
                      "Cottura live davanti agli ospiti",
                      "Personalizzazione menu",
                      "Fino a 25 persone",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                        </div>
                        <span className="text-gray-300">{item}</span>
                      </div>
                    ))}
                  </div>

                  <a
                    href={`https://wa.me/393933602014?text=${encodeURIComponent("Ciao Stefano! Sono interessato al servizio Personal Chef Pizzaiolo per un evento privato. Puoi darmi informazioni e disponibilità?")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-bold px-6 py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/30 text-sm"
                  >
                    Verifica disponibilità
                    <ArrowRight size={15} />
                  </a>
                  <p className="text-gray-600 text-xs mt-3">Via WhatsApp · risposta rapida</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
