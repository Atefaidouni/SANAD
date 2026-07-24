"use client";

import { useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { initials } from "@/lib/utils";
import type { Review } from "@/lib/types";

/** How many cards ride the marquee (kept readable; sampled from all reviews). */
const MARQUEE_MAX = 10;

function pickEvenly(arr: Review[], n: number): Review[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function ReviewCard({ review, locale }: { review: Review; locale: string }) {
  const body = locale === "ar" && review.bodyAr ? review.bodyAr : review.body;
  const [first, ...rest] = review.authorName.split(" ");
  return (
    <figure className="flex w-72 shrink-0 flex-col gap-4 rounded-3xl bg-brand-gradient p-6 text-white shadow-brand sm:w-80">
      <div className="flex items-center justify-between">
        <StarRating rating={review.rating} size="sm" />
        <Quote className="size-5 text-white/30" />
      </div>
      <blockquote className="line-clamp-4 flex-1 text-sm leading-relaxed text-white/95">
        “{body}”
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-white/20 pt-4">
        <Avatar className="size-9 border-2 border-white/30">
          <AvatarFallback className="bg-white/15 text-xs text-white">
            {initials(first, rest.join(" "))}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{review.authorName}</p>
          {review.authorRole && (
            <p className="truncate text-xs text-white/70">{review.authorRole}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

function Grid({ items, locale }: { items: Review[]; locale: string }) {
  return (
    <div className="mt-10 grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r) => (
        <ReviewCard key={r.id} review={r} locale={locale} />
      ))}
    </div>
  );
}

/** Two rows scrolling in opposite directions, looping seamlessly. */
function Marquee({ items, locale }: { items: Review[]; locale: string }) {
  const rowA = items.slice(0, Math.ceil(items.length / 2));
  const rowB = items.slice(Math.ceil(items.length / 2));
  const trackA = [...rowA, ...rowA];
  const trackB = [...rowB, ...rowB];

  return (
    <div className="mt-10 space-y-5 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="group overflow-hidden">
        <div className="flex w-max gap-5 animate-marquee group-hover:[animation-play-state:paused]">
          {trackA.map((r, i) => (
            <ReviewCard key={`a-${r.id}-${i}`} review={r} locale={locale} />
          ))}
        </div>
      </div>
      <div className="group overflow-hidden">
        <div className="flex w-max gap-5 animate-marquee [animation-direction:reverse] group-hover:[animation-play-state:paused]">
          {trackB.map((r, i) => (
            <ReviewCard key={`b-${r.id}-${i}`} review={r} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Feedback() {
  const { t, locale } = useI18n();
  const store = useStore();
  const reduce = useReducedMotion();
  const reviews = store.getReviews();
  if (reviews.length === 0) return null;

  const items = pickEvenly(reviews, MARQUEE_MAX);

  return (
    <section id="feedback" className="scroll-mt-20">
      <div className="container">
        <SectionHeading
          badge={t("marketing.feedback.badge")}
          title={t("marketing.feedback.title")}
          subtitle={t("marketing.feedback.subtitle")}
        />
      </div>

      {reduce ? (
        <div className="container">
          <Grid items={items} locale={locale} />
        </div>
      ) : (
        <Marquee items={items} locale={locale} />
      )}
    </section>
  );
}
