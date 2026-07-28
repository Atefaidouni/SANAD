"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { useQueryParams } from "@/lib/hooks";

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });
type Values = z.infer<typeof schema>;

export default function NewPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();
  const params = useQueryParams();
  const [mounted, setMounted] = useState(false);
  const token = params.get("token") ?? "";

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const password = watch("password") ?? "";

  const onSubmit = async (values: Values) => {
    const res = await store.confirmPasswordReset(token, values.password);
    if (!res.ok) {
      toast.error(t(`auth.errors.${res.error}` as const));
      return;
    }
    toast.success(t("settings.passwordUpdated"));
    router.push("/login");
  };

  return (
    <AuthShell>
      <div className="space-y-2">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-gradient-soft text-primary">
          <Lock className="size-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.newPasswordTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.newPasswordSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label={t("auth.newPassword")} error={errors.password && t("auth.errors.password_weak")}>
          <PasswordInput {...register("password")} placeholder="••••••••" autoComplete="new-password" />
          <PasswordStrength value={password} />
        </FormField>
        <FormField
          label={t("auth.confirmPassword")}
          error={errors.confirmPassword && t("auth.errors.password_mismatch")}
        >
          <PasswordInput {...register("confirmPassword")} placeholder="••••••••" autoComplete="new-password" />
        </FormField>
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !mounted || !token}
        >
          {t("auth.setPasswordCta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl-flip" />
          {t("auth.backToLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
