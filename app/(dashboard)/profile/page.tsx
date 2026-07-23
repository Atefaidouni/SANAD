"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FormField } from "@/components/shared/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { useSession, useStore } from "@/lib/mock/use-store";
import { WILAYAS } from "@/lib/constants";
import { formatDate, initials } from "@/lib/utils";

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  age: string;
  wilaya: string;
}

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const store = useStore();
  const session = useSession();
  const user = store.getUser(session?.user.id);
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<ProfileForm>({
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
      age: user?.age ? String(user.age) : "",
      wilaya: user?.wilaya ?? "",
    },
  });

  if (!user) return null;

  const onSubmit = async (data: ProfileForm) => {
    await store.updateProfile(user.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      age: data.age ? Number(data.age) : null,
      wilaya: data.wilaya || null,
    });
    toast.success(t("profile.saved"));
    setEditing(false);
  };

  const info = [
    { icon: Mail, label: t("profile.email"), value: user.email },
    { icon: Phone, label: t("profile.phone"), value: user.phone || "—" },
    { icon: UserIcon, label: t("profile.age"), value: user.age ? String(user.age) : "—" },
    { icon: MapPin, label: t("profile.wilaya"), value: user.wilaya || "—" },
    { icon: CalendarDays, label: t("profile.joined"), value: formatDate(user.createdAt, locale) },
  ];

  return (
    <DashboardShell role={user.role} title={t("profile.title")} subtitle={t("profile.subtitle")}>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header card */}
        <Card className="overflow-hidden">
          <div className="h-24 bg-brand-gradient" />
          <CardContent className="-mt-12 space-y-4 p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar className="size-24 border-4 border-card shadow-soft">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="text-2xl">
                    {initials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h2 className="text-xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <Badge variant="secondary" className="mt-1">
                    {t(`roles.${user.role}`)}
                  </Badge>
                </div>
              </div>
              {!editing && (
                <Button variant="outline" className="gap-2" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" />
                  {t("profile.editProfile")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details / edit */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personalInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label={t("auth.firstName")}>
                    <Input {...register("firstName")} />
                  </FormField>
                  <FormField label={t("auth.lastName")}>
                    <Input {...register("lastName")} />
                  </FormField>
                  <FormField label={t("profile.phone")}>
                    <Input {...register("phone")} dir="ltr" />
                  </FormField>
                  <FormField label={t("profile.age")}>
                    <Input {...register("age")} type="number" min={10} max={100} />
                  </FormField>
                  <FormField label={t("profile.wilaya")} className="sm:col-span-2">
                    <Select
                      value={watch("wilaya")}
                      onValueChange={(v) => setValue("wilaya", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.wilaya")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {WILAYAS.map((w) => (
                          <SelectItem key={w} value={w}>
                            {w}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      reset();
                      setEditing(false);
                    }}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" variant="brand">
                    {t("profile.saveChanges")}
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {info.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">{item.label}</dt>
                        <dd className="truncate font-medium" dir={item.icon === Phone || item.icon === Mail ? "ltr" : undefined}>
                          {item.value}
                        </dd>
                      </div>
                    </div>
                  );
                })}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
