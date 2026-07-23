"use client";

import { useReducedMotion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { initials } from "@/lib/utils";
import type { Review } from "@/lib/types";

/** How many cards ride the circle (kept readable; sampled from all reviews). */
const RING_MAX = 8;

function pickEvenly(arr: Review[], n: number): Review[] {
  if (arr.length <= n) return arr;
  const step = arr.length / n;
  return Array.from({ length: n }, (_, i) => arr[Math.floor(i * step)]);
}

function ReviewCard({ review, locale }: { review: Review; locale: string }) {
  const body = locale === "ar" && review.bodyAr ? review.bodyAr : review.body;
  const [first, ...rest] = review.authorName.split(" ");
  return (
    <figure className="flex w-44 flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-soft sm:w-52">
      <div className="flex items-center justify-between">
        <StarRating rating={review.rating} size="sm" />
        <Quote className="size-5 text-primary/20" />
      </div>
      <blockquote className="line-clamp-3 text-xs leading-relaxed text-foreground/90">
        “{body}”
      </blockquote>
      <figcaption className="flex items-center gap-2 border-t border-border pt-2">
        <Avatar className="size-7">
          <AvatarFallback className="text-[10px]">
            {initials(first, rest.join(" "))}
          </AvatarFallback>
        </Avatar>
        <p className="truncate text-xs font-semibold">{review.authorName}</p>
      </figcaption>
    </figure>
  );
}

function Grid({ items, locale }: { items: Review[]; locale: string }) {
  return (
    <div className="mt-10 grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((r) => (
        <ReviewCard key={r.id} review={r} locale={locale} />
      ))}
    </div>
  );
}

export function Feedback() {
  const { t, locale } = useI18n();
  const store = useStore();
  const reduce = useReducedMotion();
  const reviews = store.getReviews();
  if (reviews.length === 0) return null;

  const ring = pickEvenly(reviews, RING_MAX);
  const n = ring.length;

  return (
    <section id="feedback" className="container scroll-mt-20">
      <SectionHeading
        badge={t("marketing.feedback.badge")}
        title={t("marketing.feedback.title")}
        subtitle={t("marketing.feedback.subtitle")}
      />

      {reduce ? (
        <Grid items={ring} locale={locale} />
      ) : (
        <>
          {/* Mobile: a plain grid (a circle is too cramped on small screens). */}
          <div className="md:hidden">
            <Grid items={ring} locale={locale} />
          </div>

          {/* Desktop: cards orbit a center medallion, staying upright. */}
          <div className="group relative mx-auto mt-8 hidden aspect-square w-full max-w-[680px] md:block">
            {/* Center medallion */}
            <div className="absolute left-1/2 top-1/2 z-10 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-gradient text-white shadow-brand">
              <div className="text-center leading-tight">
                <p className="flex items-center justify-center gap-1 text-xl font-bold">
                  5.0 <Star className="size-4 fill-current" />
                </p>
                <p className="text-[10px] font-medium text-white/80">
                  {t("marketing.feedback.badge")}
                </p>
              </div>
            </div>

            {/* Rotating ring */}
            <div className="absolute inset-0 animate-orbit group-hover:[animation-play-state:paused]">
              {ring.map((review, i) => {
                const angle = (360 / n) * i;
                return (
                  <div
                    key={review.id}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(calc(-1 * min(32vw, 250px))) rotate(${-angle}deg)`,
                    }}
                  >
                    {/* Counter-spin keeps each card upright as the ring turns */}
                    <div className="animate-orbit [animation-direction:reverse] group-hover:[animation-play-state:paused]">
                      <ReviewCard review={review} locale={locale} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
