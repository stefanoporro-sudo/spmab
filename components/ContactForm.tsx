"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "stefano@consulenzapizzaiolo.it",
    href: "mailto:stefano@consulenzapizzaiolo.it",
  },
  {
    icon: Phone,
    label: "Telefono",
    value: "+39 — 3933602014",
    href: "#",
  },
  {
    icon: MapPin,
    label: "Zona operativa",
    value: "Italia — Europa",
    href: "#",
  },
];

const services = [
  "Consulenza Pizzaioli",
  "Consulenza Molini",
  "Apertura Pizzeria",
  "Apertura Panetteria",
  "Business Plan",
  "Altro",
];

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      alert("Errore nell'invio. Riprova o scrivici direttamente a stefano@consulenzapizzaiolo.it");
    }
  };

  return (
    <section id="contatti" className="py-28 bg-dark-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="section-subtitle mb-4">Contatti</p>
          <h2 className="section-title text-white mb-4">
            Inizia il tuo percorso{" "}
            <span className="gradient-text">oggi.</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            La prima consulenza è gratuita. Scrivici, raccontaci il tuo progetto e scopri come
            possiamo aiutarti.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {contactInfo.map((info) => (
              <a
                key={info.label}
                href={info.href}
                className="card flex items-start gap-4 group"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0 group-hover:bg-brand-500/25 transition-colors">
                  <info.icon className="text-brand-400 w-5 h-5" />
                </div>
                <div>
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    {info.label}
                  </div>
                  <div className="text-white font-medium text-sm">{info.value}</div>
                </div>
              </a>
            ))}

            {/* Guarantee box */}
            <div className="bg-gradient-to-br from-brand-600/15 to-brand-900/10 border border-brand-500/25 rounded-2xl p-6 mt-2">
              <div className="text-brand-300 font-semibold mb-2">Prima consulenza gratuita</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nessun impegno. Parliamo del tuo progetto, valutiamo insieme le opportunità e solo
                allora decidi come procedere.
              </p>
            </div>

            {/* Google Reviews CTA */}
            <a
              href="https://g.page/r/CcUAIJZQfXUSEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-4 group hover:border-yellow-500/40 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                {/* Google star icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FBBF24" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-yellow-300 transition-colors">
                  Lascia una recensione
                </div>
                <div className="text-gray-500 text-xs mt-0.5">
                  Hai lavorato con me? Aiutami su Google ⭐
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card flex flex-col items-center justify-center text-center h-full min-h-[400px] gap-5">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle className="text-green-400 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-display text-2xl font-bold mb-2">
                    Messaggio inviato!
                  </h3>
                  <p className="text-gray-400">
                    Ti risponderemo entro 24 ore lavorative. Grazie per averci contattato!
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                      Nome e Cognome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Mario Rossi"
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="mario@example.com"
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+39 333 000 0000"
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                      Servizio di interesse
                    </label>
                    <select
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-dark-700">Seleziona...</option>
                      {services.map((s) => (
                        <option key={s} value={s} className="bg-dark-700">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">
                    Descrivi il tuo progetto *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Raccontaci la tua idea, il punto in cui ti trovi e cosa ti aspetti dalla consulenza..."
                    className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary self-start disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      Invia la richiesta
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
