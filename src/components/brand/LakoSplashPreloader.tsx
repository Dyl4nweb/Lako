"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export function LakoSplashPreloader() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    try {
      const hasSeenSplash = sessionStorage.getItem("lako_splash_seen");
      if (hasSeenSplash) {
        return;
      }

      // First visit in this session: display preloader
      setShouldRender(true);

      // Lock body scroll while splash is active
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Progress animation runs for ~1.6s
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        sessionStorage.setItem("lako_splash_seen", "true");

        // Restore body scroll
        document.body.style.overflow = originalOverflow;

        // Unmount after fade transition finishes (450ms)
        setTimeout(() => {
          setShouldRender(false);
        }, 450);
      }, 1650);

      return () => {
        clearTimeout(fadeTimer);
        document.body.style.overflow = originalOverflow;
      };
    } catch {
      // Graceful fallback if sessionStorage is restricted (e.g. strict private browsing)
      setShouldRender(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    sessionStorage.setItem("lako_splash_seen", "true");
    document.body.style.overflow = "";
    setTimeout(() => {
      setShouldRender(false);
    }, 400);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <aside
      aria-label="Loading LAKO"
      aria-modal="true"
      role="status"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-[#FF7A1A] text-white p-6 sm:p-10 select-none overflow-hidden transition-all duration-400 ease-out cursor-pointer ${
        isFadingOut
          ? "opacity-0 scale-102 pointer-events-none"
          : "opacity-100 scale-100 pointer-events-auto"
      }`}
    >
      {/* Decorative Subtle Watermark Background Patterns */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, #FFF6EA 2.5%, transparent 0%), radial-gradient(circle at 75px 75px, #242424 2.5%, transparent 0%)`,
          backgroundSize: "100px 100px",
        }}
      />

      {/* Top Header Spacing with Skip prompt */}
      <header className="w-full max-w-sm flex items-center justify-between text-[11px] font-bold text-orange-100/80 uppercase tracking-widest relative z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Lokal Delivery Hub</span>
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="hover:text-white px-2.5 py-1 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
        >
          Skip ✕
        </button>
      </header>

      {/* Center Artwork: Mascot with 3D LAKO & Subtitle */}
      <main className="flex flex-col items-center justify-center my-auto relative z-10 max-w-xs sm:max-w-sm text-center">
        <div className="relative animate-lako-float">
          {/* Glow backdrop */}
          <div className="absolute inset-0 bg-orange-400/30 blur-2xl rounded-full scale-110" />

          {/* High Resolution Mascot Artwork */}
          <Image
            src="/brand/mascot-splash.png"
            alt="LAKO Mascot - Carabao Marketplace & Delivery"
            width={240}
            height={512}
            priority
            className="w-56 sm:w-64 h-auto object-contain drop-shadow-2xl relative z-10"
          />
        </div>
      </main>

      {/* Bottom Progress & Loading State */}
      <footer className="w-full max-w-xs sm:max-w-sm flex flex-col items-center gap-2 relative z-10 pb-4">
        {/* Progress Bar Container */}
        <div className="w-48 sm:w-56 h-1.5 bg-[#D95A00]/60 rounded-full overflow-hidden p-0.5 shadow-inner">
          <div className="h-full bg-[#242424] rounded-full animate-lako-progress shadow-sm" />
        </div>

        {/* Loading Subtitle */}
        <p className="text-xs font-semibold text-[#FFF6EA] tracking-wide animate-lako-pulse">
          Loading paninda...
        </p>
      </footer>
    </aside>
  );
}
