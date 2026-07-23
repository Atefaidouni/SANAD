"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Search } from "lucide-react";
import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";

export function JoinWithCode({
  variant = "brand",
  className,
}: {
  variant?: "brand" | "outline";
  className?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const store = useStore();
  const session = useSession();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const find = async () => {
    setLoading(true);
    const match = await store.resolveCourseByCode(code);
    setLoading(false);
    if (!match) {
      setError(t("courses.codeNotFound"));
      return;
    }
    const enrollment = store.getEnrollment(session?.user.id ?? "", match.courseId);
    if (enrollment?.status === "active") {
      router.push(`/courses/${match.courseId}`);
      return;
    }
    // Resolve → go to the join form with the code prefilled.
    router.push(`/courses/${match.courseId}/join?code=${encodeURIComponent(code.trim())}`);
  };

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setOpen(true)}>
        <KeyRound className="size-4" />
        {t("courses.joinWithCode")}
      </Button>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={t("courses.enterCode")}
        description={t("courses.enterCodeHint")}
        size="sm"
      >
        <div className="space-y-4">
          <FormField label={t("join.code")} error={error ?? undefined}>
            <Input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder={t("join.codePlaceholder")}
              dir="ltr"
              className="font-mono uppercase tracking-wider"
              onKeyDown={(e) => e.key === "Enter" && find()}
              autoFocus
            />
          </FormField>
          <Button variant="brand" className="w-full gap-2" onClick={find} disabled={code.length < 4 || loading}>
            <Search className="size-4" />
            {t("courses.findCourse")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
