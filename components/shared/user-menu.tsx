"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { initials } from "@/lib/utils";
import { homePathForRole } from "@/lib/auth-helpers";

export function UserMenu() {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();
  const session = useSession();
  if (!session) return null;

  const { user } = session;
  const dashHref = homePathForRole(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="size-9 border-2 border-background shadow-sm">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback>{initials(user.firstName, user.lastName)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashHref}>
            <LayoutDashboard /> {t("nav.dashboard")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon /> {t("nav.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            await store.logout();
            router.push("/login");
          }}
        >
          <LogOut /> {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
