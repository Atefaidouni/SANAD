"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { SUBJECTS } from "@/lib/constants";
import type { Course, Level } from "@/lib/types";

const schema = z.object({
  title: z.string().min(3),
  titleAr: z.string().optional(),
  subject: z.string().min(1),
  level: z.enum(["middle", "high", "exam"]),
  division: z.string().optional(),
  price: z.coerce.number().min(0),
  teacherName: z.string().min(2),
  teacherEmail: z.string().optional(),
  zoomUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().optional(),
  codeCount: z.coerce.number().min(1).max(200).optional(),
  isPopular: z.boolean(),
  isGoldPack: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function CourseForm({
  mode,
  course,
  onDone,
  lockedTeacher,
}: {
  mode: "create" | "edit";
  course?: Course;
  onDone: (courseId?: string) => void;
  /** When a teacher creates their own course, the teacher identity is fixed
   *  (and its fields hidden) so the course is assigned to them. */
  lockedTeacher?: { name: string; email: string };
}) {
  const { t } = useI18n();
  const store = useStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: course?.title ?? "",
      titleAr: course?.titleAr ?? "",
      subject: course?.subject ?? SUBJECTS[0],
      level: course?.level ?? "high",
      division: course?.division ?? "",
      price: course?.price ?? 3000,
      teacherName: course?.teacherName ?? lockedTeacher?.name ?? "",
      teacherEmail: course?.teacherEmail ?? lockedTeacher?.email ?? "",
      zoomUrl: course?.zoomUrl ?? "",
      thumbnail: course?.thumbnail ?? "",
      tags: course?.tags?.join(", ") ?? "",
      description: course?.description ?? "",
      codeCount: 10,
      isPopular: course?.isPopular ?? false,
      isGoldPack: course?.isGoldPack ?? false,
    },
  });

  const onSubmit = async (values: Values) => {
    const tags = values.tags
      ? values.tags.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    if (mode === "create") {
      const res = await store.createCourse({
        title: values.title,
        titleAr: values.titleAr || undefined,
        subject: values.subject,
        level: values.level,
        division: values.division || undefined,
        price: values.price,
        teacherName: values.teacherName,
        teacherEmail: values.teacherEmail || undefined,
        zoomUrl: values.zoomUrl || undefined,
        thumbnail: values.thumbnail || undefined,
        tags,
        description: values.description || undefined,
        isPopular: values.isPopular,
        isGoldPack: values.isGoldPack,
        codeCount: values.codeCount ?? 10,
      });
      if (!res.ok || !res.data?.courseId) {
        toast.error("Couldn't create the course. Please try again.");
        return;
      }
      toast.success(t("admin.form.created"));
      onDone(res.data.courseId);
    } else if (course) {
      store.updateCourse(course.id, {
        title: values.title,
        titleAr: values.titleAr || undefined,
        subject: values.subject,
        level: values.level,
        division: values.division || undefined,
        price: values.price,
        teacherName: values.teacherName,
        teacherEmail: values.teacherEmail || undefined,
        zoomUrl: values.zoomUrl || undefined,
        thumbnail: values.thumbnail || undefined,
        tags,
        description: values.description || undefined,
        isPopular: values.isPopular,
        isGoldPack: values.isGoldPack,
      });
      toast.success(t("admin.form.updated"));
      onDone(course.id);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label={t("admin.form.title")} required error={errors.title && t("validation.required")}>
        <Input {...register("title")} />
      </FormField>
      <FormField label={t("admin.form.titleAr")}>
        <Input {...register("titleAr")} dir="rtl" className="font-arabic" />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("admin.form.subject")}>
          <Select value={watch("subject")} onValueChange={(v) => setValue("subject", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t("admin.form.level")}>
          <Select value={watch("level")} onValueChange={(v) => setValue("level", v as Level)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="middle">{t("levels.middle")}</SelectItem>
              <SelectItem value="high">{t("levels.high")}</SelectItem>
              <SelectItem value="exam">{t("levels.exam")}</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label={t("admin.form.division")}>
          <Input {...register("division")} placeholder="Sciences / Letters / 4 AM" />
        </FormField>
        <FormField label={t("admin.form.price")} error={errors.price && t("validation.required")}>
          <Input {...register("price")} type="number" min={0} dir="ltr" />
        </FormField>
        {!lockedTeacher && (
          <>
            <FormField label={t("admin.form.teacher")} required error={errors.teacherName && t("validation.required")}>
              <Input {...register("teacherName")} />
            </FormField>
            <FormField
              label={t("admin.form.teacherEmail")}
              hint={t("admin.form.teacherEmailHint")}
            >
              <Input {...register("teacherEmail")} type="email" dir="ltr" placeholder="teacher@mafaz.dz" />
            </FormField>
          </>
        )}
      </div>

      <FormField label={t("admin.form.zoom")} hint={t("admin.form.zoomHint")}>
        <Input {...register("zoomUrl")} dir="ltr" placeholder="https://zoom.us/j/…" />
      </FormField>

      <FormField label={t("admin.form.thumbnail")}>
        <Input {...register("thumbnail")} dir="ltr" placeholder="https://…" />
      </FormField>
      <FormField label={t("admin.form.tags")}>
        <Input {...register("tags")} placeholder="BAC, Analysis, Probability" />
      </FormField>
      <FormField label={t("admin.form.description")}>
        <Textarea {...register("description")} rows={3} />
      </FormField>

      {mode === "create" && (
        <FormField label={t("admin.form.codeCount")} hint={t("admin.codes.subtitle")}>
          <Input {...register("codeCount")} type="number" min={1} max={200} dir="ltr" />
        </FormField>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center justify-between rounded-xl border border-border p-3">
          <span className="text-sm font-medium">{t("admin.form.popular")}</span>
          <Switch checked={watch("isPopular")} onCheckedChange={(v) => setValue("isPopular", v)} />
        </label>
        <label className="flex items-center justify-between rounded-xl border border-border p-3">
          <span className="text-sm font-medium">{t("admin.form.goldPack")}</span>
          <Switch checked={watch("isGoldPack")} onCheckedChange={(v) => setValue("isGoldPack", v)} />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={() => onDone()}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {mode === "create" ? t("admin.form.create") : t("admin.form.update")}
        </Button>
      </div>
    </form>
  );
}
