"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/** Modal — a thin, opinionated wrapper over Dialog used across the app. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
}: ModalProps) {
  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  }[size];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto scroll-thin",
          widths,
          className
        )}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
        {footer && <div className="flex justify-end gap-2 pt-2">{footer}</div>}
      </DialogContent>
    </Dialog>
  );
}
