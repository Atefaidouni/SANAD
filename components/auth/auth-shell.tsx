"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — big logo hero */}
      <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-brand-gradient p-10 text-center text-white lg:flex">
        <div className="grid-pattern absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -bottom-24 -end-24 size-[28rem] rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8">
          <Link href="/" aria-label="Sanad" className="inline-block">
            <SanadLogo tone="white" className="h-40 max-w-full sm:h-48 lg:h-56" />
          </Link>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight">
              {t("auth.panelTitle")}
            </h2>
            <p className="mx-auto max-w-md text-white/85">
              {t("auth.panelSubtitle")}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 text-xs text-white/60">
          {t("marketing.footer.rights")}
        </div>
      </aside>

      {/* Form side */}
      <main className="relative flex flex-col overflow-hidden">
        <AmbientBackground />
        <div className="absolute end-4 top-4 flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <Link href="/" aria-label="Sanad" className="text-foreground">
                <SanadLogo className="h-16" />
              </Link>
            </div>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
