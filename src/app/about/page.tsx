import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "~/components/store/Header";
import { Footer } from "~/components/store/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col relative">
      <Header />

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 max-w-3xl flex-grow">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <h1 className="text-4xl font-black tracking-tight mb-6">About Us</h1>
        <div className="prose prose-lg text-muted-foreground space-y-4">
          <p>
            We are passionate about connecting riders with their perfect bicycles.
            Our price reservation system lets you lock in the best deals without any upfront commitment.
          </p>
          <p>
            Browse our curated collection, find the bike that speaks to you, and reserve your price
            for 48 hours — completely free, no strings attached.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
