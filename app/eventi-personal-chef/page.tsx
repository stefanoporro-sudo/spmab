import {
  ArrowRight, Sparkles, MapPin, Clock, UtensilsCrossed, Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function EventiPersonalChefPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 via-transparent to-amber-900/20 pointer-events-none" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full uppercase tracking-widest mb-8">
            <UtensilsCrossed size={13} />
            Eventi & Personal Chef
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            La vera pizza artigianale
            <br />
            <span className="gradient-text">direttamente a casa tua.</span>
          </h1>

          <p className="text-gray-300 text-xl leading-relaxed max-w-2xl mx-auto">
            Un&apos;esperienza unica per eventi privati, cene tra amici, feste e occasioni speciali.
            Impasti preparati da me, cotti al momento, davanti ai tuoi ospiti.
          </p>
        </div>
      </section>

      {/* ── DETTAGLIO SERVIZIO ───────────────────────────────────── */}
      <section className="pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-brand-500/40 bg-gradient-to-br from-dark-800 via-dark-800 to-brand-900/30">
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
                      <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                        Personal Chef Pizzaiolo
                      </h2>
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

                {/* Right: CTA card */}
                <div className="lg:w-72 w-full shrink-0">
                  <div className="bg-dark-900 border border-brand-500/50 rounded-2xl p-7 text-center shadow-2xl shadow-brand-500/10">
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-5">
                      <UtensilsCrossed className="text-brand-400 w-7 h-7" />
                    </div>

                    <div className="text-white font-display font-bold text-xl mb-2">
                      Disponibilità limitata
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      Le date si esauriscono in anticipo. Contattami per verificare la disponibilità e ricevere un preventivo personalizzato.
                    </p>

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
                      Richiedi disponibilità
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

      <Footer />
    </div>
  );
}
