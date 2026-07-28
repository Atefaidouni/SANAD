"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Clock, PlayCircle, Plus, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { EmptyState } from "@/components/shared/empty-state";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";

export function RecordsManager({
  courseId,
  readOnly = false,
}: {
  courseId: string;
  readOnly?: boolean;
}) {
  const { t, locale } = useI18n();
  const store = useStore();
  const lessons = store.getCourseWithMeta(courseId)?.lessons ?? [];

  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");

  const clearForm = () => {
    setTitle("");
    setVideoUrl("");
    setDuration("");
  };

  const add = () => {
    if (!title.trim()) return;
    store.addLesson(courseId, {
      title: title.trim(),
      videoUrl: videoUrl.trim() || undefined,
      durationMin: Number(duration) || 0,
    });
    clearForm();
    toast.success(t("admin.records.added"));
  };

  return (
    <div className="space-y-4">
      {lessons.length === 0 ? (
        <EmptyState icon={Video} title={t("admin.records.empty")} />
      ) : (
        <ul className="space-y-2">
          {lessons.map((l) => {
            const lTitle = locale === "ar" && l.titleAr ? l.titleAr : l.title;
            return (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <PlayCircle className="size-5" />
                </span>
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                  {l.order}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{lTitle}</p>
                  {l.videoUrl ? (
                    l.videoUrl.startsWith("blob:") ? (
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <Upload className="size-3" />
                        {t("admin.records.uploadedFile")}
                      </p>
                    ) : (
                      <a
                        href={l.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="truncate text-xs text-primary hover:underline"
                      >
                        {l.videoUrl}
                      </a>
                    )
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t("admin.records.noVideo")}
                    </p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> {l.durationMin}
                  {t("common.minutes")}
                </span>
                {!readOnly && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      store.removeLesson(l.id);
                      toast.success(t("admin.records.removed"));
                    }}
                    aria-label={t("common.remove")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {!readOnly && (
        <div className="space-y-3 rounded-xl border border-dashed border-border p-3">
          <FormField label={t("admin.records.videoUrl")} hint={t("admin.records.videoUrlHint")}>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              dir="ltr"
              placeholder="https://… (Zoom recording, YouTube, Drive)"
            />
          </FormField>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <FormField label={t("admin.records.lessonTitle")} className="flex-1">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormField>
            <FormField label={t("admin.records.duration")} className="w-full sm:w-32">
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                type="number"
                min={0}
                dir="ltr"
              />
            </FormField>
          </div>

          <Button
            variant="brand"
            className="w-full gap-1.5 sm:w-auto"
            onClick={add}
            disabled={!title.trim()}
          >
            <Plus className="size-4" />
            {t("admin.records.addLesson")}
          </Button>
        </div>
      )}
    </div>
  );
}
