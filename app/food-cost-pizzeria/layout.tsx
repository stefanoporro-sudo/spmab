import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Cost Pizzeria | Quanto costa davvero la tua pizza — Stefano Porro",
  description:
    "Sai quanto costa davvero produrre una pizza? Calcolo il food cost reale del tuo menù e ti aiuto ad allineare i prezzi ai margini. Prima consulenza gratuita.",
  keywords: [
    "food cost pizzeria",
    "calcolo food cost pizza",
    "margini pizzeria",
    "prezzo pizza menù",
    "costi materie prime pizzeria",
  ],
  alternates: {
    canonical: "https://www.consulenzapizzaiolo.it/food-cost-pizzeria",
  },
  openGraph: {
    title: "Food Cost Pizzeria — Stefano Porro",
    description:
      "Il menù è pieno, i tavoli girano, ma il margine non si vede. Calcolo il costo reale di ogni pizza e ti aiuto a sistemare i prezzi. Prima consulenza gratuita.",
    url: "https://www.consulenzapizzaiolo.it/food-cost-pizzeria",
    type: "website",
    locale: "it_IT",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
