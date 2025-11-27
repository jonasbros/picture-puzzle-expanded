"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dayjs from "@/lib/utils/dayjs";

import { getPuzzleBySlug } from "@/lib/actions/puzzles";
import type { Puzzle } from "@/lib/types/puzzle";

import usePuzzleStore from "@/lib/stores/puzzle-store";

import {
  createGameSession,
  updateGameSession,
  completeGameSession,
  abandonGameSession,
} from "@/lib/actions/game-sessions";

import Grid from "@/src/app/puzzle/components/Grid";
import OriginalImageModal from "@/src/app/puzzle/components/OriginalImageModal";

const Puzzle = () => {
  const t = useTranslations();
  const { slug } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const puzzle = usePuzzleStore((state) => state.puzzle);
  const timeSpent = usePuzzleStore((state) => state.timeSpent);
  const isWin = usePuzzleStore((state) => state.isWin);
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);
  const setTimeSpent = usePuzzleStore((state) => state.setTimeSpent);
  const setTimeSpentItervalId = usePuzzleStore(
    (state) => state.setTimeSpentItervalId
  );

  useEffect(() => {
    const search = async () => {
      const { success, data, error } = await getPuzzleBySlug(slug as string);
      if (success && data) {
        setPuzzle(data);
      } else {
        setErrorMessage(error || "");
      }
    };

    search();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    const START_TIME = Date.now();
    const timeSpentInterval = setInterval(() => {
      setTimeSpent(Date.now() - START_TIME);
    }, 100);

    setTimeSpentItervalId(timeSpentInterval);

    return () => {
      setTimeSpent(0);

      if (timeSpentInterval) {
        clearInterval(timeSpentInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Grid />

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
              {isWin ? t("puzzle.new_game") : t("puzzle.restart")}
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
