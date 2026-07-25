"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { FormField } from "@/components/shared/form-field";
import { ImageUpload } from "@/components/shared/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";
import type { QuizQuestion, QuizQuestionType } from "@/lib/types";

interface ChoiceDraft {
  text: string;
  textAr: string;
  isCorrect: boolean;
}

const EMPTY_CHOICES: ChoiceDraft[] = [
  { text: "", textAr: "", isCorrect: false },
  { text: "", textAr: "", isCorrect: false },
];

const TRUE_FALSE_CHOICES: ChoiceDraft[] = [
  { text: "True", textAr: "صحيح", isCorrect: true },
  { text: "False", textAr: "خطأ", isCorrect: false },
];

export function QuizQuestionEditor({ quizId }: { quizId: string }) {
  const { t } = useI18n();
  const store = useStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<QuizQuestionType>("single");
  const [text, setText] = useState("");
  const [textAr, setTextAr] = useState("");
  const [imageId, setImageId] = useState<string | null>(null);
  const [points, setPoints] = useState("1");
  const [explanation, setExplanation] = useState("");
  const [explanationAr, setExplanationAr] = useState("");
  const [choices, setChoices] = useState<ChoiceDraft[]>(EMPTY_CHOICES);
  const [saving, setSaving] = useState(false);

  const questions = store.getQuizQuestions(quizId);

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setType("single");
    setText("");
    setTextAr("");
    setImageId(null);
    setPoints("1");
    setExplanation("");
    setExplanationAr("");
    setChoices(EMPTY_CHOICES);
  };

  const onTypeChange = (next: QuizQuestionType) => {
    setType(next);
    setChoices(next === "true_false" ? TRUE_FALSE_CHOICES : EMPTY_CHOICES);
  };

  const startAdd = () => {
    resetForm();
    setFormOpen(true);
  };

  const startEdit = (q: QuizQuestion) => {
    setEditingId(q.id);
    setType(q.type);
    setText(q.text);
    setTextAr(q.textAr ?? "");
    setImageId(q.imageId ?? null);
    setPoints(String(q.points));
    setExplanation(q.explanation ?? "");
    setExplanationAr(q.explanationAr ?? "");
    setChoices(q.choices.map((c) => ({ text: c.text, textAr: c.textAr ?? "", isCorrect: !!c.isCorrect })));
    setFormOpen(true);
  };

  const toggleCorrect = (i: number) => {
    setChoices((prev) =>
      prev.map((c, idx) =>
        type === "multiple" ? (idx === i ? { ...c, isCorrect: !c.isCorrect } : c) : { ...c, isCorrect: idx === i }
      )
    );
  };

  const updateChoice = (i: number, field: "text" | "textAr", value: string) => {
    setChoices((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  };

  const addChoice = () => setChoices((prev) => [...prev, { text: "", textAr: "", isCorrect: false }]);
  const removeChoice = (i: number) => setChoices((prev) => prev.filter((_, idx) => idx !== i));

  const onSave = async () => {
    if (!text.trim()) {
      toast.error(t("quiz.builder.errorTextRequired"));
      return;
    }
    const filled = type === "true_false" ? choices : choices.filter((c) => c.text.trim());
    if (filled.length < 2) {
      toast.error(t("quiz.builder.errorMinChoices"));
      return;
    }
    if (!filled.some((c) => c.isCorrect)) {
      toast.error(t("quiz.builder.errorNeedCorrect"));
      return;
    }

    setSaving(true);
    const input = {
      type,
      text: text.trim(),
      textAr: textAr.trim() || undefined,
      imageId,
      points: Number(points) || 1,
      explanation: explanation.trim() || undefined,
      explanationAr: explanationAr.trim() || undefined,
      choices: filled.map((c) => ({ text: c.text.trim(), textAr: c.textAr.trim() || undefined, isCorrect: c.isCorrect })),
    };
    const res = editingId
      ? await store.updateQuizQuestion(editingId, input)
      : await store.addQuizQuestion(quizId, input);
    setSaving(false);

    if (!res.ok) {
      toast.error(t("quiz.errors.generic"));
      return;
    }
    toast.success(editingId ? t("quiz.builder.questionUpdated") : t("quiz.builder.questionAdded"));
    resetForm();
  };

  const onDelete = async (id: string) => {
    const res = await store.removeQuizQuestion(id);
    if (!res.ok) toast.error(t("quiz.errors.generic"));
  };

  const onMove = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const ids = questions.map((q) => q.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    store.reorderQuizQuestions(quizId, ids).then((res) => {
      if (!res.ok) toast.error(t("quiz.errors.generic"));
    });
  };

  const types: { value: QuizQuestionType; label: string }[] = [
    { value: "single", label: t("quiz.questionType.single") },
    { value: "multiple", label: t("quiz.questionType.multiple") },
    { value: "true_false", label: t("quiz.questionType.true_false") },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{t("quiz.builder.questions")}</CardTitle>
        {!formOpen && (
          <Button size="sm" variant="brand" className="gap-1.5" onClick={startAdd}>
            <Plus className="size-4" /> {t("quiz.builder.addQuestion")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && !formOpen ? (
          <EmptyState icon={Plus} title={t("quiz.builder.noQuestions")} />
        ) : (
          <ul className="space-y-2">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">{t(`quiz.questionType.${q.type}`)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {t("quiz.builder.points", { count: q.points })}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{q.text}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="size-8" disabled={i === 0} onClick={() => onMove(i, -1)}>
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={i === questions.length - 1}
                      onClick={() => onMove(i, 1)}
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => startEdit(q)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(q.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {formOpen && (
          <div className="space-y-4 rounded-xl border border-dashed border-border p-4">
            <div className="flex w-full gap-1 rounded-lg bg-muted p-1 sm:w-fit">
              {types.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTypeChange(opt.value)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
                    type === opt.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <FormField label={t("quiz.builder.questionText")}>
              <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} />
            </FormField>
            <FormField label={t("quiz.builder.questionTextAr")}>
              <Textarea value={textAr} onChange={(e) => setTextAr(e.target.value)} rows={2} dir="rtl" className="font-arabic" />
            </FormField>

            <FormField label={t("quiz.builder.image")}>
              <ImageUpload value={imageId} onChange={setImageId} />
            </FormField>

            {type === "true_false" ? (
              <FormField label={t("quiz.builder.correctAnswer")}>
                <div className="space-y-2">
                  {TRUE_FALSE_CHOICES.map((opt, i) => (
                    <label key={opt.text} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                      <input
                        type="radio"
                        name="tf-correct"
                        checked={choices[i]?.isCorrect ?? false}
                        onChange={() => toggleCorrect(i)}
                        className="size-4 accent-primary"
                      />
                      <span className="text-sm font-medium">
                        {i === 0 ? t("quiz.builder.trueLabel") : t("quiz.builder.falseLabel")}
                      </span>
                    </label>
                  ))}
                </div>
              </FormField>
            ) : (
              <FormField label={t("quiz.builder.choices")} hint={t("quiz.builder.choicesHint")}>
                <div className="space-y-2">
                  {choices.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type={type === "multiple" ? "checkbox" : "radio"}
                        name={type === "single" ? "single-correct" : undefined}
                        checked={c.isCorrect}
                        onChange={() => toggleCorrect(i)}
                        className="size-4 shrink-0 accent-primary"
                      />
                      <Input
                        value={c.text}
                        onChange={(e) => updateChoice(i, "text", e.target.value)}
                        placeholder={`${t("quiz.builder.choiceText")} ${i + 1}`}
                        className="flex-1"
                      />
                      {choices.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={() => removeChoice(i)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addChoice}>
                    <Plus className="size-3.5" /> {t("quiz.builder.addChoice")}
                  </Button>
                </div>
              </FormField>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("quiz.builder.pointsLabel")}>
                <Input value={points} onChange={(e) => setPoints(e.target.value)} type="number" min={1} dir="ltr" />
              </FormField>
            </div>

            <FormField label={t("quiz.builder.explanation")} hint={t("quiz.builder.explanationHint")}>
              <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={2} />
            </FormField>
            <FormField label={t("quiz.builder.explanationAr")}>
              <Textarea value={explanationAr} onChange={(e) => setExplanationAr(e.target.value)} rows={2} dir="rtl" className="font-arabic" />
            </FormField>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={resetForm}>
                {t("common.cancel")}
              </Button>
              <Button type="button" variant="brand" onClick={onSave} disabled={saving}>
                {editingId ? t("quiz.builder.updateQuestion") : t("quiz.builder.saveQuestion")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
