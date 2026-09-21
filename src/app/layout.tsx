import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";



export const metadata: Metadata = {
  metadataBase: new URL("https://bmdavey.in"),
  title: "B. M. Davey & Co. | Premium Bicycles in Chennai",
  description: "A trusted name for over 90 years. B. M. Davey & Co. is a premium bicycle store based in Chennai. Discover our wide range of bicycles, book online, and visit our showroom.",
  keywords: ["Bicycles in Chennai", "Cycle Shop Chennai", "B M Davey", "Premium Bikes", "Kids Cycles", "Adult Cycles"],
  icons: [{ rel: "icon", url: "/logo.png" }],
  openGraph: {
    title: "B. M. Davey & Co. | Premium Bicycles in Chennai",
    description: "A trusted name for over 90 years. B. M. Davey & Co. is a premium bicycle store based in Chennai.",
    type: "website",
    locale: "en_IN",
    siteName: "B. M. Davey & Co.",
  },
};

const font = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${font.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

