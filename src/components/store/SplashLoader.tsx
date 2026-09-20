"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function SplashLoader({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Only show splash once per browser session
    if (sessionStorage.getItem("bmdavey-splash-shown")) {
      setDone(true);
      return;
    }

    setShowSplash(true);

    const timer = setTimeout(() => {
      setFadeOut(true);
      sessionStorage.setItem("bmdavey-splash-shown", "1");
      setTimeout(() => {
        setShowSplash(false);
        setDone(true);
      }, 500);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // If splash was already shown, render children immediately
  if (done && !showSplash) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Splash Screen - pure CSS animations for smoothness */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className={`relative splash-bike ${fadeOut ? "splash-exit" : ""}`}>
            <div
              className="absolute inset-0 blur-[60px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(0,143,239,0.35) 0%, transparent 70%)",
                transform: "scale(2)",
              }}
            />
            <Image
              src="/cycle1.svg"
              alt="Loading"
              width={280}
              height={190}
              className="relative"
              priority
            />
          </div>

          <p className="mt-8 text-white/50 text-sm tracking-[0.3em] uppercase font-medium">
            B. M. Davey &amp; Co
          </p>

          <div className="mt-6 w-40 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full bg-[#008FEF] rounded-full ${fadeOut ? "splash-bar-done" : "splash-bar"}`} />
          </div>
        </div>
      )}

      {/* Page content - hidden until splash is done */}
      <div className={done ? "" : "invisible"}>
        {children}
      </div>

      <style jsx>{`
        .splash-bike {
          animation: splash-pulse 1.8s ease-in-out infinite;
        }
        .splash-exit {
          animation: splash-fly 0.45s ease-in forwards;
        }
        .splash-bar {
          animation: splash-fill 1.3s ease-out forwards;
        }
        .splash-bar-done {
          width: 100% !important;
          transition: width 0.2s ease-out;
        }
        @keyframes splash-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes splash-fly {
          to {
            transform: scale(0.5) translate(40vw, -15vh);
            opacity: 0;
          }
        }
        @keyframes splash-fill {
          from { width: 0%; }
          to { width: 75%; }
        }
      `}</style>
    </>
  );
}
