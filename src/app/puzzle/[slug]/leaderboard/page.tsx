"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { getPuzzleBySlug } from "@/lib/actions/puzzles";
import { getByPuzzleId } from "@/lib/actions/local-leaderboards";

import { LocalLeaderboard } from "@/lib/types/leaderboard";
import { Puzzle } from "@/lib/types/puzzle";
import LeaderboardsTable from "@/src/app/components/LeaderboardsTable";

const Leaderboard = () => {
  const t = useTranslations();
  const { slug } = useParams();
  const [leaderboards, setLeaderboards] = useState<LocalLeaderboard[]>([]);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

  const getPuzzle = useCallback(async () => {
    const { success, data } = await getPuzzleBySlug(slug as string);

    if (success && data) {
      return data;
    }

    return null;
  }, [slug]);

  useEffect(() => {
    const getLocalLeaderboard = async () => {
      const puzzle = await getPuzzle();
      setPuzzle(puzzle);
      if (!puzzle) return;
      const leaderboard = await getByPuzzleId(puzzle.id);
      setLeaderboards(leaderboard);
    };

    getLocalLeaderboard();
  }, [getPuzzle]);

  if (!leaderboards.length && !puzzle) {
    return (
      <main className="container h-full mx-auto">
        <p className="text-lg font-bold text-center">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <main className="container min-h-full h-full mx-auto px-4">
      {puzzle && (
        <h2 className="text-xl text-center font-bold mb-4 max-w-sm mx-auto">
          <Link href={`/puzzle/${puzzle.slug}`} className="hover:text-primary">
            {`${t("common.leaderboards")} - ${puzzle.title}`}
          </Link>
        </h2>
      )}

      <div className="max-w-lg mx-auto overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <LeaderboardsTable leaderboards={leaderboards} />
      </div>
    </main>
  );
};

export default Leaderboard;
