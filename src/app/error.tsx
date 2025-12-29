"use client";

import { useTranslations } from "next-intl";

export default function Error() {
  const t = useTranslations();

  return (
    <div className="block w-full h-fit">
      <p className="text-xl font-bold text-center text-error">
        {t("common.errors.generic")}
      </p>
    </div>
  );
}
