"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}

/**
 * OtpInput — segmented numeric code entry with auto-advance, backspace and
 * paste support. Digits are always LTR regardless of locale.
 */
export function OtpInput({
  length = 4,
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  autoFocus = true,
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = React.useMemo(
    () => Array.from({ length }, (_, i) => value[i] ?? ""),
    [value, length]
  );

  React.useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (joined.length === length && !joined.includes("")) {
      onComplete?.(joined);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) {
      setDigit(index, "");
      return;
    }
    setDigit(index, digit);
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        setDigit(index - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1)
      refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
    if (pasted.length === length) onComplete?.(pasted);
  };

  return (
    <div className="flex justify-center gap-3" dir="ltr">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            "size-14 rounded-xl border-2 bg-background text-center text-2xl font-bold shadow-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-50",
            invalid ? "border-destructive" : "border-input",
            digit && "border-primary/60"
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
