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

      // Splash displays for ~1.5s then fades out smoothly
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        sessionStorage.setItem("lako_splash_seen", "true");

        // Restore body scroll
        document.body.style.overflow = originalOverflow;

        // Unmount after fade transition finishes (400ms)
        setTimeout(() => {
          setShouldRender(false);
        }, 400);
      }, 1500);

      return () => {
        clearTimeout(fadeTimer);
        document.body.style.overflow = originalOverflow;
      };
    } catch {
      setShouldRender(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    sessionStorage.setItem("lako_splash_seen", "true");
    document.body.style.overflow = "";
    setTimeout(() => {
      setShouldRender(false);
    }, 350);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <aside
      aria-label="LAKO"
      aria-modal="true"
      role="status"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-[#FF7A1A] select-none overflow-hidden transition-all duration-400 ease-out cursor-pointer ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100 pointer-events-auto"
      }`}
    >
      {/* Centered Mascot Artwork */}
      <div className="relative flex items-center justify-center animate-lako-float">
        {/* Soft ambient glow */}
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-125 pointer-events-none" />

        <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 drop-shadow-2xl">
          <Image
            src="/brand/mascot-delivery.png"
            alt="LAKO Carabao Mascot"
            fill
            sizes="(max-width: 640px) 256px, (max-width: 1024px) 288px, 320px"
            priority
            className="object-contain"
          />
        </div>
      </div>
    </aside>
  );
}
