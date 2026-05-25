import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Pizza, Panificazione e Consulenza",
  description:
    "Articoli professionali su pizza, panificazione artigianale, apertura pizzeria e consulenza. Consigli pratici di Stefano Porro, consulente SPMAB.",
  keywords: [
    "blog pizza",
    "articoli panificazione",
    "consigli pizzaiolo",
    "aprire pizzeria",
    "impasto pizza",
    "lievitazione naturale",
    "consulenza pizzeria",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/blog",
  },
  openGraph: {
    title: "Blog SPMAB — Pizza, Panificazione e Consulenza",
    description:
      "Articoli professionali su pizza e panificazione artigianale. Consigli pratici di Stefano Porro.",
    url: "https://www.consulenzapizzaiolo.it/blog",
    type: "website",
    locale: "it_IT",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
