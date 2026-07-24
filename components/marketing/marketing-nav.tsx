"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useSession } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";
import { homePathForRole } from "@/lib/auth-helpers";

const LINKS = [
  { href: "#home", key: "nav.home" },
  { href: "#about", key: "nav.about" },
  { href: "#services", key: "nav.services" },
  { href: "#feedback", key: "nav.feedback" },
  { href: "#contact", key: "nav.contact" },
];

/**
 * Renders inline at the top of the Hero's gradient card. Transparent (white text,
 * pill buttons) until the page scrolls past the hero, then switches to a solid
 * sticky bar — same component, so the transition is seamless.
 */
export function MarketingNav() {
  const { t } = useI18n();
  const session = useSession();
  const reduce = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 150);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashHref = session ? homePathForRole(session.user.role) : null;

  return (
    <motion.header
      initial={reduce ? { opacity: 0 } : { y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-4 z-50 px-4 sm:px-8"
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full px-5 py-2.5 transition-all duration-300",
          scrolled
            ? "glass-nav shadow-lg border border-white/60 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl"
            : "glass-nav shadow-sm border border-white/40 bg-white/35 dark:bg-slate-900/40 backdrop-blur-md"
        )}
      >
        <Logo size="sm" />

        <nav className="hidden items-center gap-1.5 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-white/40 dark:text-slate-100 dark:hover:bg-white/10"
            >
              {t(l.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher className="text-slate-800 hover:bg-white/30 dark:text-slate-100" />
          <ThemeToggle className="text-slate-800 hover:bg-white/30 dark:text-slate-100" />
          <div className="hidden items-center gap-2 sm:flex">
            {dashHref ? (
              <Button
                asChild
                size="sm"
                className="rounded-full bg-white text-slate-900 shadow-sm hover:bg-white/90 font-semibold"
              >
                <Link href={dashHref}>{t("nav.dashboard")}</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full border border-emerald-700/20 bg-emerald-50/50 px-4 text-emerald-950 hover:bg-emerald-100/60 dark:text-white"
                >
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-white px-5 text-emerald-900 shadow-sm hover:bg-slate-50 font-semibold"
                >
                  <Link href="/signup">{t("nav.signup")}</Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-800 hover:bg-white/30 lg:hidden dark:text-slate-100"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mt-2 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur-xl lg:hidden dark:bg-slate-900/90">
          <nav className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {t(l.key)}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              {dashHref ? (
                <Button asChild className="flex-1 rounded-full bg-emerald-600 text-white">
                  <Link href={dashHref}>{t("nav.dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 rounded-full border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  >
                    <Link href="/login">{t("nav.login")}</Link>
                  </Button>
                  <Button
                    asChild
                    className="flex-1 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
                  >
                    <Link href="/signup">{t("nav.signup")}</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </motion.header>
  );
}
