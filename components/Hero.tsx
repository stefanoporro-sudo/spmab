"use client";

import { ArrowRight, ChevronDown, MapPin } from "lucide-react";

// Sostituisci con l'URL della tua foto (es. da Supabase Storage)
// Lascia stringa vuota per mostrare il placeholder
const HERO_PHOTO_URL = "https://www.consulenzapizzaiolo.it/io_home.jpeg";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#d47e28 1px, transparent 1px), linear-gradient(90deg, #d47e28 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
        <div className="grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_460px] gap-12 lg:gap-16 items-center">

          {/* Colonna testo */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              Consulenza Professionale Settore Food & Artigianato
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Trasforma la tua{" "}
              <span className="gradient-text">passione</span>
              <br />
              in un&apos;impresa{" "}
              <span className="text-brand-400">di successo.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 font-light">
              Consulenza strategica specializzata per{" "}
              <strong className="text-white font-semibold">Pizzaioli, Molini</strong> e{" "}
              <strong className="text-white font-semibold">Startup</strong> nel settore
              della panificazione artigianale. Dall&apos;idea al business.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <a href="#contatti" className="btn-primary text-base">
                Prenota una consulenza gratuita
                <ArrowRight size={18} />
              </a>
              <a href="#servizi" className="btn-outline text-base">
                Scopri i servizi
              </a>
              <a href="/ricette" className="inline-flex items-center gap-2 text-brand-300 hover:text-brand-200 font-medium text-base transition-colors">
                📄 Ricette gratuite
              </a>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-dark-600 max-w-md">
              {[
                { number: "15+", label: "Anni di esperienza" },
                { number: "80+", label: "Clienti soddisfatti" },
                { number: "100%", label: "Soluzioni su misura" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-3xl font-bold gradient-text mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonna foto */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-full max-w-sm lg:max-w-md">
              {/* Cornice foto */}
              <div className="relative rounded-3xl overflow-hidden border border-dark-600 shadow-2xl shadow-black/40 aspect-[3/4]">
                {HERO_PHOTO_URL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={HERO_PHOTO_URL}
                    alt="Stefano Porro — Consulente Pizzaiolo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Placeholder — rimuovi quando hai la foto */
                  <div className="w-full h-full bg-gradient-to-br from-dark-800 via-dark-700 to-dark-800 flex flex-col items-center justify-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-brand-500/15 border border-brand-500/20 flex items-center justify-center">
                      <span className="text-5xl">👨‍🍳</span>
                    </div>
                    <div className="text-center px-6">
                      <p className="text-white font-semibold text-lg">Stefano Porro</p>
                      <p className="text-gray-500 text-sm mt-1">Aggiungi qui la tua foto</p>
                      <p className="text-gray-600 text-xs mt-1">Modifica HERO_PHOTO_URL in Hero.tsx</p>
                    </div>
                  </div>
                )}

                {/* Overlay gradiente in basso */}
                <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-dark-900/80 to-transparent" />

                {/* Card nome in basso */}
                <div className="absolute bottom-4 left-4 right-4 bg-dark-900/80 backdrop-blur-sm border border-dark-600 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-none">Stefano Porro</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin size={10} className="text-brand-400" />
                      <p className="text-gray-400 text-xs">Consulente Pizzaiolo</p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 text-xs font-medium">Disponibile</span>
                  </div>
                </div>
              </div>

              {/* Decorazione angolo */}
              <div className="absolute -top-3 -right-3 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-3 -left-3 w-32 h-32 bg-brand-600/8 rounded-full blur-2xl" />
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#servizi"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 hover:text-brand-400 transition-colors group"
      >
        <span className="text-xs tracking-widest uppercase font-medium">Scopri</span>
        <ChevronDown size={20} className="animate-bounce" />
      </a>
    </section>
  );
}
