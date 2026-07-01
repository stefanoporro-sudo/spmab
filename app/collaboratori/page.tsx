"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, ChefHat } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Collaborator = {
  id: string;
  name: string;
  slug: string;
  bio: string;
  photo_url: string;
  specialty: string;
  city: string;
};

export default function CollaboratoriPage() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collaborators")
      .then((r) => r.json())
      .then((d) => setCollaborators(d.collaborators ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24">
        <div className="max-w-6xl mx-auto px-6 py-16">

          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-300 text-sm transition-colors">
              <ArrowLeft size={14} /> Torna al sito
            </Link>
          </div>

          <div className="text-center mb-14">
            <p className="section-subtitle mb-4">La squadra</p>
            <h1 className="font-display text-5xl font-bold text-white mb-4">
              I Nostri <span className="gradient-text">Collaboratori</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Professionisti della pizza con cui condividiamo valori, passione e approccio al lavoro.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              Sezione in arrivo. Torna presto!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborators.map((c) => (
                <Link key={c.id} href={`/collaboratori/${c.slug}`}
                  className="card group flex flex-col gap-0 overflow-hidden p-0 hover:border-brand-500/40 transition-all duration-300">

                  {/* Foto */}
                  {c.photo_url ? (
                    <div className="w-full h-52 overflow-hidden">
                      <img
                        src={c.photo_url}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-52 bg-dark-700 flex items-center justify-center">
                      <ChefHat className="text-brand-400/30 w-14 h-14" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div>
                      <h2 className="text-white font-semibold text-lg leading-snug mb-1">{c.name}</h2>
                      {c.specialty && (
                        <span className="text-xs bg-brand-500/15 text-brand-300 px-2 py-0.5 rounded-full">
                          {c.specialty}
                        </span>
                      )}
                    </div>

                    {c.bio && (
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{c.bio}</p>
                    )}

                    {c.city && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-auto">
                        <MapPin size={12} />
                        {c.city}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
