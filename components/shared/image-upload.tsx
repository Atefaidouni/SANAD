"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB, mirrors the server-side cap

/** Uploads an image immediately on selection (bytes stored server-side in
 *  Postgres via /api/uploads) and hands back the resulting upload id. */
export function ImageUpload({
  value,
  onChange,
  className,
}: {
  value?: string | null;
  onChange: (imageId: string | null) => void;
  className?: string;
}) {
  const { t } = useI18n();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("quiz.builder.imageInvalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("quiz.builder.imageTooLarge"));
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const json = await res.json().catch(() => ({ ok: false }));
      if (!json.ok) {
        toast.error(t("quiz.builder.imageUploadFailed"));
        return;
      }
      onChange(json.id as string);
    } catch {
      toast.error(t("quiz.builder.imageUploadFailed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
        }}
      />

      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/uploads/${value}`}
            alt=""
            className="h-20 w-32 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={t("common.remove")}
            className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-destructive text-white shadow-soft"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {t("quiz.builder.addImage")}
        </Button>
      )}
    </div>
  );
}
