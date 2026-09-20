"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "~/lib/utils";

type CycleFinderModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Answers = {
  who: string | null;         // Q1
  age: string | null;         // Q2
  terrain: string | null;     // Q3
  gears: string[];            // Q4
};

export function CycleFinderModal({ isOpen, onClose }: CycleFinderModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    who: null,
    age: null,
    terrain: null,
    gears: [],
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalSteps = answers.who === "kiddo" ? 2 : 4;
  const progress = ((step + 1) / totalSteps) * 100;

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
      params.delete("ageRange");
      params.set("page", "1");

      // Q1: Who
      if (merged.who === "kiddo") {
        params.set("targetDemographic", "Kids");
      } else if (merged.who === "myself_m") {
        params.set("targetDemographic", "Adults");
        params.append("gender", "Male");
        params.append("gender", "Unisex");
      } else if (merged.who === "myself_f") {
        params.set("targetDemographic", "Adults");
        params.append("gender", "Female");
        params.append("gender", "Unisex");
      } else if (merged.who === "anyone") {
        params.set("targetDemographic", "Adults");
      }

      // Q2: Age
      if (merged.age) {
        params.set("ageRange", merged.age);
      }

      // Q3: Terrain
      if (merged.terrain === "multi") params.set("category", "Mountain (MTB)");
      else if (merged.terrain === "paved") params.set("category", "Hybrid");

      // Q4: Gears (Multiple)
      if (merged.gears && merged.gears.length > 0) {
        merged.gears.forEach(g => {
          if (g === "simple") params.append("gears", "1");
          else if (g === "few") params.append("gears", "7");
          else if (g === "all") params.append("gears", "21");
        });
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

  const toggleGear = (value: string) => {
    const current = [...answers.gears];
    if (current.includes(value)) {
      selectAnswer("gears", current.filter((g) => g !== value));
    } else {
      selectAnswer("gears", [...current, value]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
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
            className="relative w-full md:max-w-lg bg-white text-black rounded-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[85dvh] md:max-h-[85vh] scale-[0.85] md:scale-100 origin-bottom md:origin-center mb-12 md:mb-0"
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
                {step + 1} / {totalSteps}
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
                    <h3 className="text-2xl font-bold">What is the rider&apos;s age?</h3>
                    <p className="text-sm text-black/60">Select the age range for accurate frame sizing.</p>
                    <div className="grid gap-4 mt-6">
                      {answers.who === "kiddo" ? (
                        <>
                          <button onClick={() => { selectAnswer("age", "2-5"); handleNext(); }} className={optionBtn(answers.age === "2-5")}>
                            <div className="text-base font-bold text-left w-full">2-5 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Perfect for toddlers</div>
                          </button>
                          <button onClick={() => { selectAnswer("age", "5-8"); handleNext(); }} className={optionBtn(answers.age === "5-8")}>
                            <div className="text-base font-bold text-left w-full">5-8 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Growing kids</div>
                          </button>
                          <button onClick={() => { selectAnswer("age", "8-12"); handleNext(); }} className={optionBtn(answers.age === "8-12")}>
                            <div className="text-base font-bold text-left w-full">8-12 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Pre-teens</div>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { selectAnswer("age", "13-17"); handleNext(); }} className={optionBtn(answers.age === "13-17")}>
                            <div className="text-base font-bold text-left w-full">13-17 years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Teenagers</div>
                          </button>
                          <button onClick={() => { selectAnswer("age", "18-20"); handleNext(); }} className={optionBtn(answers.age === "18-20")}>
                            <div className="text-base font-bold text-left w-full">18+ years</div>
                            <div className="text-xs text-black/60 mt-0.5 text-left w-full font-medium">Adults</div>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && answers.who !== "kiddo" && (
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
                        { value: "multi", label: "Multi Terrain", desc: "Mountain biking and off-road" },
                        { value: "paved", label: "Paved Road", desc: "City streets and commuting" },
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

                {step === 3 && answers.who !== "kiddo" && (
                  <motion.div
                    key="q4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">How many gears do you need?</h3>
                    <p className="text-sm text-black/60">Select all that apply.</p>
                    <div className="grid gap-4 mt-6">
                      {[
                        { value: "simple", label: "Single Speed", desc: "Keep it simple and easy to maintain" },
                        { value: "few", label: "7 Speeds", desc: "A few options, great for city riding" },
                        { value: "all", label: "21+ Speeds", desc: "Maximum options for steep climbs" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleGear(opt.value)}
                          className={optionBtn(answers.gears.includes(opt.value))}
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
                {step === totalSteps - 1 ? "See Results" : "Next"}
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
