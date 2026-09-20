"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "~/lib/utils";

const TOTAL_STEPS = 5;

type CycleFinderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Answers = {
  who: string | null;         // Q1
  height: string | null;      // Q2
  terrain: string | null;     // Q3
  gears: string | null;       // Q4
  budget: string | null;      // Q5
};

export function CycleFinderModal({ isOpen, onClose }: CycleFinderModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    who: null,
    height: null,
    terrain: null,
    gears: null,
    budget: null,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  // Push filter params to URL so the background grid updates in real-time
  const pushFilters = useCallback(
    (updated: Partial<Answers>) => {
      const merged = { ...answers, ...updated };
      const params = new URLSearchParams(searchParams.toString());

      // Clear old cycle-finder params
      params.delete("targetDemographic");
      params.delete("gender");
      params.delete("category");
      params.delete("gears");
      params.delete("heightInches");
      params.delete("minPrice");
      params.delete("maxPrice");
      params.set("page", "1");

      // Q1: Who
      if (merged.who === "kiddo") {
        params.set("targetDemographic", "Kids");
      } else if (merged.who === "myself_m") {
        params.set("targetDemographic", "Adults");
        params.set("gender", "Male");
      } else if (merged.who === "myself_f") {
        params.set("targetDemographic", "Adults");
        params.set("gender", "Female");
      } else if (merged.who === "anyone") {
        params.set("targetDemographic", "Adults");
      }

      // Q2: Height
      if (merged.height) {
        params.set("heightRange", merged.height);
      }

      // Q3: Terrain
      if (merged.terrain === "dirt") params.set("category", "Mountain (MTB)");
      else if (merged.terrain === "city") params.set("category", "Mountain (MTB)");
      else if (merged.terrain === "mix") params.set("category", "Hybrid");
      else if (merged.terrain === "fast") params.set("category", "Mountain(MTB)");

      // Q4: Gears
      if (merged.gears === "simple") params.set("gears", "1");
      else if (merged.gears === "few") params.set("gears", "7");
      else if (merged.gears === "all") params.set("gears", "21");
      else if (merged.gears === "electric") {
        params.set("category", "Hybrid"); // Override terrain to Hybrid
      }

      // Q5: Budget
      if (merged.budget === "under500") {
        params.set("maxPrice", "5000");
      } else if (merged.budget === "5000to10000") {
        params.set("minPrice", "5000");
        params.set("maxPrice", "10000");
      } else if (merged.budget === "10000to20000") {
        params.set("minPrice", "10000");
        params.set("maxPrice", "20000");
      } else if (merged.budget === "over20000") {
        params.set("minPrice", "20000");
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [answers, searchParams, router, pathname]
  );

  const selectAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    pushFilters({ [key]: value });
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else handleClose();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const optionBtn = (isSelected: boolean) =>
    cn(
      "relative w-full py-4 px-5 rounded-xl border-2 text-left font-medium transition-all duration-150 active:scale-[0.98]",
      isSelected
        ? "border-[#008FEF] bg-[#008FEF]/5 text-[#008FEF] shadow-[0_4px_0_0_#008FEF]"
        : "border-black/20 bg-white hover:border-black/40 text-black"
    );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999999] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm md:pt-20"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full md:max-w-lg bg-white text-black rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90dvh] md:max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Road Line */}
            <div className="relative h-40 bg-muted/30 border-b overflow-hidden">
              {/* Road */}
              <div className="absolute bottom-6 left-0 right-0 h-[4px] bg-black/80 mx-6 rounded-full" />
              {/* Bike travelling along the road */}
              <motion.div
                className="absolute bottom-2 w-32 h-32"
                animate={{ left: `calc(${progress}% - 96px)` }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                style={{ marginLeft: "1.5rem", marginRight: "1.5rem" }}
              >
                <Image
                  src="/cycle2.svg"
                  alt="Progress"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </motion.div>
              {/* Step indicator */}
              <div className="absolute top-4 right-6 text-sm font-bold text-muted-foreground tracking-widest bg-white/80 px-2 py-1 rounded-md shadow-sm">
                {step + 1} / {TOTAL_STEPS}
              </div>
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 left-6 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Questions */}
            <div className="p-6 md:p-8 overflow-y-auto h-[440px] mt-2" style={{ maxHeight: "calc(85vh - 14rem)" }}>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="q1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">Who is riding?</h3>
                    <p className="text-sm text-black/60">Select the intended rider so we can find the right fit.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "kiddo", label: "My Child", desc: "For children and young riders" },
                        { value: "myself_m", label: "Myself (Male)", desc: "Adult male rider" },
                        { value: "myself_f", label: "Myself (Female)", desc: "Adult female rider" },
                        { value: "anyone", label: "Someone Else", desc: "For a gift or general browsing" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("who", opt.value); handleNext(); }}
                          className={optionBtn(answers.who === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="q2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">How tall is the rider?</h3>
                    <p className="text-sm text-black/60">Select the height range for accurate frame sizing.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "48-60", label: "4'0\" to 5'0\"", desc: "Great for teens and smaller adults" },
                        { value: "60-66", label: "5'0\" to 5'6\"", desc: "Average height for many riders" },
                        { value: "66-72", label: "5'6\" to 6'0\"", desc: "Most standard adult sizes" },
                        { value: "72-100", label: "6'0\" and above", desc: "For taller riders" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("height", opt.value); handleNext(); }}
                          className={optionBtn(answers.height === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="q3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">Where will you ride?</h3>
                    <p className="text-sm text-black/60">Select the primary terrain for your rides.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "dirt", label: "Dirt & Trails", desc: "Mountain biking and off-road" },
                        { value: "city", label: "City Streets", desc: "Commuting and urban rides" },
                        { value: "mix", label: "Mixed Terrain", desc: "Roads, paths, and light trails" },
                        { value: "fast", label: "Paved Roads", desc: "Road cycling and high speed" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("terrain", opt.value); handleNext(); }}
                          className={optionBtn(answers.terrain === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="q4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">How many gears do you need?</h3>
                    <p className="text-sm text-black/60">More gears provide versatility on steep hills.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "simple", label: "Single Speed", desc: "Keep it simple and easy to maintain" },
                        { value: "few", label: "7 Speeds", desc: "A few options, great for city riding" },
                        { value: "all", label: "21+ Speeds", desc: "Maximum options for steep climbs" },
                        { value: "electric", label: "Electric Assist", desc: "E-bike with motorized boost" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("gears", opt.value); handleNext(); }}
                          className={optionBtn(answers.gears === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="q5"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">What is your budget?</h3>
                    <p className="text-sm text-black/60">We will find the best value within your range.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "under500", label: "Under ₹5000", desc: "Great entry-level options" },
                        { value: "500to1000", label: "₹5,000 – ₹10,000", desc: "Mid-range quality" },
                        { value: "1000to2000", label: "₹10,000 – ₹20,000", desc: "Premium performance" },
                        { value: "over2000", label: "₹20,000+", desc: "Top-tier builds" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { selectAnswer("budget", opt.value); }}
                          className={optionBtn(answers.budget === opt.value)}
                        >
                          <div className="text-base font-bold text-left w-full">{opt.label}</div>
                          <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="btn-cred gap-1 h-10 px-4 bg-white text-black shrink-0 disabled:opacity-50 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="btn-cred gap-1 h-10 px-4 bg-white text-black shrink-0"
              >
                {step === TOTAL_STEPS - 1 ? "See Results" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
