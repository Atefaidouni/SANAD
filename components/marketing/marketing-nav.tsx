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
    const onScroll = () => setScrolled(window.scrollY > 260);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashHref = session ? homePathForRole(session.user.role) : null;
  const onBrand = !scrolled;

  return (
    <motion.header
      initial={reduce ? { opacity: 0 } : { y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/85 shadow-soft backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "container flex items-center justify-between gap-4 transition-all duration-300",
          scrolled ? "h-14" : "h-20"
        )}
      >
        <Logo onBrand={onBrand} />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                onBrand
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {t(l.key)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher
            className={onBrand ? "text-white hover:bg-white/10 hover:text-white" : undefined}
          />
          <ThemeToggle
            className={onBrand ? "text-white hover:bg-white/10 hover:text-white" : undefined}
          />
          <div className="hidden items-center gap-1.5 sm:flex">
            {dashHref ? (
              <Button
                asChild
                size="sm"
                className={onBrand ? "bg-white text-primary hover:bg-white/90" : undefined}
                variant={onBrand ? undefined : "brand"}
              >
                <Link href={dashHref}>{t("nav.dashboard")}</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "rounded-full",
                    onBrand ? "bg-white text-primary hover:bg-white/90" : "bg-brand-gradient text-white hover:opacity-95"
                  )}
                >
                  <Link href="/login">{t("nav.login")}</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant={onBrand ? "outline" : "ghost"}
                  className={cn(
                    "rounded-full",
                    onBrand && "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Link href="/signup">{t("nav.signup")}</Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("lg:hidden", onBrand && "text-white hover:bg-white/10 hover:text-white")}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className={cn(
            "border-t lg:hidden",
            onBrand ? "border-white/15 bg-primary" : "border-border bg-background"
          )}
        >
          <nav className="container flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
                  onBrand
                    ? "text-white/85 hover:bg-white/10 hover:text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {t(l.key)}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              {dashHref ? (
                <Button asChild variant="brand" className="flex-1">
                  <Link href={dashHref}>{t("nav.dashboard")}</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className={cn("flex-1", onBrand && "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white")}
                  >
                    <Link href="/signup">{t("nav.signup")}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="brand"
                    className={cn("flex-1", onBrand && "bg-white text-primary hover:bg-white/90")}
                  >
                    <Link href="/login">{t("nav.login")}</Link>
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
