"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/modal";
import { CourseForm } from "./course-form";
import { useI18n } from "@/lib/i18n/provider";

export function AddCourseButton({
  variant = "brand",
}: {
  variant?: "brand" | "outline";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {t("admin.addCourse")}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t("admin.addCourse")}
        description={t("admin.codes.subtitle")}
        size="lg"
      >
        <CourseForm
          mode="create"
          onDone={(id) => {
            setOpen(false);
            if (id) router.push(`/admin/courses/${id}`);
          }}
        />
      </Modal>
    </>
  );
}
