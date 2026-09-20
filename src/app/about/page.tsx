import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg rounded-b-3xl border-b border-white/5">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="BM Davey" width={120} height={40} className="h-9 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">
              Collection
            </Link>
            <Link href="/about" className="text-white hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-white/60 hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
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
    </main>
  );
}
