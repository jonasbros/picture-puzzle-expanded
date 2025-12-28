import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getDailyPuzzle } from "@/lib/actions/puzzles";

const HomePuzzleOfDay = async () => {
  const t = await getTranslations();
  const { data: dailyPuzzle, error } = await getDailyPuzzle();

  if (error) return <div>{t("common.errors.generic")}</div>;
  if (!dailyPuzzle) return <div>{t("common.errors.generic")}</div>;

  return (
    <div className="w-full h-fit bg-base-300 rounded-lg p-4 shadow-md">
      <h1 className="text-2xl text-center lg:text-left font-bold uppercase mb-2">
        {t("dashboard.image_of_the_day")}
      </h1>
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-2">
        <Image
          src={dailyPuzzle.url}
          alt={dailyPuzzle.title}
          fill={true}
          objectFit="cover"
        />
      </div>

      <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-between">
        <div className="text-center lg:text-left">
          <h2 className="text-xl font-bold">{dailyPuzzle.title}</h2>
          <p>{dailyPuzzle.attribution.photographer}</p>
          <p>{dailyPuzzle.attribution.source}</p>
        </div>
        <div className="flex flex-col sm:flex-row mt-6 lg:mt-0 gap-2">
          <Link
            href={`/puzzle/${dailyPuzzle.slug}`}
            className="btn btn-primary uppercase transform transition-transform hover:scale-110 hover:shadow-lg"
          >
            {t("homepage.play_now")}
          </Link>
          <Link
            href={`/puzzle/${dailyPuzzle.slug}/leaderboard`}
            className="btn btn-primary uppercase transform transition-transform hover:scale-110 hover:shadow-lg"
          >
            {t("common.leaderboards")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePuzzleOfDay;
