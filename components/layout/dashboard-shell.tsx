"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Settings,
  Truck,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationsMenu } from "@/components/shared/notifications-menu";
import { UserMenu } from "@/components/shared/user-menu";
import { PageTransition, AmbientBackground } from "@/components/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useSession } from "@/lib/mock/use-store";
import { cn, initials } from "@/lib/utils";

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  exact?: boolean;
}

const STUDENT_NAV: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/courses", labelKey: "nav.browseCourses", icon: Compass, exact: true },
  { href: "/my-courses", labelKey: "nav.myCourses", icon: BookOpen },
  { href: "/profile", labelKey: "nav.profile", icon: User },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", labelKey: "nav.overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", labelKey: "nav.manageCourses", icon: BookOpen },
  { href: "/admin/teachers", labelKey: "nav.teachers", icon: GraduationCap },
  { href: "/admin/students", labelKey: "nav.students", icon: Users },
  { href: "/admin/orders", labelKey: "nav.orders", icon: Truck },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

const TEACHER_NAV: NavItem[] = [
  { href: "/teacher", labelKey: "nav.overview", icon: LayoutDashboard, exact: true },
  { href: "/teacher/courses", labelKey: "nav.myCourses", icon: BookOpen },
  { href: "/profile", labelKey: "nav.profile", icon: User },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function DashboardShell({
  role,
  title,
  subtitle,
  actions,
  children,
}: {
  role: "student" | "teacher" | "admin";
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const session = useSession();
  const reduce = useReducedMotion();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const nav =
    role === "admin" ? ADMIN_NAV : role === "teacher" ? TEACHER_NAV : STUDENT_NAV;

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  /** `scope` keeps the shared-layout pill id unique between the desktop sidebar
   *  and the (separately mounted) mobile drawer. */
  // Every role shares the same sidebar treatment: the green gradient in light
  // mode, green fading to dark navy in dark mode.
  const sidebarSurfaceClass = "sidebar-surface";

  const renderSidebar = (scope: "desktop" | "mobile") => (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center justify-between px-2 py-2">
        <Logo onBrand />
        <button
          className="text-white/80 hover:text-white lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label={t("common.close")}
        >
          <X className="size-5" />
        </button>
      </div>

      {role !== "student" && (
        <Badge className="mx-2 w-fit border-white/30 bg-white/15 text-white backdrop-blur">
          {t(`roles.${role}`)}
        </Badge>
      )}

      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {nav.map((item, i) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <motion.div
              key={item.href}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.04 * i + 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "font-semibold text-slate-900"
                    : "font-medium text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`nav-pill-${scope}`}
                    className="absolute inset-0 -z-0 rounded-xl bg-white shadow-soft"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 size-[1.15rem] transition-transform group-hover:scale-110" />
                <span className="relative z-10">{t(item.labelKey)}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {session && (
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 ring-2 ring-white/30">
              <AvatarImage src={session.user.avatar ?? undefined} />
              <AvatarFallback>
                {initials(session.user.firstName, session.user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="truncate text-xs text-white/70">
                {session.user.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-background">
      <AmbientBackground />

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-30 hidden w-[17rem] lg:block",
          sidebarSurfaceClass
        )}
      >
        {renderSidebar("desktop")}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={reduce ? { opacity: 0 } : { x: locale === "ar" ? "100%" : "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: locale === "ar" ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className={cn("absolute inset-y-0 start-0 w-[17rem]", sidebarSurfaceClass)}
            >
              {renderSidebar("mobile")}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="lg:ps-[17rem]">
        {/* Top bar */}
        <header
          className={cn(
            "sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 transition-all duration-300 sm:px-6",
            scrolled
              ? "border-border bg-background/80 shadow-soft backdrop-blur-md"
              : "border-transparent bg-background/60 backdrop-blur-sm"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("common.search")}
          >
            <Menu className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            {title && (
              <h1 className="truncate text-base font-semibold leading-tight sm:text-lg">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {actions}
            <LanguageSwitcher />
            <ThemeToggle />
            <NotificationsMenu />
            <UserMenu />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
