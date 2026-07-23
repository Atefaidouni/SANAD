"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  className,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "max-w-2xl space-y-3",
        align === "center" ? "mx-auto text-center" : "text-start",
        className
      )}
    >
      {badge && (
        <Badge variant="secondary" className="px-3 py-1">
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="text-base text-muted-foreground sm:text-lg">{subtitle}</p>
      )}
    </motion.div>
  );
}
