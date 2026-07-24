"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { useQueryParams } from "@/lib/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  PackageCheck,
  PartyPopper,
  Truck,
  User as UserIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { WILAYAS, DELIVERY_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DeliveryType } from "@/lib/types";

const schema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(6),
  wilaya: z.string().optional(),
  baladiya: z.string().optional(),
  deliveryType: z.enum(["home", "office", "pickup"]),
  code: z.string().optional(),
});
type Values = z.infer<typeof schema>;

type AccessChoice = "have" | "order" | null;
/** Local "phase" beyond the 2 form steps: 2 = joined, 3 = book ordered. */
const PHASE_JOINED = 2;
const PHASE_ORDERED = 3;

export default function JoinCoursePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const store = useStore();
  const session = useSession();
  const params = useParams();
  const id = params?.id as string | undefined;
  if (!id) return notFound();

  const course = store.getCourse(id);
  const user = store.getUser(session?.user.id);

  const [step, setStep] = useState(0); // 0 info, 1 access, 2 joined, 3 ordered
  const [accessChoice, setAccessChoice] = useState<AccessChoice>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const {
    register,
    trigger,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      wilaya: user?.wilaya ?? "",
      baladiya: user?.baladiya ?? "",
      deliveryType: "home",
      code: "",
    },
  });

  // Prefill the code + jump to the access step when arriving via "Join with code".
  const queryParams = useQueryParams();
  useEffect(() => {
    const codeParam = queryParams.get("code");
    if (codeParam) {
      setValue("code", codeParam.toUpperCase());
      setAccessChoice("have");
      setStep((s) => (s === 0 ? 1 : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  if (!course) return notFound();
  const title = locale === "ar" && course.titleAr ? course.titleAr : course.title;

  // Already enrolled? Offer the record instead of the join form.
  const existing = store.getEnrollment(session?.user.id ?? "", id);
  if (existing?.status === "active") {
    return (
      <DashboardShell role="student" title={title}>
        <div className="mx-auto max-w-lg py-10 text-center">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-secondary/15 text-secondary">
            <Check className="size-8" />
          </div>
          <h2 className="text-xl font-bold">{t("courses.joined")}</h2>
          <Button asChild variant="brand" className="mt-5 gap-2">
            <Link href={`/courses/${id}`}>
              {t("join.goToCourse")}
              <ArrowRight className="size-4 rtl-flip" />
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const next = async () => {
    if (step === 0) {
      const valid = await trigger(["fullName", "email", "phone"]);
      if (valid) setStep(1);
      return;
    }

    // Step 1 — branches on the access choice.
    const values = watch();

    if (accessChoice === "have") {
      if (!values.code || values.code.trim().length < 4) {
        setError("code", { type: "required" });
        return;
      }
      const join = await store.joinCourse({
        userId: session!.user.id,
              courseId: id,
        code: values.code,
      });
      if (!join.ok) {
        setJoinError(t(`join.errors.${join.error}` as const));
        return;
      }
      toast.success(t("join.success"));
      setStep(PHASE_JOINED);
      return;
    }

    if (accessChoice === "order") {
      let ok = true;
      if (!values.wilaya) {
        setError("wilaya", { type: "required" });
        ok = false;
      }
      if (!values.baladiya || values.baladiya.trim().length < 2) {
        setError("baladiya", { type: "required" });
        ok = false;
      }
      if (!ok) return;
      await store.requestBook({
        userId: session!.user.id,
        courseId: id,
        fullName: values.fullName,
        phone: values.phone,
        wilaya: values.wilaya!,
        baladiya: values.baladiya!,
        deliveryType: values.deliveryType,
      });
      toast.success(t("join.orderSuccess"));
      setStep(PHASE_ORDERED);
    }
  };

  const deliveryLabels: Record<DeliveryType, string> = {
    home: t("join.delivery.home"),
    office: t("join.delivery.office"),
    pickup: t("join.delivery.pickup"),
  };

  /* ----------------------------- Success: joined ----------------------------- */
  if (step === PHASE_JOINED) {
    return (
      <DashboardShell role="student" title={t("join.success")}>
        <div className="mx-auto max-w-lg py-10 text-center">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-secondary/15 text-secondary">
            <PartyPopper className="size-10" />
          </div>
          <h2 className="text-2xl font-bold">{t("join.success")}</h2>
          <p className="mt-2 text-muted-foreground">{t("join.successBody")}</p>
          <Button asChild variant="brand" size="lg" className="mt-6 gap-2">
            <Link href={`/courses/${id}`}>
              {t("join.goToCourse")}
              <ArrowRight className="size-4 rtl-flip" />
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  /* ----------------------------- Success: book ordered ----------------------------- */
  if (step === PHASE_ORDERED) {
    return (
      <DashboardShell role="student" title={t("join.orderSuccess")}>
        <div className="mx-auto max-w-lg py-10 text-center">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-primary/15 text-primary">
            <PackageCheck className="size-10" />
          </div>
          <h2 className="text-2xl font-bold">{t("join.orderSuccess")}</h2>
          <p className="mt-2 text-muted-foreground">{t("join.orderSuccessBody")}</p>
          <Button asChild variant="brand" size="lg" className="mt-6 gap-2">
            <Link href="/my-courses">
              {t("join.viewSaved")}
              <ArrowRight className="size-4 rtl-flip" />
            </Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  /* ------------------------------ Form ------------------------------- */
  const stepMeta = [
    { icon: UserIcon, label: t("join.step1") },
    { icon: KeyRound, label: t("join.step2") },
  ];

  const submitLabel =
    accessChoice === "order" ? t("join.submitOrder") : t("join.submit");

  return (
    <DashboardShell role="student" title={t("join.title", { course: title })}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link href={`/courses/${id}`}>
            <ArrowLeft className="size-4 rtl-flip" />
            {title}
          </Link>
        </Button>

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {stepMeta.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const current = i === step;
            return (
              <div key={i} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-full border-2 transition-colors",
                      done
                        ? "border-secondary bg-secondary text-white"
                        : current
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:block",
                      current ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stepMeta.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                      i < step ? "bg-secondary" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="mb-1">
              <h2 className="text-lg font-bold">{stepMeta[step].label}</h2>
              <p className="text-sm text-muted-foreground">{t("join.subtitle")}</p>
            </div>

            {/* Step 0 — information */}
            {step === 0 && (
              <div className="space-y-4">
                <FormField label={t("join.fullName")} error={errors.fullName && t("validation.required")}>
                  <Input {...register("fullName")} />
                </FormField>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("join.email")} error={errors.email && t("validation.email")}>
                    <Input {...register("email")} type="email" dir="ltr" />
                  </FormField>
                  <FormField label={t("join.phone")} error={errors.phone && t("validation.phone")}>
                    <Input {...register("phone")} dir="ltr" />
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 1 — access: have the code, or order the book */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm font-medium">{t("join.accessQuestion")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessChoice("have");
                      setJoinError(null);
                      clearErrors(["wilaya", "baladiya"]);
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-colors",
                      accessChoice === "have"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <KeyRound className="size-5 text-primary" />
                    <span className="text-sm font-semibold">{t("join.haveCode")}</span>
                    <span className="text-xs text-muted-foreground">{t("join.codeHint")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAccessChoice("order");
                      clearErrors("code");
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-colors",
                      accessChoice === "order"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    )}
                  >
                    <Truck className="size-5 text-primary" />
                    <span className="text-sm font-semibold">{t("join.needBook")}</span>
                    <span className="text-xs text-muted-foreground">{t("join.bookOrderHint")}</span>
                  </button>
                </div>

                {/* Branch: have the code */}
                {accessChoice === "have" && (
                  <div className="space-y-3 pt-2">
                    <FormField
                      label={t("join.code")}
                      hint={t("join.codeHint")}
                      error={joinError ?? (errors.code && t("validation.required"))}
                    >
                      <Input
                        {...register("code")}
                        placeholder={t("join.codePlaceholder")}
                        dir="ltr"
                        className="font-mono uppercase tracking-wider"
                        onChange={(e) => {
                          setValue("code", e.target.value.toUpperCase());
                          setJoinError(null);
                        }}
                      />
                    </FormField>
                  </div>
                )}

                {/* Branch: order the book */}
                {accessChoice === "order" && (
                  <div className="space-y-4 pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField label={t("join.wilaya")} error={errors.wilaya && t("validation.required")}>
                        <Select value={watch("wilaya")} onValueChange={(v) => setValue("wilaya", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("join.wilaya")} />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {WILAYAS.map((w) => (
                              <SelectItem key={w} value={w}>
                                {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                      <FormField label={t("join.baladiya")} error={errors.baladiya && t("validation.required")}>
                        <Input {...register("baladiya")} />
                      </FormField>
                    </div>
                    <FormField label={t("join.deliveryType")}>
                      <Select
                        value={watch("deliveryType")}
                        onValueChange={(v) => setValue("deliveryType", v as DeliveryType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_TYPES.map((d) => (
                            <SelectItem key={d} value={d}>
                              {deliveryLabels[d]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                )}
              </div>
            )}

            {/* Nav */}
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
                className="gap-1.5"
              >
                <ArrowLeft className="size-4 rtl-flip" />
                {t("common.back")}
              </Button>
              <Button
                variant="brand"
                className="gap-1.5"
                onClick={next}
                disabled={step === 1 && !accessChoice}
              >
                {step === 1 ? submitLabel : t("common.next")}
                <ArrowRight className="size-4 rtl-flip" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
