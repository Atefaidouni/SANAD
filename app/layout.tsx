import type { Metadata, Viewport } from "next";
import { Baloo_2, Baloo_Bhaijaan_2 } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

// Latin — Baloo 2 (rounded display family).
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-latin",
  display: "swap",
});

// Arabic — Baloo Bhaijaan 2 (the Baloo family's Arabic counterpart; Baloo 2
// itself ships no Arabic glyphs).
const balooArabic = Baloo_Bhaijaan_2({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sanad Academy — Your Ultimate Learning Experience",
    template: "%s · Sanad Academy",
  },
  description:
    "Sanad Academy (سند) — a bilingual learning platform for Algerian middle- and high-school students. Personalized journeys, live revision sessions and secret-code enrollment.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Apply persisted locale direction before paint to avoid an RTL flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var l=localStorage.getItem('sanad.locale');if(l==='ar'){var d=document.documentElement;d.lang='ar';d.dir='rtl';d.style.setProperty('--brand-angle','225deg');}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${baloo.variable} ${balooArabic.variable} font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
