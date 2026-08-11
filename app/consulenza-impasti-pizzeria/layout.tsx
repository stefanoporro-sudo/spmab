import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulenza Impasti Pizzeria | Stessa ricetta, risultato diverso — Stefano Porro",
  description:
    "Stessa ricetta, stessa procedura, ma il risultato cambia ogni volta? Analizzo il tuo impasto e trovo il punto esatto in cui perdi la costanza. Analisi iniziale della tua attività.",
  keywords: [
    "consulenza impasti pizzeria",
    "impasto pizza incostante",
    "consulenza impasto pizza",
    "fermentazione pizza problemi",
    "idratazione impasto pizza",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/consulenza-impasti-pizzeria",
  },
  openGraph: {
    title: "Consulenza Impasti Pizzeria — Stefano Porro",
    description:
      "Stessa ricetta, risultato diverso ogni volta? Trovo il punto esatto del tuo processo in cui si perde la costanza dell'impasto. Analisi iniziale della tua attività.",
    url: "https://www.consulenzapizzaiolo.it/consulenza-impasti-pizzeria",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
