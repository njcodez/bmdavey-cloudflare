import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
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
            <Link href="/about" className="text-white/60 hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="/contact" className="text-white hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <h1 className="text-4xl font-black tracking-tight mb-6">Contact Us</h1>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Email</p>
              <a href="mailto:info@bmdavey.com" className="text-primary hover:underline">
                info@bmdavey.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Phone</p>

              <a href="tel:+919884945605" className="text-primary hover:underline">
                +91 98849 45605
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-semibold">Address</p>
              <p className="text-muted-foreground mb-1">B. M. Davey & Co., Chennai</p>
              <a
                href="https://maps.app.goo.gl/CVaqP6zX9bvQ8rq4A"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium hover:underline flex items-center gap-1"
              >
                View on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
