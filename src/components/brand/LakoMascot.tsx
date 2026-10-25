"use client";

import React from "react";
import Image from "next/image";

export type LakoMascotVariant = "splash" | "delivery" | "icon";
export type LakoMascotSize = "xs" | "sm" | "md" | "lg" | "xl" | "custom";

export interface LakoMascotProps {
  variant?: LakoMascotVariant;
  size?: LakoMascotSize;
  className?: string;
  priority?: boolean;
  animate?: boolean;
  alt?: string;
  width?: number;
  height?: number;
}

const SIZE_CONFIGS: Record<
  LakoMascotVariant,
  Record<Exclude<LakoMascotSize, "custom">, { width: number; height: number; wrapperClass: string }>
> = {
  delivery: {
    xs: { width: 48, height: 58, wrapperClass: "w-12 h-[58px]" },
    sm: { width: 80, height: 96, wrapperClass: "w-20 h-24" },
    md: { width: 140, height: 168, wrapperClass: "w-[140px] h-[168px]" },
    lg: { width: 220, height: 264, wrapperClass: "w-[220px] h-[264px]" },
    xl: { width: 320, height: 384, wrapperClass: "w-[320px] h-[384px]" },
  },
  splash: {
    xs: { width: 60, height: 128, wrapperClass: "w-[60px] h-32" },
    sm: { width: 100, height: 213, wrapperClass: "w-[100px] h-[213px]" },
    md: { width: 160, height: 341, wrapperClass: "w-40 h-[341px]" },
    lg: { width: 220, height: 468, wrapperClass: "w-[220px] h-[468px]" },
    xl: { width: 280, height: 596, wrapperClass: "w-[280px] h-[596px]" },
  },
  icon: {
    xs: { width: 32, height: 32, wrapperClass: "w-8 h-8 rounded-lg" },
    sm: { width: 44, height: 44, wrapperClass: "w-11 h-11 rounded-xl" },
    md: { width: 64, height: 64, wrapperClass: "w-16 h-16 rounded-2xl" },
    lg: { width: 96, height: 96, wrapperClass: "w-24 h-24 rounded-3xl" },
    xl: { width: 160, height: 160, wrapperClass: "w-40 h-40 rounded-[28px]" },
  },
};

const VARIANT_ASSETS: Record<LakoMascotVariant, { src: string; defaultAlt: string }> = {
  delivery: {
    src: "/brand/mascot-delivery.png",
    defaultAlt: "LAKO Carabao Delivery Mascot holding parcel",
  },
  splash: {
    src: "/brand/mascot-splash.png",
    defaultAlt: "LAKO Marketplace & Delivery Splash Mascot",
  },
  icon: {
    src: "/brand/apple-touch-icon.png",
    defaultAlt: "LAKO Carabao Brand Avatar Icon",
  },
};

export function LakoMascot({
  variant = "delivery",
  size = "md",
  className = "",
  priority = false,
  animate = false,
  alt,
  width: customWidth,
  height: customHeight,
}: LakoMascotProps) {
  const asset = VARIANT_ASSETS[variant];
  const sizeConfig = size !== "custom" ? SIZE_CONFIGS[variant][size] : null;

  const width = customWidth || sizeConfig?.width || 140;
  const height = customHeight || sizeConfig?.height || 168;

  const animationClass = animate ? "animate-lako-float" : "";

  return (
    <div
      style={{ position: "relative" }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        sizeConfig?.wrapperClass || ""
      } ${animationClass} ${className}`}
    >
      <Image
        src={asset.src}
        alt={alt || asset.defaultAlt}
        width={width}
        height={height}
        priority={priority}
        className={`w-full h-full object-contain ${
          variant === "icon" ? "rounded-[inherit] shadow-md shadow-neutral-900/10" : ""
        }`}
      />
    </div>
  );
}
