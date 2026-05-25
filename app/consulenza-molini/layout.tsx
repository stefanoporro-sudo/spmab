import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consulenza per Molini | Farine per Pizza — Stefano Porro",
  description:
    "Consulenza specializzata per molini: sviluppo farine bilanciate per pizza napoletana, romana e in teglia. Supporto alla distribuzione e demo presso rivenditori. Tutti i molini con cui ho collaborato hanno migliorato il loro mercato pizza.",
  keywords: [
    "consulenza molini",
    "farine per pizza",
    "consulente farine",
    "farina pizza napoletana",
    "farina pizza romana",
    "farina pizza in teglia",
    "distribuzione farine",
    "molino consulenza",
    "sviluppo farine professionali",
    "mercato pizza farine",
    "demo farine pizzerie",
    "grano italiano pizza",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/consulenza-molini",
  },
  openGraph: {
    title: "Consulenza per Molini — Stefano Porro",
    description:
      "Sviluppo farine bilanciate per pizza e supporto alla distribuzione nel mercato italiano. Tutti i molini con cui ho collaborato hanno migliorato le loro vendite.",
    url: "https://www.consulenzapizzaiolo.it/consulenza-molini",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
