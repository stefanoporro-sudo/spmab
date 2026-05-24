import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ricette Professionali Gratuite",
  description:
    "Scarica gratuitamente ricette professionali per pizza e panificazione testate da Stefano Porro: Pizza Tonda Romana, Pizza Napoletana, Focaccia Genovese e molto altro.",
  keywords: [
    "ricette pizza professionali",
    "ricetta pizza tonda romana",
    "ricetta pizza napoletana",
    "ricetta focaccia genovese",
    "ricette pizzaiolo",
    "ricette panificazione",
    "schede tecniche pizza",
    "impasto pizza professionale",
    "download ricette pizza PDF",
  ],
  openGraph: {
    title: "Ricette Professionali Gratuite | SPMAB",
    description:
      "Scarica gratis le ricette professionali di Stefano Porro: Pizza Tonda Romana, Napoletana, Focaccia e altro ancora.",
    url: "https://www.consulenzapizzaiolo.it/ricette",
    type: "website",
  },
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/ricette",
  },
};

export default function RicetteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
