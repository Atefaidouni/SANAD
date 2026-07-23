"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

const schema = z.object({ email: z.string().email() });
type Values = z.infer<typeof schema>;

export default function ResetPage() {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) => {
    const user = store.getUserByEmail(values.email);
    if (!user) {
      setError("email", { type: "server", message: t("auth.errors.user_not_found") });
      return;
    }
    // No emailed code — go straight to setting a new password.
    router.push(`/reset/new?email=${encodeURIComponent(values.email)}`);
  };

  return (
    <AuthShell>
      <div className="space-y-2">
        <span className="grid size-14 place-items-center rounded-2xl bg-brand-gradient-soft text-primary">
          <KeyRound className="size-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">{t("auth.resetTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("auth.resetSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
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
          <Input {...register("email")} type="email" placeholder="you@email.com" dir="ltr" />
        </FormField>
        <Button type="submit" variant="brand" size="lg" className="w-full" disabled={isSubmitting}>
          {t("auth.resetCta")}
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
