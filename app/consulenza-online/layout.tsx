import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulenza On Line per Pizzaioli | Sessioni Live con Stefano Porro",
  description:
    "Consulenza professionale online per pizzaioli e pizzerie. Sessione tecnica da 90 minuti a 199€. Attestato di merito incluso. Sconto 10% su più pacchetti.",
  keywords: [
    "consulenza online pizzaiolo",
    "corso online pizzaiolo",
    "formazione online pizza",
    "consulenza pizzeria online",
    "attestato pizzaiolo",
    "imparare a fare la pizza online",
    "migliorare pizza da casa",
    "Stefano Porro consulenza",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/consulenza-online",
  },
  openGraph: {
    title: "Consulenza On Line — Stefano Porro",
    description:
      "Sessioni di consulenza live online per pizzaioli. Sessione tecnica da 90 minuti a 199€, attestato di merito incluso. Sconto 10% su più pacchetti.",
    url: "https://www.consulenzapizzaiolo.it/consulenza-online",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
