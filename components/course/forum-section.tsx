"use client";

import { useState } from "react";
import { MessageSquarePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { ForumThread } from "@/components/shared/forum-thread";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { MessageCircle } from "lucide-react";

export function ForumSection({ courseId }: { courseId: string }) {
  const { t } = useI18n();
  const store = useStore();
  const session = useSession();
  const userId = session?.user.id ?? "";
  // Only the course's assigned teacher (or an admin) may reply / resolve.
  const canManage = store.canManageCourse(userId, courseId);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const threads = store.getThreads(courseId);

  const submit = () => {
    if (!title.trim() || !body.trim()) return;
    store.askQuestion({ courseId, userId, title: title.trim(), body: body.trim() });
    setTitle("");
    setBody("");
    setOpen(false);
    toast.success(t("forum.post"));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{t("forum.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("forum.subtitle")}</p>
        </div>
        {!open && !canManage && (
          <Button variant="brand" className="gap-2" onClick={() => setOpen(true)}>
            <MessageSquarePlus className="size-4" />
            {t("forum.ask")}
          </Button>
        )}
      </div>

      {open && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <FormField label={t("forum.askTitle")}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </FormField>
            <FormField label={t("forum.askBody")}>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="brand"
                className="gap-2"
                onClick={submit}
                disabled={!title.trim() || !body.trim()}
              >
                <Send className="size-4 rtl-flip" />
                {t("forum.post")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {threads.length === 0 ? (
        <EmptyState icon={MessageCircle} title={t("forum.empty")} />
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <ForumThread
              key={thread.question.id}
              thread={thread}
              canReply={canManage}
              isAdmin={canManage}
              onReply={(replyBody) =>
                store.replyToQuestion({ questionId: thread.question.id, userId, body: replyBody })
              }
              onToggleResolved={() => store.toggleResolved(thread.question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
