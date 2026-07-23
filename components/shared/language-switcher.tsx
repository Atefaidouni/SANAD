"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { locales, localeNames } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "full";
  className?: string;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("lang.switch")}
            className={className}
          >
            <Languages className="size-[1.15rem]" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <Languages className="size-4" />
            {localeNames[locale]}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLocale(l)}
            className={cn(
              "justify-between font-medium",
              l === locale && "bg-accent text-accent-foreground"
            )}
          >
            <span className={l === "ar" ? "font-arabic" : ""}>
              {localeNames[l]}
            </span>
            {l === locale && <span className="text-primary">●</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
