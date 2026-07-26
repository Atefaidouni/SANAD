"use client";

import { Loader2 } from "lucide-react";
import { Logo } from "./logo";

export function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-muted/60">
      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    </div>
  );
}
