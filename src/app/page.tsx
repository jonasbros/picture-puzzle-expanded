import { useTranslations } from "next-intl";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
export default function Home() {
  const t = useTranslations();
  return (
    <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      {t("homepage.title")}
      <button
        className="btn btn-primary"
        onClick={async () => {
          "use server";
          signOut();
          redirect("/login");
        }}
      >
        TEST
      </button>
    </main>
  );
}
