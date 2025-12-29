"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatTimeToTimeSpent } from "@/lib/utils/dayjs";

import {
  setGameSessionFromLocalStorage,
  getGameSessionFromLocalStorage,
  clearGameSessionFromLocalStorage,
} from "@/lib/utils/game-session";

import { getPuzzleBySlug } from "@/lib/actions/puzzles";

import usePuzzleStore from "@/lib/stores/puzzle-store";

import Grid from "@/src/app/puzzle/components/Grid";
import OriginalImageModal from "@/src/app/puzzle/components/OriginalImageModal";
import PostGameModal from "../components/PostGameModal";

const Puzzle = () => {
  const t = useTranslations();
  const { slug } = useParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const puzzle = usePuzzleStore((state) => state.puzzle);
  const pieces = usePuzzleStore((state) => state.pieces);
  const timeSpent = usePuzzleStore((state) => state.timeSpent);
  const gameSessionSaveIntervalId = usePuzzleStore(
    (state) => state.gameSessionSaveIntervalId
  );

  const isWin = usePuzzleStore((state) => state.isWin);
  const setPuzzle = usePuzzleStore((state) => state.setPuzzle);
  const setTimeSpent = usePuzzleStore((state) => state.setTimeSpent);
  const setTimeSpentItervalId = usePuzzleStore(
    (state) => state.setTimeSpentItervalId
  );
  const setGameSessionSaveIntervalId = usePuzzleStore(
    (state) => state.setGameSessionSaveIntervalId
  );
  const setIsWin = usePuzzleStore((state) => state.setIsWin);
  const clearTimeSpentItervalId = usePuzzleStore(
    (state) => state.clearTimeSpentItervalId
  );
  const clearGameSessionSaveIntervalId = usePuzzleStore(
    (state) => state.clearGameSessionSaveIntervalId
  );

  const getPuzzle = async () => {
    const { success, data, error } = await getPuzzleBySlug(slug as string);
    if (success && data) {
      setPuzzle(data);
    } else {
      setErrorMessage(error || "");
    }
  };

  const runGameTimer = (restoredTime: number = 0) => {
    const START_TIME = Date.now();
    const TIME_TICK = 100;

    const timeSpentInterval = setInterval(() => {
      const currentTime = restoredTime + (Date.now() - START_TIME);
      setTimeSpent(currentTime);
    }, TIME_TICK);

    setTimeSpentItervalId(timeSpentInterval);
  };

  useEffect(() => {
    resetGameStates();

    const gameSession = getGameSessionFromLocalStorage();
    const restoredTime = gameSession?.time_spent_ms || 0;

    setTimeSpent(restoredTime);
    runGameTimer(restoredTime);
    getPuzzle();

    return () => {
      clearGameSessionSaveIntervalId();
      setGameSessionSaveIntervalId(null);
      clearTimeSpentItervalId();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Setup game session saving interval when puzzle is loaded
  useEffect(() => {
    if (!puzzle || gameSessionSaveIntervalId) return;

    const GAME_SESSION_SAVE_INTERVAL = 5000;
    const _gameSessionSaveIntervalId = setInterval(() => {
      const currentTimeSpent = usePuzzleStore.getState().timeSpent;
      const currentPieces = usePuzzleStore.getState().pieces;

      setGameSessionFromLocalStorage({
        user_id: null,
        puzzle_id: puzzle.id,
        piece_positions: currentPieces,
        time_spent_ms: currentTimeSpent,
        completion_percentage: 100,
        mmr_change: 0,
        is_finished: true,
        difficulty_level: "hard",
      });
    }, GAME_SESSION_SAVE_INTERVAL);

    setGameSessionSaveIntervalId(_gameSessionSaveIntervalId);

    return () => {
      clearGameSessionSaveIntervalId();
      setGameSessionSaveIntervalId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  function resetGameStates() {
    setPuzzle(null);
    setIsWin(false);
    setTimeSpent(0);
    clearTimeSpentItervalId();
    clearGameSessionSaveIntervalId();
  }

  function handleRestart() {
    // Simply reload the page to restart the puzzle
    clearGameSessionFromLocalStorage();
    window.location.reload();
  }

  if (!puzzle)
    return (
      <main className="container flex-1 mx-auto text-center">Loading...</main>
    );
  if (errorMessage)
    return (
      <main className="container flex-1 mx-auto">Error: {errorMessage}</main>
    );

  return (
    <main className="container flex-1 px-4 mx-auto ">
      <Grid />

      <div className="flex flex-col lg:flex-row w-full lg:w-3/4 mt-4 mx-auto justify-between">
        <div className="text-center lg:text-left">
          <h2 className="text-xl font-bold">{puzzle.title}</h2>
          <h3>{puzzle.attribution.photographer}</h3>
          <a
            href={puzzle.attribution.source_url}
            className="hover:text-primary"
            target="_blank"
          >
            {puzzle.attribution.source}
          </a>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 items-center h-fit mt-6 lg:mt-0">
          <span className="font-bold">{`${t(
            "puzzle.time_spent"
          )} - ${formatTimeToTimeSpent(timeSpent)}`}</span>
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

      <PostGameModal isOpen={isWin} piecePositions={JSON.stringify(pieces)} />
    </main>
  );
};

export default Puzzle;
