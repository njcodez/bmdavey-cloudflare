"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createCoupon } from "~/server/actions/create-coupon";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { X, Copy, Check, Clock, PartyPopper } from "lucide-react";

type ReservePriceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  variantId: number;
  lockedPrice: string;
  productName: string;
  variantColor: string;
};

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(expiresAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="flex items-center gap-2 text-primary font-mono text-lg font-bold">
      <Clock className="w-5 h-5" />
      {timeLeft}
    </div>
  );
}

export function ReservePriceModal({
  isOpen,
  onClose,
  productId,
  variantId,
  lockedPrice,
  productName: _productName,
  variantColor: _variantColor,
}: ReservePriceModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [copied, setCopied] = useState(false);

  const fireConfetti = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default;
    // Fire multiple bursts
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };

    function fire(particleRatio: number, opts: Record<string, unknown>) {
      void confetti({
        ...defaults,
        particleCount: Math.floor(count * particleRatio),
        spread: 26,
        startVelocity: 55,
        ...opts,
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const mobileStr = mobile.trim();
    const emailStr = email.trim();
    const isPhone = /^\d{10}$/.test(mobileStr);
    const isValidEmail = emailStr ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr) : true;

    if (!isPhone) {
      setError("Please enter a valid 10-digit mobile number.");
      setIsSubmitting(false);
      return;
    }
    
    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await createCoupon({
        userName: name,
        mobile: mobileStr,
        email: emailStr || undefined,
        productId,
        variantId,
        lockedPrice,
      });

      setCouponCode(result.code);
      setExpiresAt(result.expiresAt);
      setStep("success");
      
      // Fire confetti after a small delay for visual impact
      setTimeout(() => {
        void fireConfetti();
      }, 300);
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("form");
        setName("");
        setMobile("");
        setEmail("");
        setError("");
        setCouponCode("");
        setExpiresAt("");
      }, 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {step === "form" ? (
              <div className="p-8">
                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">Reserve Your Price</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lock in <span className="font-bold text-primary">₹{lockedPrice}</span> for{" "}
                    <span className="font-bold text-primary">48 hours</span>. No upfront payment required.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="reserve-name">Your Name</Label>
                    <Input
                      id="reserve-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reserve-mobile">Mobile Number <span className="text-destructive">*</span></Label>
                    <Input
                      id="reserve-mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      type="tel"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reserve-email">Email Address</Label>
                    <Input
                      id="reserve-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className="h-12"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !name || !mobile}
                    className="w-full btn-cred text-base h-12 font-bold"
                  >
                    {isSubmitting ? "Reserving..." : "Lock This Price"}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                >
                  <PartyPopper className="w-16 h-16 text-primary mx-auto mb-4" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">Price Locked!</h2>
                <p className="text-muted-foreground mb-6">
                  Your exclusive price of <span className="font-bold text-primary">₹{lockedPrice}</span> is
                  now locked for 48 hours. Show this code in-store to claim your bicycle.
                </p>

                {/* Code Display */}
                <div className="bg-muted rounded-xl p-6 mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Your Coupon Code
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-3xl font-black tracking-[0.2em] text-foreground">
                      {couponCode}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-background transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Countdown */}
                <div className="flex flex-col items-center gap-2 mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Time Remaining
                  </p>
                  <CountdownTimer expiresAt={expiresAt} />
                </div>

                <Button onClick={onClose} variant="outline" className="w-full h-12">
                  Done
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
