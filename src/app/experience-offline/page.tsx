import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Experience Offline | B M Davey & Co",
  description: "Why visiting our store is the best way to buy a bicycle.",
};

export default function ExperienceOfflinePage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 md:py-24 space-y-12">
      <div className="space-y-4 text-center max-w-2xl mx-auto flex flex-col items-center">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to store
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-blue-600">
          Some things are meant to be felt before buying.
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mt-4">
          At B M Davey & Co, we&apos;ve believed for over 90 years that buying a bicycle is a deeply personal experience. Here is why visiting our Chennai showroom offline ensures you get the perfect ride.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Test Ride Your Dream Bike</h3>
              <p className="text-muted-foreground mt-1">Feel the geometry, test the brakes, and ensure the size is an absolute perfect match for your height and riding style.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Expert Assembly & Tuning</h3>
              <p className="text-muted-foreground mt-1">Bikes shipped online often require self-assembly. When you buy from us, our expert mechanics tune the gears and align the brakes perfectly before you leave the store.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Personalized Fitting</h3>
              <p className="text-muted-foreground mt-1">Our experienced staff will adjust the saddle height, handlebars, and controls tailored specifically to your body proportions.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg">Instant Support & Warranty</h3>
              <p className="text-muted-foreground mt-1">No need to ship parts back and forth. If you have an issue, just walk in and we take care of it immediately.</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-8 rounded-2xl border flex flex-col justify-center items-center text-center space-y-6">
          <h3 className="text-2xl font-bold">Ready to drop by?</h3>
          <p className="text-muted-foreground">
            Lock in your online price by reserving it, then come visit our showroom to experience it firsthand.
          </p>
          <div className="w-full space-y-3 pt-4 flex flex-col">
            <Link href="/about" className="w-full">
              <Button size="lg" className="w-full h-12 text-md">
                Get Directions to Store
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" size="lg" className="w-full h-12 text-md">
                Browse Bicycles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
