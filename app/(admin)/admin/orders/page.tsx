"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { formatDate, initials } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const [query, setQuery] = useState("");

  const rows = store.getBookOrders().filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.order.fullName.toLowerCase().includes(q) ||
      r.course.title.toLowerCase().includes(q) ||
      r.order.wilaya.toLowerCase().includes(q)
    );
  });

  const deliveryLabel = (d: string) => t(`join.delivery.${d}`);

  return (
    <DashboardShell role="admin" title={t("admin.orders.title")} subtitle={t("admin.orders.subtitle")}>
      <Card>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t("admin.orders.search")}
            className="sm:max-w-sm"
          />

          {rows.length === 0 ? (
            <EmptyState icon={Truck} title={t("admin.orders.empty")} />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <div className="overflow-x-auto scroll-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                      <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.cols.student")}</th>
                      <th className="hidden px-4 py-3 text-start font-semibold lg:table-cell">{t("admin.orders.cols.course")}</th>
                      <th className="hidden px-4 py-3 text-start font-semibold sm:table-cell">{t("admin.orders.cols.phone")}</th>
                      <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.cols.wilaya")}</th>
                      <th className="hidden px-4 py-3 text-start font-semibold md:table-cell">{t("admin.orders.cols.baladiya")}</th>
                      <th className="px-4 py-3 text-start font-semibold">{t("admin.orders.cols.delivery")}</th>
                      <th className="hidden px-4 py-3 text-start font-semibold md:table-cell">{t("admin.orders.cols.date")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                      <tr key={r.order.id} className="bg-card transition-colors hover:bg-accent/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={r.user.avatar ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {initials(r.order.fullName.split(" ")[0], r.order.fullName.split(" ")[1])}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{r.order.fullName}</span>
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">{r.course.title}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell" dir="ltr">{r.order.phone}</td>
                        <td className="px-4 py-3">{r.order.wilaya}</td>
                        <td className="hidden px-4 py-3 md:table-cell">{r.order.baladiya}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{deliveryLabel(r.order.deliveryType)}</Badge>
                        </td>
                        <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                          {formatDate(r.order.createdAt, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
