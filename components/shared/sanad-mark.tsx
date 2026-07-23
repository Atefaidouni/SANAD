"use client";

import { useId } from "react";

/**
 * Sanad brand mark — two stacked books rendered in the teal→green gradient.
 * `tone="white"` renders it solid white for use on the gradient / dark brand panel.
 * The gradient references theme CSS variables so it adapts in dark mode.
 */
export function SanadMark({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "white";
}) {
  const gid = `sanad-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const fill = tone === "white" ? "#fff" : `url(#${gid})`;
  const shade = tone === "white" ? "rgba(255,255,255,0.35)" : `url(#${gid}-shade)`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Sanad"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--brand-teal))" />
          <stop offset="1" stopColor="hsl(var(--brand-blue))" />
        </linearGradient>
        <linearGradient id={`${gid}-shade`} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(var(--brand-blue))" />
          <stop offset="1" stopColor="hsl(var(--brand-blue) / 0.75)" />
        </linearGradient>
      </defs>

      {/* Back book (bottom of stack) */}
      <g transform="translate(0, 6)">
        <path d="M6 40 L6 14 Q6 10 10 10 L48 10 Q52 10 52 14 L52 40 Z" fill={shade} />
        <path d="M6 40 L52 40 L58 46 L12 46 Z" fill={fill} opacity="0.9" />
        <rect x="6" y="38" width="46" height="4" fill="hsl(var(--brand-teal))" opacity="0.6" />
      </g>

      {/* Front book (top of stack) */}
      <g transform="translate(4, -2)">
        <path d="M4 34 L4 8 Q4 4 8 4 L44 4 Q48 4 48 8 L48 34 Z" fill={fill} />
        <rect x="4" y="4" width="6" height="30" fill="#fff" opacity="0.25" />
        <path d="M14 12 H40" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M14 20 H34" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      </g>
    </svg>
  );
}
