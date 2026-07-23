"use client";

/**
 * Shared motion primitives — a small, consistent animation vocabulary used
 * across the app so micro-interactions stay elegant and uniform (not ad-hoc).
 *
 * Every primitive honours `prefers-reduced-motion`: when the user opts out we
 * drop translate/scale movement and keep a plain fade (or nothing), so the UI
 * stays accessible and never feels excessive.
 */

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Signature "premium" easing — a soft, confident ease-out. */
export const EASE = [0.22, 1, 0.36, 1] as const;

type BaseProps = {
  children: React.ReactNode;
  className?: string;
};

/* --------------------------- Reveal (scroll-in) --------------------------- */
/** Fade + slide-up the first time the element scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  once = true,
}: BaseProps & { delay?: number; y?: number; once?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------- Stagger (orchestration) ------------------------ */
/** Parent that releases its <StaggerItem> children one after another. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  once = true,
}: BaseProps & { stagger?: number; delay?: number; once?: boolean }) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 16,
}: BaseProps & { y?: number }) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  };
  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}

/* ---------------------------- FadeIn (on mount) --------------------------- */
/** Fade + slide-up immediately on mount (for above-the-fold content). */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 16,
}: BaseProps & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ----------------------------- HoverLift ---------------------------------- */
/** Lift + gentle scale on hover, press-down on tap. */
export function HoverLift({
  children,
  className,
  lift = -5,
  scale = 1.02,
}: BaseProps & { lift?: number; scale?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: lift, scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------- PageTransition ------------------------------- */
/**
 * Wrap route content so each navigation fades + slides in. Keyed by pathname
 * so it re-runs on every route change.
 */
export function PageTransition({ children, className }: BaseProps) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------- AmbientBackground ----------------------------- */
/**
 * Slow-drifting brand-coloured orbs behind content for depth/parallax feel.
 * Purely decorative; clipped to its own box and frozen under reduced motion.
 */
export function AmbientBackground({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <motion.div
        className="absolute -start-24 -top-24 size-[26rem] rounded-full bg-[hsl(var(--brand-blue)/0.12)] blur-3xl"
        animate={
          reduce ? undefined : { x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -end-20 size-[30rem] rounded-full bg-[hsl(var(--brand-teal)/0.12)] blur-3xl"
        animate={
          reduce
            ? undefined
            : { x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.12, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ------------------------------- Sheen ------------------------------------ */
/**
 * A soft diagonal light that sweeps continuously across a surface. Drop it
 * inside any `relative overflow-hidden` brand-gradient banner. Renders nothing
 * under reduced motion.
 */
export function Sheen({
  className,
  duration = 4.5,
}: {
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      initial={{ x: "-120%" }}
      animate={{ x: "320%" }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent",
        className
      )}
    />
  );
}
