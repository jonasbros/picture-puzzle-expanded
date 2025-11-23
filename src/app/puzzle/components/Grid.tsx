import { useState, useEffect, useRef } from "react";
import { generateGrid } from "@/lib/utils/puzzle-grid";

import styles from "./Grid.module.css";

type Piece = {
  id: number;
  position: number;
  currentPosition: number;
};

const Grid = ({
  puzzleId,
  imageUrl,
}: {
  puzzleId: string;
  imageUrl: string;
}) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [solution, setSolution] = useState<Piece[]>([]);
  const gridContainer = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions (16 columns x 9 rows = 144 pieces)
  const GRID_COLS = 16;
  const GRID_ROWS = 9;
  const TOTAL_PIECES = GRID_COLS * GRID_ROWS;

  // todo: create game session

  useEffect(() => {
    const setupGrid = () => {
      const { pieces: _pieces, solution: _solution } =
        generateGrid(TOTAL_PIECES);
      setPieces(_pieces as Piece[]);
      setSolution(_solution as Piece[]);
    };

    setupGrid();
  }, [puzzleId]); // Only re-run when puzzleId changes

  return (
    <div
      ref={gridContainer}
      className={`${styles.gridContainer} w-3/4 mx-auto rounded-lg border-2 border-base-content overflow-hidden`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        aspectRatio: "16/9",
      }}
    >
      {pieces &&
        pieces.map((piece, index) => (
          <div
            key={index}
            className={`${
              styles[`puzzle-piece__position-${piece.currentPosition}`]
            } flex items-center justify-center text-xs font-mono hover:bg-pink-500 cursor-pointer transition-colors bg-size-[1600%_900%]`}
            style={{
              minHeight: "20px",
              backgroundImage: `url(${imageUrl})`,
            }}
          >
            {piece ? `${piece.currentPosition}` : index}
          </div>
        ))}
    </div>
  );
};

export default Grid;
