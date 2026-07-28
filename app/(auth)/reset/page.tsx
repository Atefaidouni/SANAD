"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
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
  const store = useStore();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    // Always shows the same confirmation, whether or not the email is
    // registered — the server never reveals that either.
    await store.requestPasswordReset(values.email);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell>
        <div className="space-y-2">
          <span className="grid size-14 place-items-center rounded-2xl bg-brand-gradient-soft text-primary">
            <MailCheck className="size-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.resetSentTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.resetSentSubtitle")}</p>
        </div>
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
        <FormField label={t("auth.email")} error={errors.email ? t("validation.email") : undefined}>
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
