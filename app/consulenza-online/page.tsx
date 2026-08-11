"use client";

import { useState } from "react";
import { Monitor, Clock, Award, Tag, CheckCircle, Send, ChefHat, Users, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const vantaggi = [
  { icon: Monitor, titolo: "100% Online", desc: "Sessioni live via video chiamata, comodamente da dove sei. Nessuno spostamento, massima flessibilità." },
  { icon: Clock, titolo: "Sessione da 90 minuti", desc: "Ogni pacchetto include una sessione tecnica di 90 minuti, concentrata sull'argomento che scegli tu." },
  { icon: Award, titolo: "Attestato di merito", desc: "Al termine di ogni pacchetto ricevi un attestato ufficiale sull'argomento studiato insieme." },
  { icon: Tag, titolo: "Sconto 10%", desc: "Acquistando 2 o più pacchetti ottieni uno sconto del 10% su ogni pacchetto aggiuntivo." },
];

const argomenti = [
  "Idratazione e gestione dell'impasto",
  "Fermentazione e pre-impasti (biga, poolish)",
  "Scelta delle farine e loro proprietà",
  "Gestione del forno e cottura",
  "Pizza napoletana",
  "Pizza in teglia / romana",
  "Pizza contemporanea",
  "Gestione della pizzeria e food cost",
  "Marketing per pizzeria",
  "Altro (specificare nel messaggio)",
];

export default function ConsulenzaOnlinePage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCompany, setIsCompany] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    piva: "",
    topic: "",
    packages: "1",
    notes: "",
  });

  const numPackages = parseInt(form.packages) || 1;
  const pricePerPack = numPackages >= 2 ? 179 : 199;
  const totalPrice = pricePerPack * numPackages;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/consulenza-online", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, isCompany }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      setError("Errore nell'invio. Riprova o scrivici a stefano@consulenzapizzaiolo.it");
    }
  };

  return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24">

        {/* Hero */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 text-brand-300 text-sm font-medium mb-6">
              <Monitor size={15} />
              Nuova modalità — Consulenza On Line
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Impara la pizza{" "}
              <span className="gradient-text">dove vuoi,</span>
              <br />quando vuoi.
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Sessioni di consulenza live con Stefano Porro, direttamente online.
              Scegli l&apos;argomento, prenoti il pacchetto e ti formi a distanza — con la stessa profondità di una consulenza in presenza.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <a href="#form-richiesta" className="btn-primary">
                Richiedi ora
                <Send size={16} />
              </a>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span>Consulente con oltre 10 anni di esperienza</span>
              </div>
            </div>
          </div>
        </section>

        {/* Vantaggi */}
        <section className="py-16 px-6 bg-dark-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vantaggi.map((v) => (
                <div key={v.titolo} className="card group hover:border-brand-500/40 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4 group-hover:bg-brand-500/25 transition-colors">
                    <v.icon className="text-brand-400 w-6 h-6" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{v.titolo}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-subtitle mb-3">Prezzi</p>
              <h2 className="section-title text-white">Semplice e trasparente</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">

              {/* Pacchetto singolo */}
              <div className="card border-dark-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">1 Pacchetto</div>
                    <div className="text-white font-display text-4xl font-bold">€199</div>
                  </div>
                  <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3">
                    <ChefHat className="text-brand-400 w-6 h-6" />
                  </div>
                </div>
                <ul className="flex flex-col gap-3 mb-6">
                  {["1 sessione tecnica da 90 minuti", "1 argomento a scelta", "Attestato di merito incluso", "Supporto via email tra le sessioni"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle size={15} className="text-brand-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#form-richiesta" className="block text-center border border-brand-500/40 text-brand-300 hover:bg-brand-500/10 rounded-xl py-3 text-sm font-semibold transition-all duration-200">
                  Scegli questo piano
                </a>
              </div>

              {/* Pacchetti multipli */}
              <div className="card border-brand-500/40 bg-gradient-to-br from-brand-600/5 to-transparent relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Risparmia 10%
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-brand-300 text-xs uppercase tracking-widest mb-1">2+ Pacchetti</div>
                    <div className="text-white font-display text-4xl font-bold">€179<span className="text-lg font-normal text-gray-400">/cad.</span></div>
                  </div>
                  <div className="bg-brand-500/20 border border-brand-500/30 rounded-xl p-3">
                    <Users className="text-brand-300 w-6 h-6" />
                  </div>
                </div>
                <ul className="flex flex-col gap-3 mb-6">
                  {["1 sessione tecnica da 90 minuti per ogni pacchetto", "Argomenti diversi a ogni pacchetto", "Attestato di merito per ogni argomento", "Sconto del 10% per pacchetto aggiuntivo", "Percorso formativo progressivo"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle size={15} className="text-brand-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="#form-richiesta" className="block text-center bg-brand-500 hover:bg-brand-400 text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200">
                  Scegli questo piano
                </a>
              </div>
            </div>

            {/* Argomenti disponibili */}
            <div className="mt-10 card">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Award size={18} className="text-brand-400" />
                Argomenti disponibili (esempi)
              </h3>
              <div className="flex flex-wrap gap-2">
                {argomenti.map((a) => (
                  <span key={a} className="bg-dark-700 border border-dark-500 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4">
                Non trovi il tuo argomento? Scrivilo nel campo &quot;Argomento da studiare&quot; — definiamo insieme il percorso.
              </p>
            </div>
          </div>
        </section>

        {/* Form */}
        <section id="form-richiesta" className="py-20 px-6 bg-dark-800">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-subtitle mb-3">Prenota</p>
              <h2 className="section-title text-white mb-4">Inizia subito</h2>
              <p className="text-gray-400">
                Compila il modulo con i tuoi dati. Ti ricontatterò entro 24 ore per concordare le date delle sessioni.
              </p>
            </div>

            {sent ? (
              <div className="card flex flex-col items-center justify-center text-center gap-5 py-16">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle className="text-green-400 w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-display text-2xl font-bold mb-2">Richiesta inviata!</h3>
                  <p className="text-gray-400 max-w-sm">
                    Ti ho inviato una conferma via email. Ti contatterò entro 24 ore lavorative per organizzare le sessioni.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card flex flex-col gap-5">

                {/* Dati personali */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Dati personali</h3>
                  <div className="flex flex-col gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Nome e Cognome *</label>
                        <input type="text" name="name" required value={form.name} onChange={handleChange}
                          placeholder="Mario Rossi"
                          className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Email *</label>
                        <input type="email" name="email" required value={form.email} onChange={handleChange}
                          placeholder="mario@example.com"
                          className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Telefono *</label>
                      <input type="tel" name="phone" required value={form.phone} onChange={handleChange}
                        placeholder="+39 333 000 0000"
                        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                    </div>
                  </div>
                </div>

                {/* Dati aziendali */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setIsCompany(!isCompany)}
                      className={`w-11 h-6 rounded-full transition-colors duration-200 relative ${isCompany ? "bg-brand-500" : "bg-dark-500"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isCompany ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-gray-300 text-sm">Sono un&apos;azienda / ho P.IVA</span>
                  </div>
                  {isCompany && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Ragione Sociale</label>
                        <input type="text" name="company" value={form.company} onChange={handleChange}
                          placeholder="Pizzeria Mario S.r.l."
                          className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Partita IVA</label>
                        <input type="text" name="piva" value={form.piva} onChange={handleChange}
                          placeholder="IT 12345678901"
                          className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Pacchetti */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Pacchetti</h3>
                  <div>
                    <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Numero di pacchetti *</label>
                    <select name="packages" value={form.packages} onChange={handleChange}
                      className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm appearance-none cursor-pointer">
                      <option value="1" className="bg-dark-700">1 pacchetto — €199</option>
                      <option value="2" className="bg-dark-700">2 pacchetti — €358 (sconto 10%)</option>
                      <option value="3" className="bg-dark-700">3 pacchetti — €537 (sconto 10%)</option>
                      <option value="4" className="bg-dark-700">4 pacchetti — €716 (sconto 10%)</option>
                      <option value="5" className="bg-dark-700">5 pacchetti — €895 (sconto 10%)</option>
                    </select>
                    {/* Riepilogo prezzo */}
                    <div className="mt-3 bg-dark-700 border border-brand-500/20 rounded-xl px-4 py-3 flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{numPackages} pacchett{numPackages === 1 ? "o" : "i"} × 1 sessione tecnica da 90 minuti</span>
                      <span className="text-brand-300 font-bold text-lg">€{totalPrice}</span>
                    </div>
                    {numPackages >= 2 && (
                      <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                        <CheckCircle size={12} /> Sconto del 10% applicato — risparmi €{(20 * numPackages)} rispetto al prezzo pieno
                      </p>
                    )}
                  </div>
                </div>

                {/* Argomento */}
                <div>
                  <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Cosa vuoi studiare</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Argomento da studiare *</label>
                      <textarea name="topic" required rows={3} value={form.topic} onChange={handleChange}
                        placeholder="Es: voglio migliorare la mia fermentazione con biga, capire la gestione delle temperature e ottenere un cornicione più sviluppato..."
                        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs uppercase tracking-wide mb-2">Note aggiuntive</label>
                      <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                        placeholder="Livello di esperienza, attrezzatura disponibile, orari preferiti per le sessioni..."
                        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors text-sm resize-none" />
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <p className="text-gray-500 text-xs leading-relaxed">
                  I tuoi dati verranno utilizzati esclusivamente per contattarti riguardo alla consulenza richiesta e per tenerti aggiornato sulle nostre novità. Non verranno ceduti a terzi. Puoi richiedere la cancellazione in qualsiasi momento scrivendo a stefano@consulenzapizzaiolo.it.
                </p>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button type="submit" disabled={loading}
                  className="btn-primary self-start disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
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
        </section>

      </main>
      <Footer />
    </>
  );
}
