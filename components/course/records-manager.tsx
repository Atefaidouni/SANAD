"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Clock, PlayCircle, Plus, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { EmptyState } from "@/components/shared/empty-state";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";

type Source = "upload" | "link";

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

  const [source, setSource] = useState<Source>("upload");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearForm = () => {
    setTitle("");
    setVideoUrl("");
    setDuration("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Admin picks a video recorded on their PC: play it via an object URL, and
  // auto-fill the title from the filename + the duration from the file metadata.
  const onPickFile = (file: File) => {
    setFileName(file.name);
    setVideoUrl(URL.createObjectURL(file));
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));

    // Read duration off the file metadata without disturbing playback.
    const probeUrl = URL.createObjectURL(file);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration) && probe.duration > 0) {
        setDuration(String(Math.max(1, Math.round(probe.duration / 60))));
      }
      URL.revokeObjectURL(probeUrl);
    };
    probe.src = probeUrl;
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
          {/* Source toggle: upload a recording from the PC, or paste a link */}
          <div className="flex w-full gap-1 rounded-lg bg-muted p-1 sm:w-fit">
            {(["upload", "link"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSource(s);
                  setVideoUrl("");
                  setFileName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
                  source === s
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`admin.records.${s}Tab`)}
              </button>
            ))}
          </div>

          {source === "upload" ? (
            <FormField label={t("admin.records.chooseFile")} hint={t("admin.records.uploadHint")}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background p-4 transition-colors hover:border-primary/50 hover:bg-accent/50",
                  fileName && "border-primary/40 bg-primary/5"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPickFile(file);
                  }}
                />
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Upload className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {fileName || t("admin.records.chooseFile")}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    MP4 · WebM · MOV
                  </span>
                </span>
              </label>
            </FormField>
          ) : (
            <FormField label={t("admin.records.videoUrl")} hint={t("admin.records.videoUrlHint")}>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                dir="ltr"
                placeholder="https://… (Zoom recording, YouTube, Drive)"
              />
            </FormField>
          )}

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
            disabled={!title.trim() || (source === "upload" && !videoUrl)}
          >
            <Plus className="size-4" />
            {t("admin.records.addLesson")}
          </Button>
        </div>
      )}
    </div>
  );
}
