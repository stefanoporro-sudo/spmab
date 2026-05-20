import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 bg-dark-900 relative overflow-hidden">
      {/* Full-width gradient banner */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-amber-600 p-12 md:p-16 text-center">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} />
              Prima consulenza gratuita e senza impegno
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Il momento migliore per iniziare
              <br />è adesso.
            </h2>

            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Ogni settimana che passa senza una strategia è un&apos;opportunità persa.
              Contattaci oggi e costruiamo insieme il tuo percorso di successo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contatti"
                className="inline-flex items-center gap-3 bg-white text-brand-700 font-bold px-10 py-4 rounded-full hover:bg-brand-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl text-base"
              >
                Richiedi la consulenza gratuita
                <ArrowRight size={18} />
              </a>
              <a
                href="/ricette"
                className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 text-base border border-white/30"
              >
                Scarica le ricette gratuite
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
