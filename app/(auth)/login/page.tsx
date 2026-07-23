"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { useQueryParams } from "@/lib/hooks";
import { homePathForRole } from "@/lib/auth-helpers";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();
  const params = useQueryParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    const res = await store.login(values.email, values.password);
    if (res.ok) {
      toast.success(t("auth.loginTitle"));
      const next = params.get("next");
      router.push(next || homePathForRole(res.data!.user.role));
      return;
    }
    setError("root", {
      message: t(`auth.errors.${res.error}` as const),
    });
  };

  return (
    <AuthShell redirectIfAuthed>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.loginTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.loginSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        {errors.root && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errors.root.message}
          </div>
        )}

        <FormField label={t("auth.email")} error={errors.email && t("validation.email")}>
          <Input
            {...register("email")}
            type="email"
            placeholder="you@email.com"
            dir="ltr"
            autoComplete="email"
          />
        </FormField>

        <FormField
          label={t("auth.password")}
          error={errors.password && t("validation.required")}
          action={
            <Link href="/reset" className="text-xs font-medium text-primary hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          }
        >
          <PasswordInput {...register("password")} placeholder="••••••••" autoComplete="current-password" />
        </FormField>

        <Button type="submit" variant="brand" size="lg" className="w-full gap-2" disabled={isSubmitting}>
          <LogIn className="size-4 rtl-flip" />
          {t("auth.loginCta")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          {t("auth.signupCta")}
        </Link>
      </p>
    </AuthShell>
  );
}
