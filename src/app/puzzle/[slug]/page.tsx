"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getPuzzleBySlug } from "@/lib/actions/puzzles";
import type { Puzzle } from "@/lib/types/puzzle";

import Grid from "@/src/app/puzzle/components/Grid";

const Puzzle = () => {
  const t = useTranslations();
  const { slug } = useParams();
  const [puzzle, setPuzzle] = useState<Puzzle | null | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (!puzzle) return <div>Loading...</div>;
  if (errorMessage) return <div>Error: {errorMessage}</div>;

  return (
    <main className="container h-screen mx-auto pt-24 pb-16">
      {/* TODO: TIMER AND PROGRESS */}
      <Grid puzzle={puzzle} />
      <div className="flex w-3/4 mt-4 mx-auto justify-between">
        <div>
          <h1 className="text-xl font-bold">{puzzle.title}</h1>
          <h2>{puzzle.attribution.photographer}</h2>
          <p>{puzzle.attribution.source}</p>
        </div>

        <button className="btn btn-primary uppercase transform transition-transform hover:scale-105">
          {t("puzzle.start")}
        </button>
      </div>
    </main>
  );
};

export default Puzzle;
