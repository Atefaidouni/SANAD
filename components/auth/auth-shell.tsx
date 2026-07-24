"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Home, RotateCw } from "lucide-react";
import { SanadLogo } from "@/components/shared/sanad-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AmbientBackground } from "@/components/motion";
import { useI18n } from "@/lib/i18n/provider";
import { useHydrated, useSession } from "@/lib/mock/use-store";
import { homePathForRole } from "@/lib/auth-helpers";

export function AuthShell({
  children,
  redirectIfAuthed = false,
}: {
  children: React.ReactNode;
  redirectIfAuthed?: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const session = useSession();
  const hydrated = useHydrated();

  useEffect(() => {
    if (redirectIfAuthed && hydrated && session) {
      router.replace(homePathForRole(session.user.role));
    }
  }, [redirectIfAuthed, hydrated, session, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 py-10 sm:p-8">
      <AmbientBackground />

      <div className="absolute end-4 top-4 z-10 flex items-center gap-1 sm:end-6 sm:top-6">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl lg:grid-cols-2"
      >
        {/* Brand panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-8 text-white lg:flex">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -end-24 size-[24rem] rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative flex justify-end">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
            >
              <Home className="size-4" />
              {t("nav.home")}
            </Link>
          </div>

          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15">
                <CheckCircle2 className="size-4" />
              </span>
              <p className="text-sm font-medium">{t("auth.panelFeature1")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15">
                <RotateCw className="size-4" />
              </span>
              <p className="text-sm font-medium">{t("auth.panelFeature2")}</p>
            </div>
          </div>

          <div className="relative flex justify-center pt-6">
            <Link href="/" aria-label="Sanad">
              <SanadLogo tone="white" className="h-14" />
            </Link>
          </div>
        </aside>

        {/* Form side */}
        <main className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-6 flex justify-center lg:hidden">
            <Link href="/" aria-label="Sanad" className="text-foreground">
              <SanadLogo className="h-14" />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </main>
      </motion.div>
    </div>
  );
}
