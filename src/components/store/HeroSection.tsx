"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useState, Suspense } from "react";
import { CycleFinderModal } from "./CycleFinderModal";

export function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const [isCycleFinderOpen, setIsCycleFinderOpen] = useState(false);

  return (
    <section className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-black text-white">
      {/* Animated Background - Pure CSS for scroll performance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-[#008FEF]/20" />
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full hero-blob-1"
          style={{ background: "radial-gradient(circle, rgba(0,143,239,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full hero-blob-2"
          style={{ background: "radial-gradient(circle, rgba(0,143,239,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col-reverse md:flex-row items-center justify-center md:justify-between gap-0 md:gap-12 max-w-7xl pt-28 md:pt-0">
        
        {/* Left Side: Text Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-1/2">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1]"
          >
            <span className="block">First <span className="text-[#008FEF]">Pedals</span>.</span>
            <span className="block">Daily <span className="text-[#008FEF]">Runs</span>.</span>
            <span className="block">Pro <span className="text-[#008FEF]">Trails</span>.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-3 md:mt-6 text-sm sm:text-xl text-white/65 max-w-xl leading-relaxed"
          >
            No matter the journey, we travel with you. Secure your price for 48 hours. Pay only when you&apos;re ready to ride.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-6 md:mt-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-4 md:mb-0"
          >
            <button
              onClick={scrollToProducts}
              className="btn-cred-white text-sm md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold bg-[#008FEF] text-black w-full sm:w-auto"
            >
              Browse Collection
            </button>
            <button
              onClick={() => setIsCycleFinderOpen(true)}
              className="btn-cred-white text-sm md:text-lg px-4 md:px-8 py-3 md:py-4 rounded-xl font-bold bg-black text-white w-full sm:w-auto"
            >
              Find My Bike
            </button>
          </motion.div>

          {/* Cycle Finder Modal */}
          <Suspense fallback={null}>
            <CycleFinderModal isOpen={isCycleFinderOpen} onClose={() => setIsCycleFinderOpen(false)} />
          </Suspense>
        </div>

        {/* Right Side: Cycle SVG Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="w-[70%] sm:w-[85%] md:w-1/2 flex justify-center md:justify-end mx-auto md:mx-0 relative -left-4 md:-left-8"
        >
          <div className="relative">
            {/* Glow behind the bike */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0,143,239,0.3) 0%, transparent 70%)",
                transform: "scale(1.5)",
              }}
            />
            <Image
              src="/cycle1.svg"
              alt="Premium Bicycle"
              width={600}
              height={400}
              className="relative max-w-full h-auto"
              priority
            />
          </div>
        </motion.div>

      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToProducts}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-white/50 hover:text-white/60 transition-colors cursor-pointer animate-bounce-slow"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </button>
      
      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        .hero-blob-1 {
          animation: blob1 8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .hero-blob-2 {
          animation: blob2 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes blob1 {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes blob2 {
          0%, 100% { transform: scale(1.1); opacity: 0.2; }
          50% { transform: scale(1); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
