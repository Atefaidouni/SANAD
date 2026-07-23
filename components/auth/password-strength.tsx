"use client";

import { useI18n } from "@/lib/i18n/provider";
import { scorePassword } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

export function PasswordStrength({ value }: { value: string }) {
  const { t } = useI18n();
  if (!value) return null;
  const { score, labelKey } = scorePassword(value);

  const colors = [
    "bg-destructive",
    "bg-destructive",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500",
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? colors[score] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t(`auth.passwordStrength.${labelKey}`)}
      </p>
    </div>
  );
}
