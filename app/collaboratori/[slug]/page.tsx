"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, MapPin, ChefHat, Download } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Recipe = {
  id: string; title: string; category: string; description: string;
  level: string; file_url: string; image_url: string;
};
type Collaborator = {
  id: string; name: string; slug: string; bio: string;
  photo_url: string; specialty: string; city: string;
  recipes: Recipe[];
};

const levelColor: Record<string, string> = {
  Base: "bg-green-500/15 text-green-300",
  Intermedio: "bg-yellow-500/15 text-yellow-300",
  Avanzato: "bg-red-500/15 text-red-300",
};

export default function CollaboratoreProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/collaborators/${slug}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setCollaborator(d.collaborator); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
      </main>
      <Footer />
    </>
  );

  if (notFound || !collaborator) return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400 text-lg">Collaboratore non trovato.</p>
        <Link href="/collaboratori" className="text-brand-400 hover:text-brand-300 transition-colors text-sm flex items-center gap-1">
          <ArrowLeft size={14} /> Torna ai collaboratori
        </Link>
      </main>
      <Footer />
    </>
  );

  const recipes = collaborator.recipes ?? [];

  return (
    <>
      <Header />
      <main className="bg-dark-900 min-h-screen pt-24">
        <div className="max-w-4xl mx-auto px-6 py-12">

          <Link href="/collaboratori" className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-300 text-sm transition-colors mb-8">
            <ArrowLeft size={14} /> Collaboratori
          </Link>

          {/* Profilo */}
          <div className="card mb-10 flex flex-col sm:flex-row gap-6 items-start">
            {collaborator.photo_url ? (
              <img
                src={collaborator.photo_url}
                alt={collaborator.name}
                className="w-32 h-32 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                <ChefHat className="text-brand-400/40 w-10 h-10" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-white mb-2">{collaborator.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {collaborator.specialty && (
                  <span className="text-xs bg-brand-500/15 text-brand-300 px-3 py-1 rounded-full font-medium">
                    {collaborator.specialty}
                  </span>
                )}
                {collaborator.city && (
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <MapPin size={12} /> {collaborator.city}
                  </span>
                )}
              </div>
              {collaborator.bio && (
                <p className="text-gray-300 leading-relaxed">{collaborator.bio}</p>
              )}
            </div>
          </div>

          {/* Ricette */}
          {recipes.length > 0 && (
            <>
              <h2 className="font-display text-2xl font-bold text-white mb-6">
                Le ricette di <span className="gradient-text">{collaborator.name.split(" ")[0]}</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {recipes.map((r) => (
                  <div key={r.id} className="card flex flex-col gap-0 overflow-hidden p-0">
                    {r.image_url ? (
                      <div className="w-full h-40 overflow-hidden">
                        <img src={r.image_url} alt={r.title} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-40 bg-dark-700 flex items-center justify-center">
                        <ChefHat className="text-brand-400/30 w-10 h-10" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-brand-500/15 text-brand-300 px-2 py-0.5 rounded-full">{r.category}</span>
                        {r.level && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${levelColor[r.level] ?? "bg-gray-500/15 text-gray-300"}`}>{r.level}</span>
                        )}
                      </div>
                      <h3 className="text-white font-semibold text-base leading-snug">{r.title}</h3>
                      {r.description && <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{r.description}</p>}
                      {r.file_url ? (
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer" download
                          className="mt-auto inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-all duration-300 hover:scale-105 self-start">
                          <Download size={14} /> Scarica PDF
                        </a>
                      ) : (
                        <span className="mt-auto inline-flex items-center gap-2 bg-dark-700 text-gray-500 px-4 py-2.5 rounded-full text-sm self-start">PDF in arrivo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
