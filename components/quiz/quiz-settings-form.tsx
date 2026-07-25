"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import type { QuizWithMeta } from "@/lib/types";

const schema = z.object({
  title: z.string().min(3),
  titleAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  timeLimitMin: z.string().optional(),
  passingScore: z.coerce.number().min(0).max(100),
  maxAttempts: z.string().optional(),
  availableFrom: z.string().optional(),
  availableUntil: z.string().optional(),
  shuffleQuestions: z.boolean(),
  shuffleAnswers: z.boolean(),
  showAnswersAfterSubmit: z.boolean(),
  showExplanationsAfterSubmit: z.boolean(),
});
type Values = z.infer<typeof schema>;

/** ISO string -> value a `datetime-local` input accepts. */
function toLocalInputValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function QuizSettingsForm({ quiz }: { quiz: QuizWithMeta }) {
  const { t } = useI18n();
  const store = useStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: quiz.title,
      titleAr: quiz.titleAr ?? "",
      description: quiz.description ?? "",
      descriptionAr: quiz.descriptionAr ?? "",
      timeLimitMin: quiz.timeLimitMin ? String(quiz.timeLimitMin) : "",
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts ? String(quiz.maxAttempts) : "",
      availableFrom: toLocalInputValue(quiz.availableFrom),
      availableUntil: toLocalInputValue(quiz.availableUntil),
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleAnswers: quiz.shuffleAnswers,
      showAnswersAfterSubmit: quiz.showAnswersAfterSubmit,
      showExplanationsAfterSubmit: quiz.showExplanationsAfterSubmit,
    },
  });

  const onSubmit = (v: Values) => {
    store.updateQuiz(quiz.id, {
      title: v.title,
      titleAr: v.titleAr || undefined,
      description: v.description || undefined,
      descriptionAr: v.descriptionAr || undefined,
      timeLimitMin: v.timeLimitMin ? Number(v.timeLimitMin) : null,
      passingScore: v.passingScore,
      maxAttempts: v.maxAttempts ? Number(v.maxAttempts) : null,
      availableFrom: v.availableFrom ? new Date(v.availableFrom).toISOString() : null,
      availableUntil: v.availableUntil ? new Date(v.availableUntil).toISOString() : null,
      shuffleQuestions: v.shuffleQuestions,
      shuffleAnswers: v.shuffleAnswers,
      showAnswersAfterSubmit: v.showAnswersAfterSubmit,
      showExplanationsAfterSubmit: v.showExplanationsAfterSubmit,
    });
    toast.success(t("quiz.builder.settingsSaved"));
  };

  const toggles = [
    ["shuffleQuestions", "quiz.builder.shuffleQuestions"],
    ["shuffleAnswers", "quiz.builder.shuffleAnswers"],
    ["showAnswersAfterSubmit", "quiz.builder.showAnswers"],
    ["showExplanationsAfterSubmit", "quiz.builder.showExplanations"],
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label={t("quiz.builder.title")} required>
        <Input {...register("title")} />
      </FormField>
      <FormField label={t("quiz.builder.titleAr")}>
        <Input {...register("titleAr")} dir="rtl" className="font-arabic" />
      </FormField>
      <FormField label={t("quiz.builder.description")}>
        <Textarea {...register("description")} rows={2} />
      </FormField>
      <FormField label={t("quiz.builder.descriptionAr")}>
        <Textarea {...register("descriptionAr")} rows={2} dir="rtl" className="font-arabic" />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label={t("quiz.builder.timeLimit")} hint={t("quiz.builder.untimed")}>
          <Input {...register("timeLimitMin")} type="number" min={0} dir="ltr" />
        </FormField>
        <FormField label={t("quiz.builder.passingScore")}>
          <Input {...register("passingScore")} type="number" min={0} max={100} dir="ltr" />
        </FormField>
        <FormField label={t("quiz.builder.maxAttempts")} hint={t("quiz.builder.unlimited")}>
          <Input {...register("maxAttempts")} type="number" min={1} dir="ltr" />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("quiz.builder.availableFrom")}>
          <Input {...register("availableFrom")} type="datetime-local" dir="ltr" />
        </FormField>
        <FormField label={t("quiz.builder.availableUntil")}>
          <Input {...register("availableUntil")} type="datetime-local" dir="ltr" />
        </FormField>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {toggles.map(([key, labelKey]) => (
          <label key={key} className="flex items-center justify-between rounded-xl border border-border p-3">
            <span className="text-sm font-medium">{t(labelKey)}</span>
            <Switch checked={watch(key)} onCheckedChange={(v) => setValue(key, v)} />
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
