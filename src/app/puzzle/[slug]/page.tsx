"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { getPuzzleBySlug } from "@/lib/actions/puzzles";
import type { Puzzle } from "@/lib/types/puzzle";

import Grid from "@/src/app/puzzle/components/Grid";
import OriginalImageModal from "@/src/app/puzzle/components/OriginalImageModal";

const START_TIME = Date.now();

const Puzzle = () => {
  const t = useTranslations();
  const { slug } = useParams();
  const [puzzle, setPuzzle] = useState<Puzzle | null | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);

  dayjs.extend(duration);

  useEffect(() => {
    const search = async () => {
      const { success, data, error } = await getPuzzleBySlug(slug as string);
      if (success) {
        setPuzzle(data);
      } else {
        setErrorMessage(error || "");
      }
    };

    search();
  }, [slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Date.now() - START_TIME);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  function handleRestart() {
    // Simply reload the page to restart the puzzle
    window.location.reload();
  }

  if (!puzzle)
    return (
      <main className="container h-full mx-auto pb-16 text-center">
        Loading...
      </main>
    );
  if (errorMessage)
    return (
      <main className="container h-full mx-auto pb-16">
        Error: {errorMessage}
      </main>
    );

  return (
    <main className="container h-full mx-auto pb-16">
      {/* TODO: TIMER AND PROGRESS */}
      <Grid puzzle={puzzle} />
      <div className="flex w-3/4 mt-4 mx-auto justify-between">
        <div>
          <h2 className="text-xl font-bold">{puzzle.title}</h2>
          <h3>{puzzle.attribution.photographer}</h3>
          <p>{puzzle.attribution.source}</p>
        </div>

        <div className="flex gap-2 items-center h-fit">
          <span className="font-bold">{`${t("puzzle.time_spent")} - ${dayjs
            .duration(timeSpent)
            .format("HH:mm:ss.SSS")}`}</span>
          <OriginalImageModal imageUrl={puzzle.url} altText={puzzle.title} />

          <div className="dropdown dropdown-top dropdown-end">
            <button className="btn btn-primary uppercase transform transition-transform hover:scale-105">
              {t("puzzle.restart")}
            </button>
            <ul
              tabIndex={-1}
              className="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-sm"
            >
              <li>
                <button className="text-error" onClick={() => handleRestart()}>
                  {t("puzzle.are_you_sure")}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Puzzle;
