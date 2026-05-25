import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulenza per Pizzaioli | Migliora il tuo prodotto — Stefano Porro",
  description:
    "Consulenza personalizzata per pizzaioli dipendenti e titolari. Miglioro il tuo impasto, studio le tue criticità e ti aiuto a trasformare la passione in successo. Prima consulenza gratuita.",
  keywords: [
    "consulenza pizzaiolo",
    "consulente pizzaiolo",
    "migliorare impasto pizza",
    "formazione pizzaiolo",
    "corso pizzaiolo professionale",
    "consulenza pizzeria",
    "aprire pizzeria",
    "tecnica impasto pizza",
    "pizza napoletana consulenza",
    "pizza romana consulenza",
    "pizzaiolo dipendente titolare",
    "migliorare pizzeria",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/consulenza-pizzaioli",
  },
  openGraph: {
    title: "Consulenza per Pizzaioli — Stefano Porro",
    description:
      "Miglioro il tuo prodotto e studio le tue criticità. Tutti i pizzaioli con cui ho lavorato hanno migliorato il loro prodotto. Prima consulenza gratuita.",
    url: "https://www.consulenzapizzaiolo.it/consulenza-pizzaioli",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
