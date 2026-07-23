"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { useHydrateStore } from "@/lib/mock/use-store";

function StoreHydrator() {
  useHydrateStore();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        <StoreHydrator />
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{ className: "font-sans" }}
        />
      </I18nProvider>
    </ThemeProvider>
  );
}
