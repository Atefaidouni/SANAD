"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { useI18n } from "@/lib/i18n/provider";

export function MarketingFooter() {
  const { t } = useI18n();

  const columns = [
    {
      title: t("marketing.footer.product"),
      links: [
        { label: t("nav.services"), href: "#services" },
        { label: t("nav.browseCourses"), href: "/login" },
        { label: t("dashboard.goldPack.badge"), href: "/signup" },
      ],
    },
    {
      title: t("marketing.footer.company"),
      links: [
        { label: t("nav.about"), href: "#about" },
        { label: t("nav.feedback"), href: "#feedback" },
        { label: t("nav.contact"), href: "#contact" },
      ],
    },
    {
      title: t("marketing.footer.legal"),
      links: [
        { label: t("marketing.footer.privacy"), href: "#" },
        { label: t("marketing.footer.terms"), href: "#" },
      ],
    },
  ];

  return (
    <footer className="mt-8 border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Logo size="lg" />
            <p className="max-w-xs text-sm text-muted-foreground">
              {t("marketing.footer.tagline")}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          {t("marketing.footer.rights")}
        </div>
      </div>
    </footer>
  );
}
