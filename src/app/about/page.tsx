import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Header } from "~/components/store/Header";
import { Footer } from "~/components/store/Footer";

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-background flex flex-col relative overflow-hidden">
      <Header />

      <div className="container mx-auto px-4 md:px-6 pt-32 pb-24 max-w-4xl flex-grow relative z-10">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-12 text-center md:text-left">
          About Us: <span className="text-primary drop-shadow-sm">B.M. Davey & Co.</span>
        </h1>
        
        <div className="prose prose-lg text-muted-foreground max-w-none clear-both">
          
          <figure className="w-full md:w-5/12 md:float-right md:ml-8 mb-8 md:mb-6 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(var(--primary-rgb,0,143,239),0.4)] border-2 border-primary/30 hover:scale-[1.02] transition-transform duration-500 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/about_us_2010.jpeg" 
              alt="B.M. Davey & Co. in 2010" 
              className="w-full aspect-square object-cover"
            />
            <figcaption className="p-3 text-center text-sm font-medium bg-background/80 backdrop-blur-sm border-t border-primary/20 text-foreground">
              B.M. Davey & Co. - (2010)
            </figcaption>
          </figure>

          <h2 className="text-2xl font-bold text-foreground">Fueling Chennai’s Passion for Cycling Since 1932</h2>
          <p>
            Nestled in the vibrant heart of Broadway on Prakasam Street, B.M. Davey & Co. is more than just a bicycle shop—it is a storied Chennai institution. For over 90 years, we have proudly stood the test of time, watching generations of children, fitness enthusiasts, and daily commuters discover the simple, enduring joy of riding a bicycle.
          </p>
          
          <h3 className="text-xl font-bold text-foreground mt-8">Our Story: Four Generations in Motion</h3>
          <p>
            Our journey began in 1932 when Bhogilal Motilal Davey made a bold transition from the ghee trade to a highly successful bicycle business, recognizing that bicycles were becoming the heartbeat of Indian transportation. By 1935, we were officially in the bicycle industry, beginning by importing parts from England and soon expanding into wholesale, retail, and exports as local manufacturing took root in India.
          </p>
          <p>
            Today, as a fourth-generation family business, we have witnessed the complete evolution of the cycling world. Yet, as we look to the future, the nostalgic charm of our bustling Broadway shop remains exactly as it was decades ago.
          </p>
          
          <figure className="w-full md:w-5/12 md:float-left md:mr-8 mb-8 md:mb-6 md:mt-4 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(var(--primary-rgb,0,143,239),0.4)] border-2 border-primary/30 hover:scale-[1.02] transition-transform duration-500 bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/about_us_2026.jpeg" 
              alt="B.M. Davey & Co. today" 
              className="w-full aspect-[4/3] md:aspect-square object-cover"
            />
            <figcaption className="p-3 text-center text-sm font-medium bg-background/80 backdrop-blur-sm border-t border-primary/20 text-foreground">
              B.M. Davey & Co. - Four generations later (2026)
            </figcaption>
          </figure>

          <h3 className="text-xl font-bold text-foreground mt-8 md:mt-12">Honest Advice & Unmatched Expertise</h3>
          <p>
            In today’s era of ruthless online competition and the endless search for the lowest price, we believe in a different approach: value, expertise, and the right fit.
          </p>
          <p>
            We don&apos;t stop at the sale. When you walk into B.M. Davey & Co., you aren&apos;t just buying a bicycle; you are tapping into decades of institutional knowledge. Several members of our dedicated team have been with us for over 35 years. Whether you are looking for a classic BSA or Hero, a modern e-bike, or hard-to-find vintage parts, we provide insightful recommendations tailored to your specific needs.
          </p>
          <p>
            Our commitment to honest guidance is the reason a seemingly ordinary tourist—who turned out to be the US Consul General—once walked out of our store with a fully fulfilled parts list for his vintage bicycle and all his technical questions answered, sending us a letter of gratitude the very next day.
          </p>

          <h3 className="text-xl font-bold text-foreground mt-8">Driving the Future of Cycling</h3>
          <p>
            We believe the cycle industry will always survive because we all grew up riding them, and we want to share that passion with future generations. Beyond health and hobbies, we actively advocate for cycling as a sustainable solution to heavy traffic and pollution. We envision a future where cyclists are given equal respect on the roads, making bicycles a premier choice for daily travel.
          </p>
          <p>
            For 88 years and counting, we have cherished the families who return to us, bringing their children and grandchildren to experience the same magic they did. We invite you to visit us on Broadway, step back in time, and let us help you find the perfect ride for the road ahead.
          </p>
        </div>
      </div>
      
      {/* Decorative background blur */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <Footer />
    </main>
  );
}
