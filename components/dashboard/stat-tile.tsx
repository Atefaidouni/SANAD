"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EASE } from "@/components/motion";

export function StatTile({
  icon: Icon,
  label,
  value,
  accent = false,
  index = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  index?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(index * 0.07, 0.4) }}
      whileHover={reduce ? undefined : { y: -4 }}
    >
      <Card className="group flex items-center gap-4 p-4 transition-shadow duration-300 hover:shadow-brand">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            accent
              ? "bg-brand-gradient text-white"
              : "bg-brand-gradient-soft text-primary"
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
}
