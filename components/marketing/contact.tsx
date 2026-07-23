"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { useI18n } from "@/lib/i18n/provider";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  message: z.string().min(5),
});

type ContactValues = z.infer<typeof schema>;

export function Contact() {
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: ContactValues) => {
    // Mock: pretend to send.
    await new Promise((r) => setTimeout(r, 600));
    toast.success(t("marketing.contact.success"));
    reset();
  };

  const info = [
    { icon: Mail, label: t("marketing.contact.emailLabel"), value: "hello@mafaz.dz" },
    { icon: Phone, label: t("marketing.contact.phoneLabel"), value: "+213 661 00 00 00" },
    { icon: MapPin, label: t("marketing.contact.addressLabel"), value: t("marketing.contact.address") },
  ];

  return (
    <section id="contact" className="container scroll-mt-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Badge variant="secondary" className="px-3 py-1">
            {t("marketing.contact.badge")}
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("marketing.contact.title")}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            {t("marketing.contact.subtitle")}
          </p>

          <ul className="space-y-4 pt-2">
            {info.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-semibold" dir="ltr">
                      {item.value}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label={t("marketing.contact.formName")}
              error={errors.name && t("validation.required")}
            >
              <Input {...register("name")} placeholder="Yacine Haddad" />
            </FormField>
            <FormField
              label={t("marketing.contact.formPhone")}
              error={errors.phone && t("validation.phone")}
            >
              <Input {...register("phone")} placeholder="+213 …" dir="ltr" />
            </FormField>
          </div>
          <FormField
            label={t("marketing.contact.formEmail")}
            error={errors.email && t("validation.email")}
          >
            <Input {...register("email")} type="email" placeholder="you@email.com" dir="ltr" />
          </FormField>
          <FormField
            label={t("marketing.contact.formMessage")}
            error={errors.message && t("validation.required")}
          >
            <Textarea {...register("message")} rows={4} className="min-h-[120px]" />
          </FormField>
          <Button type="submit" variant="brand" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            <Send className="size-4 rtl-flip" />
            {t("marketing.contact.formSubmit")}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
