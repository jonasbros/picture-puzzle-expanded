"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations();

  return (
    <div className="w-full">
      <p className="text-xl font-bold text-center">{t("common.loading")}</p>
    </div>
  );
}
