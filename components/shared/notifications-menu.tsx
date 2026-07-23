"use client";

import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { cn, timeAgo } from "@/lib/utils";

export function NotificationsMenu() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  if (!session) return null;

  const notifications = store.getNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("dashboard.notifications")}>
          <Bell className="size-[1.15rem]" />
          {unread > 0 && (
            <span className="absolute end-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[20rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">{t("dashboard.notifications")}</p>
          {unread > 0 && (
            <button
              onClick={() => store.markAllNotificationsRead(session.user.id)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="size-3.5" /> {t("dashboard.markAllRead")}
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto scroll-thin">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t("dashboard.noNotifications")}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => store.markNotificationRead(n.id)}
                    className={cn(
                      "flex w-full gap-3 px-4 py-3 text-start transition-colors hover:bg-accent",
                      !n.read && "bg-primary/5"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        n.read ? "bg-transparent" : "bg-primary"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {t(n.titleKey, n.meta)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t(n.bodyKey, n.meta)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {timeAgo(n.createdAt, locale)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
