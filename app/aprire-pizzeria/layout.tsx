import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aprire una Pizzeria | Da dove iniziare — Stefano Porro",
  description:
    "Vuoi aprire una pizzeria ma non sai da dove partire? Ti accompagno nelle decisioni che contano davvero, prima che tu investa i tuoi risparmi. Analisi iniziale della tua attività.",
  keywords: [
    "aprire pizzeria",
    "come aprire una pizzeria",
    "consulenza apertura pizzeria",
    "business plan pizzeria",
    "aprire pizzeria da zero",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/aprire-pizzeria",
  },
  openGraph: {
    title: "Aprire una Pizzeria — Stefano Porro",
    description:
      "Troppe decisioni, nessuna guida, rischio di sbagliare investimento. Ti aiuto a costruire le basi giuste prima di aprire. Analisi iniziale della tua attività.",
    url: "https://www.consulenzapizzaiolo.it/aprire-pizzeria",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
