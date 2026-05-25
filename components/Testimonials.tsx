"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  stars: number;
  text: string;
};

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={15}
          className={i < count ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}
        />
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((r) => r.json())
      .then((d) => setTestimonials(d.testimonials ?? []));
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-dark-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="section-subtitle mb-4">Recensioni</p>
          <h2 className="section-title text-white mb-4">
            Cosa dicono di{" "}
            <span className="gradient-text">me</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            {/* Google logo SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-gray-500 text-sm">Recensioni Google verificate</span>
          </div>
        </div>

        {/* Cards */}
        <div className={`grid gap-6 ${
          testimonials.length === 1
            ? "max-w-lg mx-auto"
            : testimonials.length === 2
            ? "md:grid-cols-2 max-w-3xl mx-auto"
            : "md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-dark-800 border border-dark-600 rounded-2xl p-7 flex flex-col gap-5 hover:border-brand-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5"
            >
              {/* Stars */}
              <StarRating count={t.stars} />

              {/* Testo */}
              <p className="text-gray-300 leading-relaxed text-sm flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Autore */}
              <div className="flex items-center gap-3 pt-4 border-t border-dark-600">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{getInitials(t.name)}</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  {t.role && (
                    <div className="text-gray-500 text-xs mt-0.5">{t.role}</div>
                  )}
                </div>
                {/* Google icon piccola */}
                <div className="ml-auto">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA recensione */}
        <div className="text-center mt-12">
          <a
            href="https://g.page/r/CcUAIJZQfXUSEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-400 text-sm transition-colors"
          >
            <Star size={14} className="fill-current" />
            Lascia anche tu una recensione
          </a>
        </div>
      </div>
    </section>
  );
}
