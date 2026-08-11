import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formazione Personale Pizzeria | Meno dipendenza da una sola persona — Stefano Porro",
  description:
    "Se manchi tu, la qualità crolla? Formo il tuo staff perché il prodotto sia costante anche senza di te in cucina. Prima consulenza gratuita.",
  keywords: [
    "formazione personale pizzeria",
    "formazione staff pizzeria",
    "corso pizzaioli dipendenti",
    "formare personale cucina pizzeria",
    "formazione dipendenti pizzeria",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/formazione-personale-pizzeria",
  },
  openGraph: {
    title: "Formazione Personale Pizzeria — Stefano Porro",
    description:
      "Il locale dipende da una sola persona: se manca lui, la qualità crolla. Formo lo staff con un metodo replicabile da chiunque. Prima consulenza gratuita.",
    url: "https://www.consulenzapizzaiolo.it/formazione-personale-pizzeria",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
