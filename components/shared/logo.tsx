"use client";

import Link from "next/link";
import { SanadMark } from "./sanad-mark";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  className,
  showText = true,
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
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
  }[size];
  const arabic = {
    sm: "text-[0.95rem]",
    md: "text-[1.05rem]",
    lg: "text-[1.45rem]",
  }[size];
  const latin = {
    sm: "text-[0.5rem]",
    md: "text-[0.56rem]",
    lg: "text-[0.65rem]",
  }[size];

  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <SanadMark
        tone={onBrand ? "white" : "brand"}
        className={cn(mark, "w-auto transition-transform group-hover:scale-105")}
      />
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-arabic font-medium",
              arabic,
              onBrand ? "text-white" : "text-foreground"
            )}
          >
            سند
          </span>
          <span
            className={cn(
              "font-normal uppercase tracking-[0.42em]",
              latin,
              onBrand ? "text-white/70" : "text-muted-foreground"
            )}
          >
            SANAD
          </span>
        </span>
      )}
    </Link>
  );
}
