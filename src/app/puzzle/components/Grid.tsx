import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import type { Puzzle, Piece } from "@/lib/types/puzzle";
import { generateGrid } from "@/lib/utils/puzzle-grid";
import styles from "./Grid.module.css";
import PuzzlePiece from "./PuzzlePiece";

const Grid = ({ puzzle }: { puzzle: Puzzle }) => {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [solution, setSolution] = useState<Piece[]>([]);
  const [isWin, setIsWin] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Calculate grid dimensions (16 columns x 9 rows = 144 pieces)
  const GRID_COLS = 16;
  const GRID_ROWS = 9;
  const TOTAL_PIECES = GRID_COLS * GRID_ROWS;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const draggedPieceId = active.id as number;
    const targetPieceId = over.id as number;

    if (draggedPieceId === targetPieceId) return;

    const draggedPiece = pieces.find((p) => p.id === draggedPieceId);
    const targetPiece = pieces.find((p) => p.id === targetPieceId);

    if (!draggedPiece || !targetPiece) return;

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

      setProgress(getProgress(newPieces));

      const result = checkWinCondition(newPieces);
      if (result) {
        setIsWin(true);
        setIsGameOver(true);
        alert(1);
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

  function getProgress(currentPieces: Piece[]) {
    const total = solution.length;
    const correct = currentPieces.filter(
      (p, i) => p.currentPosition === solution[i].currentPosition
    ).length;

    return (correct / total) * 100;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`${styles.gridContainer} w-3/4 mx-auto rounded-lg border-2 border-base-content overflow-hidden select-none`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          aspectRatio: "16/9",
        }}
      >
        {pieces.map((piece, gridIndex) => (
          <PuzzlePiece key={gridIndex} piece={piece} puzzle={puzzle} />
        ))}
      </div>
    </DndContext>
  );
};

export default Grid;
