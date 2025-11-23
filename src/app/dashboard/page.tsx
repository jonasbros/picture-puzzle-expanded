import { Suspense } from "react";
import { useTranslations } from "next-intl";

import PuzzleOfDay from "./components/PuzzleOfDay";
// import { isLoggedIn } from "@/lib/actions/auth";

const Dashboard = () => {
  const t = useTranslations();
  return (
    <main>
      <div className="bento-box container min-h-screen mx-auto">
        <Suspense fallback={<div>{t("common.loading")}</div>}>
          <PuzzleOfDay />
        </Suspense>

        <div className="bento-box__area-2 bg-base-300 rounded-lg p-4">
          PREVIOUS DAYS
        </div>
        <div className="bento-box__area-3 bg-base-300 rounded-lg p-4">
          LEAEDERBOARD PREV
        </div>
        <div className="bento-box__area-4 bg-base-300 rounded-lg p-4">
          GLOBAL GAMES HISTORY PREVIEW
        </div>
        <div className="bento-box__area-5 bg-base-300 rounded-lg p-4">
          SUB / CTA
        </div>
        <div className="bento-box__area-6 bg-base-300 rounded-lg p-4">AD</div>
      </div>
    </main>
  );
};

export default Dashboard;
