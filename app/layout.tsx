import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPMAB | Consulenza Professionale per Panificazione e Ristorazione",
  description:
    "Stefano Porro - SPMAB offre consulenza specializzata per Pizzaioli, Molini e Startup nel settore della panificazione e ristorazione artigianale. Trasforma la tua idea in un'impresa di successo.",
  keywords:
    "consulenza pizzeria, molino, panetteria, startup ristorazione, pizzaiolo professionista, SPMAB, Stefano Porro",
  authors: [{ name: "Stefano Porro" }],
  openGraph: {
    title: "SPMAB | Consulenza Professionale per Panificazione e Ristorazione",
    description:
      "Trasforma la tua passione in un'impresa. Consulenza specializzata per pizzaioli, molini e startup nel food artisan.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="noise">
      <body>{children}</body>
    </html>
  );
}
