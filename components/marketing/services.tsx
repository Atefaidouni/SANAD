"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, School, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Services() {
  const tracks = [
    {
      icon: Sparkles,
      title: "تحضير الامتحانات",
      desc: "مراجعة مركزة للامتحانات الوطنية. اختبارات تدريبية تحاكي نموذج الامتحان الحقيقي.",
      popular: true,
    },
    {
      icon: GraduationCap,
      title: "الطور الثانوي",
      desc: "المواضيع الأساسية والمنهجية. ترسيخ الفهم والمتابعة.",
      popular: false,
    },
    {
      icon: School,
      title: "الطور المتوسط",
      desc: "متابعة الدروس في أي وقت. التحضير المنهجي للامتحانات.",
      popular: false,
    },
  ];

  return (
    <section id="services" className="container scroll-mt-20 py-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          خدماتنا
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          دورات مصممة لكل مسار دراسي
        </h2>
        <p className="text-sm text-slate-600 sm:text-base leading-relaxed">
          اختر المستوى والشعبة وابدأ في المسار المناسب لأهدافك — من دروس يومية إلى تحضير جاد للامتحانات.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3 items-stretch">
        {tracks.map((track, i) => {
          const Icon = track.icon;
          return (
            <motion.div
              key={track.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              whileHover={{
                y: -6,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className={track.popular
                ? "group relative flex flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-8 text-white shadow-xl border border-emerald-500/30"
                : "group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm hover:shadow-md transition-all"
              }
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span
                    className={track.popular
                      ? "grid size-12 place-items-center rounded-2xl bg-white/20 text-white"
                      : "grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"
                    }
                  >
                    <Icon className="size-6" />
                  </span>
                  {track.popular && (
                    <Badge className="border-0 bg-emerald-400/25 px-3 py-1 text-xs text-white backdrop-blur">
                      الأكثر طلباً
                    </Badge>
                  )}
                </div>

                <h3 className={track.popular ? "text-xl font-bold text-white mb-3" : "text-xl font-bold text-slate-900 mb-3"}>
                  {track.title}
                </h3>
                <p className={track.popular ? "text-sm text-emerald-50/90 leading-relaxed mb-6" : "text-sm text-slate-600 leading-relaxed mb-6"}>
                  {track.desc}
                </p>
              </div>

              <Button
                asChild
                className={track.popular
                  ? "w-full rounded-full bg-white text-emerald-900 hover:bg-slate-50 font-semibold gap-2"
                  : "w-full rounded-full border border-slate-200 bg-white text-indigo-600 hover:bg-slate-50 font-semibold gap-2 shadow-2xs"
                }
              >
                <Link href="/signup">
                  تصفح الدورات
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
