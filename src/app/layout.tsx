import { NextIntlClientProvider } from "next-intl";

import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Providers from "./providers";
import "./globals.css";

import ThemeSwitch from "./components/base/ThemeSwitch";
// import GuestNavbar from "./components/base/GuestNavbar";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKRAMBOL",
  description: "Scrambled image puzzle game. How fast can you solve them?",
  other: { "google-adsense-account": "ca-pub-3150400026189305" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations();

  return (
    <html lang="en">
      <body className={`${notoSans.variable} antialiased`}>
        <Providers>
          {" "}
          <NextIntlClientProvider>
            <div className="fixed top-6 right-6 flex gap-4">
              {/* <span title="Coming Soon!" className="cursor-pointer">
              {t("puzzle.leaderboards")}
            </span> */}
              <ThemeSwitch />
            </div>

            {/* <GuestNavbar /> */}
            <div className="flex flex-col min-h-screen items-center justify-start">
              <Link href="/" className="pt-16 hover:text-primary">
                <h1 className="text-4xl font-bold uppercase mb-6">
                  🐣 {t("common.brand")} 🐣
                </h1>
              </Link>

              {children}
            </div>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
