"use client";

import { Check, Copy, Lock, RotateCcw, Ban } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { CourseCode, User } from "@/lib/types";

interface SecretCodeListProps {
  codes: CourseCode[];
  resolveUser?: (id?: string | null) => User | undefined;
  onRevoke?: (codeId: string) => void;
  className?: string;
}

export function SecretCodeList({
  codes,
  resolveUser,
  onRevoke,
  className,
}: SecretCodeListProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: CourseCode) => {
    navigator.clipboard?.writeText(code.code).then(() => {
      setCopied(code.id);
      toast.success(t("admin.codes.copied"));
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const statusBadge = (status: CourseCode["status"]) => {
    if (status === "used") return <Badge variant="success">{t("admin.codes.used")}</Badge>;
    if (status === "revoked")
      return <Badge variant="danger">{t("admin.codes.revoked")}</Badge>;
    return <Badge variant="secondary">{t("admin.codes.available")}</Badge>;
  };

  return (
    <ul className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {codes.map((code) => {
        const boundUser = resolveUser?.(code.boundUserId);
        const isUsed = code.status === "used";
        const isRevoked = code.status === "revoked";
        return (
          <li
            key={code.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-colors",
              isUsed && "bg-muted/40",
              isRevoked && "opacity-60"
            )}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">
                  {code.label}
                </span>
                {statusBadge(code.status)}
              </div>
              <button
                type="button"
                onClick={() => copy(code)}
                className={cn(
                  "group flex items-center gap-2 font-mono text-sm font-semibold tracking-wide",
                  isUsed ? "text-muted-foreground line-through" : "text-foreground"
                )}
                disabled={isUsed}
                title={isUsed ? "" : t("admin.codes.copy")}
              >
                {isUsed && <Lock className="size-3.5" />}
                <span dir="ltr">{code.code}</span>
                {!isUsed &&
                  (copied === code.id ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                  ))}
              </button>
              {boundUser && (
                <p className="truncate text-xs text-muted-foreground">
                  {t("admin.codes.boundTo")}:{" "}
                  <span className="font-medium text-foreground">
                    {boundUser.firstName} {boundUser.lastName}
                  </span>
                </p>
              )}
            </div>

            {onRevoke && !isUsed && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRevoke(code.id)}
                title={isRevoked ? t("admin.codes.restore") : t("admin.codes.revoke")}
              >
                {isRevoked ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <Ban className="size-4" />
                )}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
