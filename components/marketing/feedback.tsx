"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    rating: 5,
    body: "MAFAZ helped me organize my study week. The live support makes it easy to ask questions when I get stuck.",
    name: "لينا م.",
    role: "Middle school student",
  },
  {
    id: 2,
    rating: 5,
    body: "MAFAZ helped me organize my study week. The live support makes it easy to ask questions when I get stuck.",
    name: "أحمد ك.",
    role: "High school student",
  },
  {
    id: 3,
    rating: 5,
    body: "MAFAZ helped me organize my study week. The live support makes it easy to ask questions when I get stuck.",
    name: "مريم ب.",
    role: "Middle school student",
  },
  {
    id: 4,
    rating: 5,
    body: "MAFAZ helped me organize my study week. The live support makes it easy to ask questions when I get stuck.",
    name: "ياسين ط.",
    role: "Baccalaureate candidate",
  },
];

function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  return (
    <div className="flex w-[22rem] sm:w-[25rem] shrink-0 flex-col justify-between gap-5 rounded-[24px] border border-[#F1F5F9] bg-feedback-card p-7 text-white shadow-xl">
      <div className="flex items-center gap-1">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="size-5 fill-amber-300 text-amber-300" />
        ))}
      </div>
      <blockquote className="text-sm font-medium leading-relaxed text-white/95 dir-ltr text-start">
        “{review.body}”
      </blockquote>
      <div className="flex items-center gap-3 pt-2">
        <div className="grid size-10 place-items-center rounded-full bg-teal-300/40 text-sm font-bold text-white border border-white/30">
          {review.name.charAt(0)}
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
  const items = [...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <section id="feedback" className="scroll-mt-20 py-10 overflow-hidden">
      <div className="container text-center space-y-3 max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          آراء الطلاب
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          الطلاب يشعرون بثقة أكبر بعد كل درس
        </h2>
        <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
          تقدم حقيقي يأتي من شرح واضح، أساتذة قريبين، ودورات تسمح للطالب بمتابعة مستواه بالوتيرة المناسبة.
        </p>
      </div>

      {/* Infinite Auto-Scroll Carousel */}
      <div className="relative w-full overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 25,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-6 w-max"
        >
          {items.map((review, i) => (
            <ReviewCard key={`${review.id}-${i}`} review={review} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
