import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulenza Pizzeria | La tua pizzeria non rende come dovrebbe — Stefano Porro",
  description:
    "La tua pizzeria è aperta ma i risultati non arrivano: tanto lavoro, margini bassi, nessuno a cui chiedere. Consulenza per pizzerie già avviate. Prima consulenza gratuita.",
  keywords: [
    "consulenza pizzeria",
    "consulenza gestione pizzeria",
    "migliorare fatturato pizzeria",
    "consulente pizzeria",
    "pizzeria in difficoltà",
    "riorganizzare pizzeria",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/consulenza-pizzeria",
  },
  openGraph: {
    title: "Consulenza Pizzeria — Stefano Porro",
    description:
      "La tua pizzeria è aperta ma non rende come dovrebbe? Analizzo cosa non funziona e costruiamo insieme un piano concreto. Prima consulenza gratuita.",
    url: "https://www.consulenzapizzaiolo.it/consulenza-pizzeria",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
