import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";



export const metadata: Metadata = {
  metadataBase: new URL("https://bmdavey.in"),
  title: {
    default: "B. M. Davey & Co | Cycle Shop in Chennai | Buy Bicycles, Kids Cycles, MTB & Geared Bikes",
    template: "%s | B. M. Davey & Co. Chennai",
  },
  description: "Looking for the best cycle shop in Chennai? B. M. Davey & Co. is Chennai's trusted bicycle store since 1932 on Broadway, Prakasam Salai. Buy kids bicycles, adult geared cycles, MTBs, hybrid bikes, road bikes, and accessories at unbeatable prices. Reserve online & test ride in store!",
  keywords: [
    "cycle shop chennai",
    "bicycle shop chennai",
    "cycle store in chennai",
    "best cycle shop in chennai",
    "bicycles in chennai",
    "cycle shop broadway chennai",
    "kids cycle chennai",
    "buy cycle online chennai",
    "geared cycle chennai",
    "mtb cycle chennai",
    "hybrid cycles chennai",
    "bicycle price chennai",
    "B M Davey",
    "B.M. Davey & Co.",
    "cycle shop near me chennai",
    "cycle store parrys chennai",
    "Hercules cycles chennai",
    "BSA cycle showroom chennai",
    "Hero cycle dealers chennai"
  ],
  alternates: {
    canonical: "https://bmdavey.in",
  },
  icons: [{ rel: "icon", url: "/favico.ico" }],
  openGraph: {
    title: "Best Cycle Shop in Chennai | B. M. Davey & Co. (Since 1932)",
    description: "Explore Chennai's premier bicycle store. Browse 100+ kids, geared, MTB & hybrid bicycles online. Book your price for 48 hours & test ride at our Broadway showroom.",
    url: "https://bmdavey.in",
    siteName: "B. M. Davey & Co. - Cycle Shop Chennai",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Cycle Shop in Chennai | B. M. Davey & Co.",
    description: "Chennai's trusted bicycle store since 1932. Wide range of kids, adult, MTB, and geared cycles at best prices in Broadway Chennai.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const font = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["BicycleStore", "LocalBusiness"],
  "@id": "https://bmdavey.in/#store",
  name: "B. M. Davey & Co. - Cycle Shop Chennai",
  alternateName: ["B.M. Davey & Co.", "Davey Cycle Shop", "BM Davey Cycles"],
  url: "https://bmdavey.in",
  logo: "https://bmdavey.in/logo.png",
  image: "https://bmdavey.in/about_us_2026.jpeg",
  description: "B. M. Davey & Co. is a premier bicycle store in Chennai established in 1932. Offering kids cycles, mountain bikes (MTB), geared cycles, hybrid bikes, road bikes, and expert bicycle fitting and servicing on Broadway, Chennai.",
  telephone: "+919884945065",
  email: "info@bmdavey.in",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Broadway, Prakasam Salai",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    postalCode: "600108",
    addressCountry: "IN"
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "13.0898",
    longitude: "80.2858"
  },
  hasMap: "https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A",
  areaServed: {
    "@type": "City",
    name: "Chennai"
  },
  sameAs: [
    "https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A"
  ],
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, Credit Card, UPI, Net Banking",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "20:30"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${font.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

