"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  size = "md",
  onBrand = false,
}: {
  href?: string;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  /** Render in white for use on gradient / dark surfaces. */
  onBrand?: boolean;
}) {
  const mark = {
    sm: "h-8 sm:h-9",
    md: "h-10 sm:h-12",
    lg: "h-12 sm:h-14",
  }[size];

  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)}>
      <img
        src="/logo.png"
        alt="سند | Sanad"
        className={cn(mark, "w-auto object-contain transition-transform duration-200 group-hover:scale-105", onBrand && "brightness-0 invert")}
      />
    </Link>
  );
}
