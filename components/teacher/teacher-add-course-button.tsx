"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/modal";
import { CourseForm } from "@/components/admin/course-form";
import { useI18n } from "@/lib/i18n/provider";
import { useSession } from "@/lib/mock/use-store";

/** Lets an approved teacher create a course assigned to their own email. */
export function TeacherAddCourseButton({
  variant = "brand",
}: {
  variant?: "brand" | "outline";
}) {
  const { t } = useI18n();
  const router = useRouter();
  const session = useSession();
  const [open, setOpen] = useState(false);

  if (!session) return null;
  // Do not allow teachers to add courses — only admins may create courses.
  if (session.user.role === "teacher") return null;
  const teacherName = `${session.user.firstName} ${session.user.lastName}`.trim();

  return (
    <>
      <Button variant={variant} className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {t("teacher.addCourse")}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t("teacher.addCourse")}
        description={t("teacher.addCourseSub")}
        size="lg"
      >
        <CourseForm
          mode="create"
          lockedTeacher={{ name: teacherName, email: session.user.email }}
          onDone={(id) => {
            setOpen(false);
            if (id) router.push(`/teacher/courses/${id}`);
          }}
        />
      </Modal>
    </>
  );
}
