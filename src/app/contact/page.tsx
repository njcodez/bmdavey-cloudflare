import Link from "next/link";
import { ChevronLeft, Mail, Phone, MapPin } from "lucide-react";
import { Header } from "~/components/store/Header";
import { Footer } from "~/components/store/Footer";

export default function ContactPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col relative">
      <Header />

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 max-w-3xl flex-grow">
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
      <Footer />
    </main>
  );
}
