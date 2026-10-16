"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Home, RotateCw } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AmbientBackground } from "@/components/motion";
import { useI18n } from "@/lib/i18n/provider";
import { useHydrated, useSession } from "@/lib/mock/use-store";
import { getSafeRedirect } from "@/lib/auth-helpers";
import { useQueryParams } from "@/lib/hooks";

const panelContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
};
const panelItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

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
  const params = useQueryParams();

  useEffect(() => {
    if (redirectIfAuthed && hydrated && session) {
      const next = params.get("next");
      router.replace(getSafeRedirect(next, session.user.role));
    }
  }, [redirectIfAuthed, hydrated, session, router, params]);

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
        {/* Brand panel — same gradient as the homepage hero banner */}
        <aside className="relative hidden flex-col overflow-hidden bg-hero-gradient p-8 text-white lg:flex">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <motion.div
            aria-hidden
            animate={{ opacity: [0.15, 0.35, 0.15], scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-24 -end-24 size-[24rem] rounded-full bg-white/10 blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative flex justify-end"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white/20"
            >
              <Home className="size-4" />
              {t("nav.home")}
            </Link>
          </motion.div>

          <motion.div
            variants={panelContainer}
            initial="hidden"
            animate="show"
            className="relative mt-4 space-y-4"
          >
            <motion.div variants={panelItem} className="flex items-center gap-3">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15"
              >
                <CheckCircle2 className="size-4" />
              </motion.span>
              <p className="text-sm font-medium">{t("auth.panelFeature1")}</p>
            </motion.div>
            <motion.div variants={panelItem} className="flex items-center gap-3">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15"
              >
                <RotateCw className="size-4" />
              </motion.span>
              <p className="text-sm font-medium">{t("auth.panelFeature2")}</p>
            </motion.div>
          </motion.div>

          {/* Logo centered in the remaining space below the header group. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex flex-1 items-center justify-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Logo size="lg" className="scale-[2]" />
            </motion.div>
          </motion.div>
        </aside>

        {/* Form side */}
        <main className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo size="lg" className="scale-125" />
          </div>
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </main>
      </motion.div>
    </div>
  );
}
