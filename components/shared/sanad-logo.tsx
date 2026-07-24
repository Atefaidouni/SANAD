"use client";

import { cn } from "@/lib/utils";

/**
 * Full Sanad logo lockup — the stacked-books emblem alongside the "سند / Sanad"
 * wordmark. `tone="white"` renders the whole lockup solid white for use on the
 * gradient brand panel / dark surfaces.
 */
export function SanadLogo({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "white";
}) {
  const isWhite = tone === "white";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <img
        src="/logo.png"
        alt="Sanad"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          img.src = "/logo.svg";
        }}
        className="h-10 w-auto object-contain"
      />
      <span className="flex flex-col items-start leading-none">
        <span
          className={cn(
            "font-arabic font-semibold",
            isWhite ? "text-white" : "text-foreground"
          )}
          style={{ fontSize: "0.85em" }}
        >
          سند
        </span>
        <span
          className={cn(
            "font-normal uppercase tracking-[0.42em]",
            isWhite ? "text-white/70" : "text-muted-foreground"
          )}
          style={{ fontSize: "0.22em" }}
        >
          Sanad
        </span>
      </span>
    </span>
  );
}
