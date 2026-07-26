"use client";

import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";

type Review = { id: number; rating: number; body: string; name: string; role: string };

function nameInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex w-[22rem] sm:w-[25rem] shrink-0 flex-col justify-between gap-5 rounded-[24px] border border-[#F1F5F9] bg-feedback-card p-7 text-white shadow-xl">
      <div className="flex items-center gap-1">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="size-5 fill-amber-300 text-amber-300" />
        ))}
      </div>
      <blockquote className="text-sm font-medium leading-relaxed text-white/95 text-start">
        “{review.body}”
      </blockquote>
      <div className="flex items-center gap-3 pt-2">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-300/40 text-xs font-bold text-white border border-white/30">
          {nameInitials(review.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{review.name}</p>
          <p className="truncate text-xs text-teal-100/80">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Feedback() {
  const { t } = useI18n();

  const REVIEWS: Review[] = [1, 2, 3, 4].map((n) => ({
    id: n,
    rating: 5,
    body: t(`marketing.feedback.review${n}Body`),
    name: t(`marketing.feedback.review${n}Name`),
    role: t(`marketing.feedback.review${n}Role`),
  }));
  const items = [...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <section id="feedback" className="scroll-mt-20 py-10 overflow-hidden">
      <div className="container text-center space-y-3 max-w-2xl mx-auto mb-12">
        <Badge variant="secondary" className="px-3 py-1">
          {t("marketing.feedback.badge")}
        </Badge>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t("marketing.feedback.title")}
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          {t("marketing.feedback.subtitle")}
        </p>
      </div>

      {/* Infinite auto-scroll carousel — pure CSS animation so it runs
         continuously and never resets/pauses on unrelated page re-renders. */}
      <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div
          className="flex w-max animate-marquee gap-6"
          style={{ animationDuration: "28s" }}
        >
          {items.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
