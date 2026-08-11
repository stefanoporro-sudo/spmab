import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Chef Pizzaiolo per Eventi | Stefano Porro",
  description:
    "Porto la vera pizza artigianale a casa tua. Personal chef pizzaiolo per eventi privati, cene tra amici e feste — impasti artigianali, cottura live davanti agli ospiti. Fino a 25 persone.",
  keywords: [
    "personal chef pizzaiolo",
    "pizzaiolo a domicilio",
    "pizza a casa evento privato",
    "pizzaiolo per feste",
    "catering pizza artigianale",
    "pizzaiolo per cene private",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/eventi-personal-chef",
  },
  openGraph: {
    title: "Personal Chef Pizzaiolo per Eventi — Stefano Porro",
    description:
      "Impasti artigianali freschi, cottura live davanti agli ospiti. Il servizio Personal Chef Pizzaiolo per eventi privati, cene e feste — fino a 25 persone.",
    url: "https://www.consulenzapizzaiolo.it/eventi-personal-chef",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
