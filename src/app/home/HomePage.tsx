import { Suspense } from "react";
import { useTranslations } from "next-intl";
import HomePuzzleOfDay from "../components/HomePuzzleOfDay";
import Loading from "../loading";

export default function Home() {
  const t = useTranslations();

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] grid-rows-[auto_auto] gap-4">
        <div className="md:row-span-2 bg-base-300 rounded-lg p-4">
          <Suspense fallback={<Loading />}>
            <HomePuzzleOfDay />
          </Suspense>
        </div>

        <div className="bg-base-300 rounded-lg p-4">
          PREVIOUS DAYS
        </div>

        <div className="bg-base-300 rounded-lg p-4">
          LEADERBOARD PREV
        </div>
      </div>
    </main>
  );
}
