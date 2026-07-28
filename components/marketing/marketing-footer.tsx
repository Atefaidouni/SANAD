"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Mail, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function MarketingFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-12 border-t border-border bg-muted/60">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("marketing.footer.tagline")}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground">{t("marketing.footer.quickLinks")}</p>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.about")}
                </a>
              </li>
              <li>
                <a href="#services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.services")}
                </a>
              </li>
              <li>
                <a href="#feedback" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.feedback")}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {t("nav.contact")}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-foreground">{t("marketing.footer.contactTitle")}</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Contact.sanad.dz@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span dir="ltr">0563 53 28 90</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("marketing.footer.rights")}
        </div>
      </div>
    </footer>
  );
}
