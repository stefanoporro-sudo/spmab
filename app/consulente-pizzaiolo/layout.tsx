import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulente Pizzaiolo | Diagnosi del tuo prodotto — Stefano Porro",
  description:
    "La tua pizza non è sempre uguale e i clienti se ne accorgono? Una diagnosi tecnica esterna per capire esattamente cosa non va nel prodotto. Prima consulenza gratuita.",
  keywords: [
    "consulente pizzaiolo",
    "diagnosi impasto pizza",
    "prodotto pizza incostante",
    "consulente tecnico pizzeria",
    "valutazione prodotto pizzeria",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/consulente-pizzaiolo",
  },
  openGraph: {
    title: "Consulente Pizzaiolo — Stefano Porro",
    description:
      "Un occhio esterno esperto per capire perché il tuo prodotto non è costante. Diagnosi tecnica concreta, non teoria. Prima consulenza gratuita.",
    url: "https://www.consulenzapizzaiolo.it/consulente-pizzaiolo",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
