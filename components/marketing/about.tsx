"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Target, RefreshCw, BookOpen, Award, Layers } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function About() {
  const { t } = useI18n();

  const features = [
    { icon: RefreshCw, title: "متابعة مستمرة" },
    { icon: Target, title: "أهداف واضحة" },
    { icon: BookOpen, title: "دروس سهلة" },
    { icon: ShieldCheck, title: "دعم آمن" },
  ];

  return (
    <section id="about" className="container scroll-mt-20 py-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left Side: Student Journey Widget (Reference Image 0) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-sm">
            <h3 className="mb-5 text-center text-lg font-bold text-slate-900">
              رحلة الطالب
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="size-5" />
                </div>
                <span className="text-sm font-semibold text-slate-800">مراجعة درس اليوم</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </div>
                <span className="text-sm font-semibold text-slate-800">إكمال مجموعة التمارين</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Award className="size-5" />
                </div>
                <span className="text-sm font-semibold text-slate-800">استلام الإنجاز</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Copy & 4 Features Grid */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              ABOUT MAFAZ
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              دعم تعليمي يتابع كل طالب
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            <p>
              <strong className="text-slate-900 font-bold">سند هي</strong> منصة تعليمية رقمية موجهة لتلاميذ التعليم المتوسط والثانوي في الجزائر، تهدف إلى دعم التحصيل الدراسي وتوفير فرص النجاح من خلال محتوى أكاديمي عالي الجودة، يقدّمه أساتذة متخصصون وفق منهجية منظمة.
            </p>
            <p>
              تعمل منصة <strong className="text-slate-900 font-bold">سند</strong> على تقديم محتوى تعليمي موثوق ومبسط، يعتمد على مناهج رسمية بأساليب تعليم حديثة، مما يضمن بيئة تعلم فعّالة ومستمرة.
            </p>
          </div>

          {/* 4 Feature Pills Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-xs"
                >
                  <div className="grid size-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{feat.title}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
