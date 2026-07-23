"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FullScreenLoader } from "@/components/shared/full-screen-loader";
import { useHydrated, useSession } from "@/lib/mock/use-store";
import { homePathForRole } from "@/lib/auth-helpers";
import type { Role } from "@/lib/types";

/**
 * Protects a route. Waits for store hydration before deciding (so a logged-in
 * user is never flicker-redirected on refresh). Optionally enforces a role —
 * a mismatched role is sent to its own home.
 */
export function AuthGuard({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: Role;
}) {
  const hydrated = useHydrated();
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const roleMismatch = !!requireRole && !!session && session.user.role !== requireRole;

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (roleMismatch) {
      router.replace(homePathForRole(session.user.role));
    }
  }, [hydrated, session, roleMismatch, router, pathname]);

  // Hold the UI until we can confidently render.
  if (!hydrated || !session || roleMismatch) return <FullScreenLoader />;

  return <>{children}</>;
}
