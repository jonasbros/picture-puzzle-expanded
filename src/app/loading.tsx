"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations();

  return (
    <div className="block w-full h-fit bg-base-300 rounded-lg p-4 shadow-md">
      <p className="text-xl font-bold text-center">{t("common.loading")}</p>
    </div>
  );
}
