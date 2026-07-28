"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { AmbientBackground } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";
import { useStore } from "@/lib/mock/use-store";
import { cn } from "@/lib/utils";

type Review = { id: string; rating: number; body: string; name: string; role: string };

/** 8 cards, evenly spaced 45° apart around the ring at one consistent radius
 *  — no more per-card radius/angle jitter, which was what made the previous
 *  layout look uneven. Only the tilt varies (and only slightly), for a touch
 *  of the "pinned to a board" character without breaking the even spacing.
 *  Radius is in rem from the center: `translate()`'s `%` resolves against the
 *  translated element's OWN box, not the container, so a fixed unit is used
 *  instead of a percentage. */
const RING_RADIUS = 14.5;
const CARD_COUNT = 8;
const SLOTS = Array.from({ length: CARD_COUNT }, (_, i) => ({
  angle: (360 / CARD_COUNT) * i,
  radius: RING_RADIUS,
  tilt: i % 2 === 0 ? -4 : 4,
}));

const ORBIT_DURATION = 90; // seconds per full revolution — slow and calm, not dizzying

function nameInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function OrbitCard({ review, angle, radius, tilt, index }: { review: Review; angle: number; radius: number; tilt: number; index: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 size-0"
      animate={{ rotate: [angle, angle + 360] }}
      transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
    >
      {/* Carries the card out to its ring position, then hands off to the
         counter-rotation below so the card itself never spins. Both layers
         animate by the SAME relative +360°, starting from opposite offsets,
         so their sum is always 0 — the card orbits without ever spinning. */}
      <div className="absolute left-0 top-0" style={{ transform: `translate(-50%, -50%) translateY(-${radius}rem)` }}>
        <motion.div
          animate={{ rotate: [-angle, -angle - 360] }}
          transition={{ duration: ORBIT_DURATION, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
            style={{ rotate: tilt }}
            className={cn(
              "relative flex w-[15rem] sm:w-[17rem] flex-col justify-between gap-3 overflow-hidden rounded-[20px]",
              "border border-white/10 bg-feedback-card p-5 text-white shadow-xl transition-shadow duration-300 hover:shadow-2xl"
            )}
          >
            <Quote className="pointer-events-none absolute -top-2 end-3 size-12 rotate-180 text-white/10" />
            <div className="relative flex items-center gap-0.5">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <blockquote className="relative line-clamp-3 text-xs font-medium leading-relaxed text-white/95 text-start sm:text-sm">
              “{review.body}”
            </blockquote>
            <div className="relative flex items-center gap-2.5 pt-1">
              <div className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-[0.65rem] font-bold text-white ring-1 ring-inset ring-white/30">
                {nameInitials(review.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white sm:text-sm">{review.name}</p>
                <p className="truncate text-[0.65rem] text-white/70 sm:text-xs">{review.role}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Simple fallback row for small screens, where a circular orbit has no room
 *  to breathe — same content, plain continuous horizontal scroll instead. */
function MobileRow({ rowReviews }: { rowReviews: Review[] }) {
  const items = [...rowReviews, ...rowReviews];
  return (
    <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] lg:hidden">
      <div className="flex w-max animate-marquee gap-5" style={{ animationDuration: "36s" }}>
        {items.map((review, i) => (
          <div
            key={`${review.id}-${i}`}
            className="flex w-[19rem] shrink-0 flex-col justify-between gap-4 rounded-[20px] border border-white/10 bg-feedback-card p-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: review.rating }).map((_, i2) => (
                <Star key={i2} className="size-4 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <blockquote className="text-sm font-medium leading-relaxed text-white/95 text-start">
              “{review.body}”
            </blockquote>
            <div className="flex items-center gap-3 pt-1">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-bold text-white ring-1 ring-inset ring-white/30">
                {nameInitials(review.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{review.name}</p>
                <p className="truncate text-xs text-white/70">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Feedback() {
  const { t, locale } = useI18n();
  const store = useStore();

  const allReviews: Review[] = store.getReviews().map((r) => ({
    id: r.id,
    rating: r.rating,
    body: locale === "ar" && r.bodyAr ? r.bodyAr : r.body,
    name: r.authorName,
    role: r.authorRole ?? "",
  }));

  // Enough voices to fill the ring without crowding it.
  const ringReviews = allReviews.slice(0, SLOTS.length);

  return (
    <section id="feedback" className="relative scroll-mt-20 overflow-hidden py-10">
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="container relative mx-auto mb-8 max-w-2xl space-y-3 text-center"
      >
        <Badge variant="secondary" className="px-3 py-1">
          {t("marketing.feedback.badge")}
        </Badge>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {t("marketing.feedback.title")}
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
          {t("marketing.feedback.subtitle")}
        </p>
      </motion.div>

      {/* Desktop: cards orbit slowly around a central rating badge, each
         counter-rotating so it stays upright and readable while its position
         continuously revolves — a literal "around" motion. */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[46rem] lg:block">
        {ringReviews.map((review, i) => {
          const slot = SLOTS[i % SLOTS.length];
          return (
            <OrbitCard
              key={review.id}
              review={review}
              angle={slot.angle}
              radius={slot.radius}
              tilt={slot.tilt}
              index={i}
            />
          );
        })}
      </div>

      {/* Mobile / tablet: continuous horizontal scroll instead. */}
      <MobileRow rowReviews={allReviews} />
    </section>
  );
}
