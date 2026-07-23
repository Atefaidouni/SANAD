"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2.5 w-full overflow-hidden rounded-full bg-muted",
      className
    )}
    {...props}
  >
    {/* width-based fill anchors to the inline-start edge, so it mirrors in RTL */}
    <ProgressPrimitive.Indicator
      className="h-full rounded-full bg-brand-gradient transition-all duration-500"
      style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
