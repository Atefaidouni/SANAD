"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Mail, Phone } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="mt-12 border-t border-slate-200/80 bg-white">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              منصة تعليمية رقمية لطلاب المتوسط والثانوي في الجزائر.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900">روابط سريعة</p>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                  من نحن
                </a>
              </li>
              <li>
                <a href="#services" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                  الخدمات
                </a>
              </li>
              <li>
                <a href="#feedback" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                  آراء الطلاب
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                  تواصل
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-900">تواصل</p>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-600" />
                <span>Mafazacademy@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-600" />
                <span dir="ltr">+213 791 152 178</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          © 2026 أكاديمية سند. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
