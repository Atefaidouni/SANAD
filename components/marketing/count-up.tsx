"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  /** Target number to count up to. */
  value: number;
  /** Animation length in ms. */
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  /** Add thousands separators (2,000). */
  separator?: boolean;
  className?: string;
}

/**
 * CountUp — animates a number from 0 to `value` with an easeOut curve the first
 * time it scrolls into view. Pure rAF (no layout thrash, no hydration mismatch:
 * both server and first client render show 0).
 */
export function CountUp({
  value,
  durationMs = 1500,
  prefix = "",
  suffix = "",
  separator = true,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, durationMs]);

  const text = separator ? display.toLocaleString("en-US") : String(display);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
