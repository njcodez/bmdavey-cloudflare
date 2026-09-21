"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { checkSession, logoutAction } from "~/server/actions/admin-auth";
import { useState, useEffect, useRef, useCallback } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  
  const updateHeaderStyle = useCallback(() => {
    const el = headerRef.current;
    if (!el) return;
    // Scroll range: 0 → window.innerHeight (end of hero section)
    const scrollEnd = window.innerHeight * 0.85;
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollEnd));
    
    // Interpolate: bg from rgba(0,0,0,0.9) → rgba(0,143,239,0.95)
    const r = Math.round(lerp(0, 0, progress));
    const g = Math.round(lerp(0, 143, progress));
    const b = Math.round(lerp(0, 239, progress));
    const a = lerp(0.9, 0.95, progress);
    el.style.backgroundColor = `rgba(${r},${g},${b},${a})`;
    
    // Interpolate border: rgba(255,255,255,0.1) → rgba(255,255,255,0.2)
    const borderA = lerp(0.1, 0.2, progress);
    el.style.borderColor = `rgba(255,255,255,${borderA})`;
    
    // Interpolate shadow glow
    const shadowA = lerp(0, 0.4, progress);
    el.style.boxShadow = `0 0 ${lerp(8, 20, progress)}px rgba(0,143,239,${shadowA})`;
  }, []);
  
  useEffect(() => {
    // Check cached session first, then verify with server
    const cached = sessionStorage.getItem("bmdavey-admin-session");
    if (cached === "true") setIsLoggedIn(true);
    
    checkSession().then((result) => {
      setIsLoggedIn(result);
      sessionStorage.setItem("bmdavey-admin-session", String(result));
    }).catch(console.error);
    
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateHeaderStyle);
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    updateHeaderStyle(); // set initial
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [updateHeaderStyle]);

  const handleLogout = async () => {
    await logoutAction();
    sessionStorage.removeItem("bmdavey-admin-session");
    setIsLoggedIn(false);
  };
  
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <header
        ref={headerRef}
        className="w-full max-w-[1600px] backdrop-blur-lg rounded-3xl border pointer-events-auto"
        style={{ backgroundColor: "rgba(0,0,0,0.9)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div className="relative flex h-20 md:h-24 items-center justify-between px-6 mx-auto w-full">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="BM Davey"
              width={800}
              height={320}
              className="h-14 w-auto object-contain"
              priority
              quality={100}
              unoptimized
            />
          </Link>
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-8 text-sm h-full">
            <div className="relative group flex items-center h-full">
              <Link
                href="/?category=Kids#products-section"
                className="text-white font-bold hover:text-white/80 transition-colors drop-shadow-md py-4"
              >
                Kids
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-40 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-white text-black rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 rounded-tl-sm" />
                  <div className="relative bg-white rounded-xl overflow-hidden flex flex-col z-10">
                    <Link href="/?category=Kids&wheelSize=14#products-section" className="px-4 py-3 hover:bg-gray-50 font-medium text-sm transition-colors text-center">3 to 6 years</Link>
                    <Link href="/?category=Kids&wheelSize=16#products-section" className="px-4 py-3 hover:bg-gray-50 font-medium text-sm transition-colors text-center border-t border-gray-50">4 to 8 years</Link>
                    <Link href="/?category=Kids&wheelSize=20#products-section" className="px-4 py-3 hover:bg-gray-50 font-medium text-sm transition-colors text-center border-t border-gray-50">6 to 12 years</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group flex items-center h-full">
              <Link
                href="/?targetDemographic=Adults#products-section"
                className="text-white font-bold hover:text-white/80 transition-colors drop-shadow-md py-4"
              >
                Adults
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-40 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="relative bg-white text-black rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 rounded-tl-sm" />
                  <div className="relative bg-white rounded-xl overflow-hidden flex flex-col z-10">
                    <Link href="/?targetDemographic=Adults&gears=7&gears=14&gears=18&gears=21#products-section" className="px-4 py-3 hover:bg-gray-50 font-medium text-sm transition-colors text-center">Geared</Link>
                    <Link href="/?targetDemographic=Adults&gears=1#products-section" className="px-4 py-3 hover:bg-gray-50 font-medium text-sm transition-colors text-center border-t border-gray-50">Non-Geared</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group flex items-center h-full">
              <Link
                href="/?category=Hybrid#products-section"
                className="text-white font-bold hover:text-white/80 transition-colors drop-shadow-md py-4"
              >
                Hybrid
              </Link>
            </div>
          </nav>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link
              href="/about"
              className="text-white font-bold hover:text-white/80 transition-colors drop-shadow-md"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-white font-bold hover:text-white/80 transition-colors drop-shadow-md"
            >
              Contact
            </Link>
            <Link
              href={isLoggedIn ? "/admin/products" : "/admin/login"}
              className="btn-cred-white text-xs px-4 py-2 rounded-lg font-bold bg-[#008FEF] text-white ml-2 hover:bg-[#008FEF]/90 border border-black/20"
            >
              {isLoggedIn ? "Admin" : "Admin Login"}
            </Link>
            {isLoggedIn && (
              <button
                onClick={() => { void handleLogout(); }}
                className="btn-cred-white text-xs px-4 py-2 rounded-lg font-bold bg-black text-white ml-2 hover:bg-black/90 border border-white/20"
              >
                Logout
              </button>
            )}
          </nav>

          {/* Mobile Burger Menu */}
          <div className="flex md:hidden items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Animated Mobile Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/20 bg-black/50"
            >
              <nav className="flex flex-col items-center gap-4 py-6 text-sm">
                <Link href="/?category=Kids#products-section" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold">Kids</Link>
                <Link href="/?targetDemographic=Adults#products-section" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold">Adults</Link>
                <Link href="/?category=Hybrid#products-section" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold">Hybrid</Link>
                <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold">About Us</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-white font-bold">Contact</Link>
                <Link href={isLoggedIn ? "/admin/products" : "/admin/login"} onClick={() => setIsMobileMenuOpen(false)} className="btn-cred-white text-xs px-4 py-2 rounded-lg font-bold bg-[#008FEF] text-white">
                  {isLoggedIn ? "Admin" : "Admin Login"}
                </Link>
                {isLoggedIn && (
                  <button onClick={() => { void handleLogout(); setIsMobileMenuOpen(false); }} className="btn-cred-white text-xs px-4 py-2 rounded-lg font-bold bg-black text-white">
                    Logout
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
