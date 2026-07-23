"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, UserCog, UserPlus } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { homePathForRole } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["student", "teacher"]),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });
type Values = z.infer<typeof schema>;

export default function SignupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student" },
  });

  const role = watch("role");
  const password = watch("password") ?? "";

  const onSubmit = async (values: Values) => {
    const res = await store.signUp({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      role: values.role,
    });
    if (!res.ok) {
      setError("email", {
        type: "server",
        message: t(`auth.errors.${res.error}` as const),
      });
      return;
    }
    // No email verification — the account is active and signed in immediately.
    toast.success(t("auth.signupTitle"));
    router.push(homePathForRole(values.role));
  };

  const roles = [
    { value: "student" as const, label: t("roles.student"), icon: GraduationCap },
    { value: "teacher" as const, label: t("roles.teacher"), icon: UserCog },
  ];

  return (
    <AuthShell redirectIfAuthed>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.signupTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.signupSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        {/* Role */}
        <FormField label={t("auth.role")}>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const active = role === r.value;
              return (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setValue("role", r.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-input text-muted-foreground hover:border-primary/40"
                  )}
                >
                  <Icon className="size-4" />
                  {r.label}
                </button>
              );
            })}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("auth.firstName")} error={errors.firstName && t("validation.required")}>
            <Input {...register("firstName")} placeholder="Yacine" autoComplete="given-name" />
          </FormField>
          <FormField label={t("auth.lastName")} error={errors.lastName && t("validation.required")}>
            <Input {...register("lastName")} placeholder="Haddad" autoComplete="family-name" />
          </FormField>
        </div>

        <FormField
          label={t("auth.email")}
          error={
            errors.email?.type === "server"
              ? errors.email.message
              : errors.email
                ? t("validation.email")
                : undefined
          }
        >
          <Input {...register("email")} type="email" placeholder="you@email.com" dir="ltr" autoComplete="email" />
        </FormField>

        <FormField label={t("auth.password")} error={errors.password && t("auth.errors.password_weak")}>
          <PasswordInput {...register("password")} placeholder="••••••••" autoComplete="new-password" />
          <PasswordStrength value={password} />
        </FormField>

        <FormField
          label={t("auth.confirmPassword")}
          error={errors.confirmPassword && t("auth.errors.password_mismatch")}
        >
          <PasswordInput {...register("confirmPassword")} placeholder="••••••••" autoComplete="new-password" />
        </FormField>

        <Button type="submit" variant="brand" size="lg" className="w-full gap-2" disabled={isSubmitting}>
          <UserPlus className="size-4" />
          {t("auth.signupCta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {t("auth.loginCta")}
        </Link>
      </p>
    </AuthShell>
  );
}
