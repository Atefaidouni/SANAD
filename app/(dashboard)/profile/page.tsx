"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Bell,
  BadgeCheck,
  KeyRound,
  LogOut,
  Pencil,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FormField } from "@/components/shared/form-field";
import { Modal } from "@/components/shared/modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { initials } from "@/lib/utils";

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  age: string;
}

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const user = store.getUser(session?.user.id);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ProfileForm>({
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      age: user?.age ? String(user.age) : "",
    },
  });

  const notifications = session ? store.getNotifications(session.user.id).slice(0, 4) : [];

  if (!user) return null;

  const onSubmit = async (data: ProfileForm) => {
    await store.updateProfile(user.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      age: data.age ? Number(data.age) : null,
    });
    toast.success(t("profile.saved"));
  };

  const onSaveAvatar = async () => {
    await store.updateProfile(user.id, { avatar: avatarUrl.trim() || null });
    toast.success(t("profile.avatarUpdated"));
    setAvatarOpen(false);
  };

  const joined = new Intl.DateTimeFormat(locale === "ar" ? "ar-DZ" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(user.createdAt));

  return (
    <DashboardShell role={user.role} title={t("profile.title")} subtitle={t("profile.subtitle")}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-[19rem_1fr]">
          {/* Avatar + summary card */}
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="relative">
                <Avatar className="size-24 border-4 border-card shadow-soft">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="bg-brand-gradient text-2xl text-white">
                    {initials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => {
                    setAvatarUrl(user.avatar ?? "");
                    setAvatarOpen(true);
                  }}
                  aria-label={t("profile.changeAvatar")}
                  className="absolute -end-1 -bottom-1 grid size-8 place-items-center rounded-full border-2 border-card bg-brand-gradient text-white shadow-soft transition-transform hover:scale-105"
                >
                  <Pencil className="size-3.5" />
                </button>
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {user.email}
                </p>
              </div>

              {user.isVerified && (
                <Badge variant="success" className="gap-1">
                  <BadgeCheck className="size-3.5" />
                  {t("profile.verified")} {t(`roles.${user.role}`)}
                </Badge>
              )}

              <div className="w-full space-y-2.5 border-t border-border pt-4 text-start">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("profile.phone")}</span>
                  <span className="font-medium" dir="ltr">{user.phone || "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("profile.joined")}</span>
                  <span className="font-medium">{joined}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal information form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="size-5 text-primary" />
                {t("profile.personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("auth.firstName")}>
                    <Input {...register("firstName")} />
                  </FormField>
                  <FormField label={t("auth.lastName")}>
                    <Input {...register("lastName")} />
                  </FormField>
                </div>

                <FormField label={t("profile.email")}>
                  <Input value={user.email} disabled dir="ltr" />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("profile.phone")}>
                    <Input {...register("phone")} dir="ltr" />
                  </FormField>
                  <FormField label={t("profile.age")}>
                    <Input {...register("age")} type="number" min={10} max={100} dir="ltr" />
                  </FormField>
                </div>

                <Button type="submit" variant="brand" className="gap-2" disabled={isSubmitting}>
                  <BadgeCheck className="size-4" />
                  {t("profile.saveChanges")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
          {/* Recent notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5 text-primary" />
                {t("profile.notifications")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t("profile.notificationsSubtitle")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t("dashboard.noNotifications")}
                </p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Bell className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t(n.titleKey, n.meta)}</p>
                      <p className="text-xs text-muted-foreground">{t(n.bodyKey, n.meta)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Security — quick links into Settings, not functional here */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                {t("profile.security")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{t("profile.securitySubtitle")}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 rounded-xl border border-border p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <KeyRound className="size-4 text-muted-foreground" />
                  {t("profile.passwordRow")}
                </p>
                <p className="text-xs text-muted-foreground">{t("profile.passwordRowHint")}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/settings">{t("settings.updatePassword")}</Link>
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
                  <LogOut className="size-4 rtl-flip" />
                  {t("profile.signOutRow")}
                </p>
                <p className="text-xs text-muted-foreground">{t("profile.signOutRowHint")}</p>
                <Button asChild variant="destructive" size="sm" className="w-full gap-1.5">
                  <Link href="/settings">
                    <LogOut className="size-4 rtl-flip" />
                    {t("settings.signOut")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={avatarOpen}
        onOpenChange={setAvatarOpen}
        title={t("profile.changeAvatar")}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAvatarOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="brand" onClick={onSaveAvatar}>
              {t("profile.saveChanges")}
            </Button>
          </>
        }
      >
        <FormField label={t("profile.avatarUrlLabel")} hint={t("profile.avatarUrlHint")}>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            dir="ltr"
            placeholder="https://…"
          />
        </FormField>
      </Modal>
    </DashboardShell>
  );
}
