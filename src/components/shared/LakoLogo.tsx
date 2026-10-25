import React from "react";
import Link from "next/link";
import Image from "next/image";

export interface LakoLogoProps {
  className?: string;
  showTagline?: boolean;
  isLink?: boolean;
  size?: "sm" | "md" | "lg";
}

export function LakoLogo({
  className = "",
  showTagline = false,
  isLink = true,
  size = "md",
}: LakoLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official LAKO Carabao Mascot App Icon */}
      <div
        style={{ position: "relative" }}
        className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm shadow-orange-500/10 ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-105`}
      >
        <Image
          src="/brand/apple-touch-icon.png"
          alt="LAKO Logo"
          fill
          sizes="(max-width: 768px) 40px, 48px"
          priority
          className="object-contain"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center tracking-tight">
          <span className={`font-black tracking-tight text-neutral-900 ${sizeClasses[size]}`}>
            LA<span className="text-[#FF7A1A]">KO</span>
          </span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#FF7A1A] self-baseline mt-1.5" />
        </div>
        {showTagline && (
          <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase -mt-0.5">
            Marketplace & Delivery
          </span>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
