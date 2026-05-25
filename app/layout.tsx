import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import WhatsAppButton from "@/components/WhatsAppButton";

const siteUrl = "https://www.consulenzapizzaiolo.it";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Consulenza Pizzaiolo | Stefano Porro",
    template: "%s | Consulenza Pizzaiolo",
  },
  description:
    "Stefano Porro, consulente specializzato per pizzaioli, molini e startup nel settore della panificazione artigianale. Ricette professionali gratuite, formazione e supporto per aprire la tua pizzeria.",
  keywords: [
    "consulenza pizzaiolo",
    "consulente pizzeria",
    "aprire pizzeria",
    "consulenza panificazione",
    "formazione pizzaiolo",
    "molino consulenza",
    "startup pizzeria",
    "ricette pizza professionali",
    "pizza tonda romana",
    "pizza napoletana",
    "panificazione artigianale",
    "Stefano Porro",
    "SPMAB",
  ],
  authors: [{ name: "Stefano Porro", url: siteUrl }],
  creator: "Stefano Porro",
  publisher: "Consulenza Pizzaiolo",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Consulenza Pizzaiolo | Stefano Porro",
    description:
      "Consulenza specializzata per pizzaioli, molini e startup. Trasforma la tua passione in un'impresa di successo. Ricette professionali gratuite.",
    url: siteUrl,
    siteName: "Consulenza Pizzaiolo — Stefano Porro",
    type: "website",
    locale: "it_IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Consulenza Pizzaiolo | Stefano Porro",
    description:
      "Consulenza specializzata per pizzaioli, molini e startup nel settore della panificazione artigianale.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Consulenza Pizzaiolo — Stefano Porro",
  description:
    "Consulenza professionale per pizzaioli, molini e startup nel settore della panificazione e ristorazione artigianale.",
  url: siteUrl,
  founder: {
    "@type": "Person",
    name: "Stefano Porro",
    jobTitle: "Consulente Specializzato Pizzeria e Panificazione",
  },
  areaServed: {
    "@type": "Country",
    name: "Italia",
  },
  serviceType: [
    "Consulenza Pizzeria",
    "Formazione Pizzaiolo",
    "Consulenza Molini",
    "Startup Ristorazione",
    "Panificazione Artigianale",
  ],
  telephone: "+393933602014",
  email: "stefano@consulenzapizzaiolo.it",
  priceRange: "€€",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Servizi di Consulenza",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Consulenza per Pizzaioli",
          description: "Supporto tecnico e strategico per pizzaioli professionisti",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Consulenza per Molini",
          description: "Analisi e ottimizzazione per mulini e produttori di farine",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Startup Pizzeria",
          description: "Supporto completo per aprire una pizzeria o panetteria",
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="noise">
      <body>
        {children}
        <WhatsAppButton />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
