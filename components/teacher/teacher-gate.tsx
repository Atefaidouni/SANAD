"use client";

import { Clock3 } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";

/** Blocks the teacher area until an admin approves the account. */
export function TeacherGate({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const store = useStore();
  const session = useSession();
  const user = store.getUser(session?.user.id);

  if (user && !user.approved) {
    return (
      <DashboardShell role="teacher" title={t("teacher.title")}>
        <div className="mx-auto max-w-lg py-10 text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-amber-500/15 text-amber-500">
            <Clock3 className="size-8" />
          </div>
          <h2 className="text-xl font-bold">{t("teacher.pendingTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("teacher.pendingBody")}</p>
        </div>
      </DashboardShell>
    );
  }

  return <>{children}</>;
}
