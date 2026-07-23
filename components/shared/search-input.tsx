"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ps-10 pe-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
