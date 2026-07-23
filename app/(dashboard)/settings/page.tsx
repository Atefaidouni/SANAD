"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { LogOut, Moon, Shield, SlidersHorizontal, Sun } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";

const pwSchema = z
  .object({
    current: z.string().min(1),
    next: z.string().min(8),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "mismatch" });
type PwForm = z.infer<typeof pwSchema>;

export default function SettingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();
  const session = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const onUpdatePassword = async (data: PwForm) => {
    const res = await store.updatePassword(session!.user.id, data.current, data.next);
    if (!res.ok) {
      setError("current", { type: "server", message: t("auth.errors.wrong_password") });
      return;
    }
    toast.success(t("settings.passwordUpdated"));
    reset();
  };

  const themes = [
    { value: "light", label: t("theme.light"), icon: Sun },
    { value: "dark", label: t("theme.dark"), icon: Moon },
  ];

  return (
    <DashboardShell
      role={session?.user.role ?? "student"}
      title={t("settings.title")}
      subtitle={t("settings.subtitle")}
    >
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-5 text-primary" /> {t("settings.preferences")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t("settings.language")}</p>
              <LanguageSwitcher variant="full" />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-semibold">{t("settings.appearance")}</p>
              <div className="grid grid-cols-2 gap-2">
                {themes.map((th) => {
                  const Icon = th.icon;
                  const active = mounted && theme === th.value;
                  return (
                    <button
                      key={th.value}
                      onClick={() => setTheme(th.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all",
                        active
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-input text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      <Icon className="size-5" />
                      {th.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" /> {t("settings.security")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4">
              <FormField
                label={t("auth.currentPassword")}
                error={errors.current?.type === "server" ? errors.current.message : undefined}
              >
                <PasswordInput {...register("current")} autoComplete="current-password" />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={t("auth.newPassword")}
                  error={errors.next && t("auth.errors.password_weak")}
                >
                  <PasswordInput {...register("next")} autoComplete="new-password" />
                  <PasswordStrength value={watch("next") ?? ""} />
                </FormField>
                <FormField
                  label={t("auth.confirmPassword")}
                  error={errors.confirm && t("auth.errors.password_mismatch")}
                >
                  <PasswordInput {...register("confirm")} autoComplete="new-password" />
                </FormField>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="brand" disabled={isSubmitting}>
                  {t("settings.updatePassword")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.dangerZone")}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button
              variant="destructive"
              className="gap-2"
              onClick={async () => {
                await store.logout();
                router.push("/login");
              }}
            >
              <LogOut className="size-4 rtl-flip" />
              {t("settings.signOut")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
