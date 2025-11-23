import { useState, useEffect, useRef } from "react";

import type { Puzzle } from "@/lib/types/puzzle";
import { generateGrid } from "@/lib/utils/puzzle-grid";

import styles from "./Grid.module.css";

type Piece = {
  id: number;
  position: number;
  currentPosition: number;
};

const Grid = ({ puzzle }: { puzzle: Puzzle }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [solution, setSolution] = useState<Piece[]>([]);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

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
  }, [puzzle.id]); // Only re-run when puzzleId changes

  function startDrag(
    event: React.DragEvent<HTMLDivElement>,
    draggedPiece: Piece
  ) {
    event.dataTransfer.dropEffect = "move";
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("draggedPiece", JSON.stringify(draggedPiece));
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>, targetPiece: Piece) {
    const draggedData = event.dataTransfer.getData("draggedPiece");
    if (!draggedData) return;

    const draggedPiece = JSON.parse(draggedData);
    if (draggedPiece.id === targetPiece.id) return;

    swapPositions(draggedPiece, targetPiece);
  }

  function swapPositions(draggedPiece: Piece, targetPiece: Piece) {
    setPieces((prev) => {
      const newPieces = prev.map((p) => {
        if (p.id === draggedPiece.id) {
          return { ...p, currentPosition: targetPiece.currentPosition };
        }
        if (p.id === targetPiece.id) {
          return { ...p, currentPosition: draggedPiece.currentPosition };
        }
        return p;
      });

      const result = checkWinCondition(newPieces);
      if (result) {
        setIsWin(true);
        setIsGameOver(true);
      }

      return newPieces;
    });
  }

  function checkWinCondition(piecesToCheck?: Piece[]): boolean {
    const currentPieces = piecesToCheck || pieces;
    if (currentPieces.length !== solution.length) return false;

    return currentPieces.every(
      (p, i) => p.currentPosition === solution[i].currentPosition
    );
  }

  function processWin() {}

  function updateProgress() {}

  return (
    <div
      className={`${styles.gridContainer} w-3/4 mx-auto rounded-lg border-2 border-base-content overflow-hidden`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        aspectRatio: "16/9",
      }}
    >
      {pieces.map((piece, gridIndex) => (
        <div
          key={gridIndex}
          className={`${
            piece
              ? styles[`puzzle-piece__position-${piece.currentPosition}`]
              : ""
          } flex items-center justify-center text-xs font-mono hover:bg-pink-500 cursor-pointer transition-colors bg-size-[1600%_900%] text-black`}
          style={{
            minHeight: "20px",
            backgroundImage: piece ? `url(${puzzle.url})` : "none",
            backgroundColor: piece ? "transparent" : "#f0f0f0",
          }}
          draggable={piece ? "true" : "false"}
          onDragStart={piece ? (event) => startDrag(event, piece) : undefined}
          onDrop={(event) => {
            event.preventDefault();
            onDrop(event, piece);
          }}
          onDragEnter={(event) => event.preventDefault()}
          onDragOver={(event) => event.preventDefault()}
        >
          {piece ? piece.currentPosition : ""}
        </div>
      ))}
    </div>
  );
};

export default Grid;
