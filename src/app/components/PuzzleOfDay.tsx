"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { getDailyPuzzle } from "@/lib/actions/puzzles";
import { Puzzle } from "@/lib/types/puzzle";

const PuzzleOfDay = () => {
  const t = useTranslations();
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null | undefined>(
    null
  );

  useEffect(() => {
    const _getDailyPuzzle = async () => {
      const { data: puzzle } = await getDailyPuzzle();
      console.log(puzzle);
      setDailyPuzzle(puzzle);
    };

    _getDailyPuzzle();
  }, []);

  return (
    <div className="bento-box__area-1 bg-base-300 rounded-lg p-4">
      <h1 className="text-2xl font-bold uppercase mb-2">
        {t("dashboard.puzzle_of_the_day")}
      </h1>
      {dailyPuzzle && (
        <>
          <div className="relative w-full h-3/4 rounded-lg overflow-hidden mb-2">
            <Image
              src={dailyPuzzle.url}
              alt={dailyPuzzle.title}
              fill={true}
              objectFit="cover"
            />
          </div>
          <p>{dailyPuzzle.title}</p>
          <p>{dailyPuzzle.attribution.photographer}</p>
          <p>{dailyPuzzle.attribution.source}</p>
        </>
      )}
    </div>
  );
};

export default PuzzleOfDay;
