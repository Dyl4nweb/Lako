import React from "react";
import Link from "next/link";

interface MovliLogoProps {
  className?: string;
  showTagline?: boolean;
  isLink?: boolean;
  size?: "sm" | "md" | "lg";
}

export function MovliLogo({
  className = "",
  showTagline = false,
  isLink = true,
  size = "md",
}: MovliLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Dynamic Movli Geometric Loop Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 text-white shadow-sm shadow-orange-500/20`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5 transition-transform duration-300 group-hover:scale-110"
        >
          {/* Continuous M flow with forward directional motion */}
          <path d="M4 18V8l4 5 4-5 4 5V6" />
          <path d="M16 6h4v4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center tracking-tight">
          <span className={`font-black text-neutral-900 ${sizeClasses[size]}`}>
            Mov<span className="text-orange-600">li</span>
          </span>
          <span className="ml-1 w-1.5 h-1.5 rounded-full bg-orange-600 self-baseline mt-1.5" />
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wide text-neutral-500 -mt-0.5">
            Everything moves with Movli
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
