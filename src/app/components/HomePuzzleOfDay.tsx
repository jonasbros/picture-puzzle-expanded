"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getDailyPuzzle } from "@/lib/actions/puzzles";
import { Puzzle } from "@/lib/types/puzzle";

const HomePuzzleOfDay = () => {
  const t = useTranslations();
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null | undefined>(
    null
  );

  useEffect(() => {
    const _getDailyPuzzle = async () => {
      const { data: puzzle } = await getDailyPuzzle();
      setDailyPuzzle(puzzle);
    };

    _getDailyPuzzle();
  }, []);

  if (!dailyPuzzle) return <div>{t("common.loading")}</div>;

  return (
    <div className="block w-full h-fit bg-base-300 rounded-lg p-4 shadow-md">
      <h1 className="text-2xl font-bold uppercase mb-2">
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

      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">{dailyPuzzle.title}</h2>
          <p>{dailyPuzzle.attribution.photographer}</p>
          <p>{dailyPuzzle.attribution.source}</p>
        </div>
        <div className="flex gap-2">
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
