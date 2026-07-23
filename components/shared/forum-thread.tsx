"use client";

import { useState } from "react";
import { CheckCircle2, CornerDownRight, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { cn, initials, timeAgo } from "@/lib/utils";
import type { QuestionThread } from "@/lib/types";

interface ForumThreadProps {
  thread: QuestionThread;
  canReply?: boolean;
  isAdmin?: boolean;
  onReply?: (body: string) => void;
  onToggleResolved?: () => void;
}

export function ForumThread({
  thread,
  canReply = true,
  isAdmin = false,
  onReply,
  onToggleResolved,
}: ForumThreadProps) {
  const { t, locale } = useI18n();
  const [body, setBody] = useState("");
  const [open, setOpen] = useState(false);
  const { question, author, replies } = thread;

  const submit = () => {
    if (!body.trim()) return;
    onReply?.(body.trim());
    setBody("");
    setOpen(false);
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar className="size-9">
          <AvatarImage src={author?.avatar ?? undefined} />
          <AvatarFallback>{initials(author?.firstName ?? "?", author?.lastName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold leading-snug">{question.title}</h3>
            {question.resolved && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="size-3" /> {t("forum.resolved")}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("forum.askedBy", { name: `${author?.firstName} ${author?.lastName}` })} ·{" "}
            {timeAgo(question.createdAt, locale)}
          </p>
          <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
            {question.body}
          </p>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <ul className="mt-4 space-y-3 border-s-2 border-border ps-4">
          {replies.map(({ reply, author: ra }) => {
            const isTeacher = ra?.role === "admin";
            return (
              <li key={reply.id} className="flex items-start gap-3">
                <Avatar className="size-7">
                  <AvatarImage src={ra?.avatar ?? undefined} />
                  <AvatarFallback className="text-[10px]">
                    {initials(ra?.firstName ?? "?", ra?.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border p-3",
                    isTeacher
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-background"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {ra?.firstName} {ra?.lastName}
                    </span>
                    {isTeacher && (
                      <Badge variant="brand" className="text-[10px]">
                        {t("forum.teacherBadge")}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(reply.createdAt, locale)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">
                    {reply.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canReply && !open && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <CornerDownRight className="size-4 rtl-flip" />
            {t("forum.reply")}
          </Button>
        )}
        {isAdmin && onToggleResolved && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={onToggleResolved}
          >
            <CheckCircle2 className="size-4" />
            {question.resolved ? t("forum.resolved") : t("forum.markResolved")}
          </Button>
        )}
        {replies.length === 0 && !open && (
          <span className="text-xs text-muted-foreground">{t("forum.noReplies")}</span>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("forum.replyPlaceholder")}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button size="sm" className="gap-1.5" onClick={submit} disabled={!body.trim()}>
              <Send className="size-4 rtl-flip" />
              {t("forum.sendReply")}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}
