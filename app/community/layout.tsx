import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Domande e Discussioni — Consulenza Pizzaiolo",
  description: "Fai domande, condividi esperienze e confrontati con altri pizzaioli. La community di Stefano Porro risponde.",
  alternates: { canonical: "https://www.consulenzapizzaiolo.it/community" },
  openGraph: {
    title: "Community — Consulenza Pizzaiolo",
    description: "Fai domande e confrontati con altri pizzaioli.",
    url: "https://www.consulenzapizzaiolo.it/community",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
