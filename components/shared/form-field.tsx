"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  /** Optional leading/trailing adornment shown on the right of the label row. */
  action?: React.ReactNode;
}

/**
 * FormField — consistent label + control + error/hint wrapper used across
 * every form in the app. RTL-safe (logical spacing).
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
  action,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || action) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label htmlFor={htmlFor}>
              {label}
              {required && <span className="ms-0.5 text-destructive">*</span>}
            </Label>
          )}
          {action}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
