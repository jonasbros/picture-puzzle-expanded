"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getPuzzleBySlug } from "@/lib/actions/puzzles";
import type { Puzzle } from "@/lib/types/puzzle";

import Grid from "@/src/app/puzzle/components/Grid";

const Puzzle = () => {
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
      <Grid puzzleId={puzzle.id} imageUrl={puzzle.url} />
    </main>
  );
};

export default Puzzle;
