"use client";

import { ArrowRight, ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large amber glow */}
        <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[100px]" />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#d47e28 1px, transparent 1px), linear-gradient(90deg, #d47e28 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating wheat/grain silhouette shapes */}
        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-brand-400/30 rounded-full" />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-brand-300/20 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-brand-500/20 rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            Consulenza Professionale Settore Food & Artigianato
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Trasforma la tua{" "}
            <span className="gradient-text">passione</span>
            <br />
            in un&apos;impresa{" "}
            <span className="text-brand-400">di successo.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-10 max-w-2xl font-light">
            Consulenza strategica specializzata per{" "}
            <strong className="text-white font-semibold">Pizzaioli, Molini</strong> e{" "}
            <strong className="text-white font-semibold">Startup</strong> nel settore
            della panificazione artigianale. Dall&apos;idea al business.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
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
          <div className="grid grid-cols-3 gap-8 pt-10 border-t border-dark-600 max-w-xl">
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
