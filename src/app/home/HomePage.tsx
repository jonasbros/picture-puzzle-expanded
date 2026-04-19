import { Suspense } from "react";
import HomePuzzleOfDay from "../components/HomePuzzleOfDay";
import HomePreviousDays from "../components/HomePreviousDays";
import HomeLeaderboard from "../components/HomeLeaderboard";
import Loading from "../loading";

interface Props {
  page: number;
  lbPage: number;
}

export default function HomePage({ page, lbPage }: Props) {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] grid-rows-[auto_auto] gap-4">
        <div className="md:row-span-2 bg-base-300 rounded-lg p-4">
          <Suspense fallback={<Loading />}>
            <HomePuzzleOfDay />
          </Suspense>
        </div>

        <div className="bg-base-300 rounded-lg p-4">
          <Suspense fallback={<Loading />}>
            <HomePreviousDays page={page} />
          </Suspense>
        </div>

        <div className="bg-base-300 rounded-lg p-4">
          <Suspense fallback={<Loading />}>
            <HomeLeaderboard page={lbPage} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
