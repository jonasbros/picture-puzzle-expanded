import { useState, useEffect, memo } from "react";
import Image from "next/image";

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
import { generateGrid, getProgress } from "@/lib/utils/puzzle-grid";
import styles from "./Grid.module.css";
import PuzzlePiece from "./PuzzlePiece";
import PostGameModal from "../components/PostGameModal";

import usePuzzleStore from "@/lib/stores/puzzle-store";

const Grid = () => {
  // Calculate grid dimensions (16 columns x 9 rows = 144 pieces)e
  const GRID_COLS = 16;
  const GRID_ROWS = 9;
  const TOTAL_PIECES = Math.floor(GRID_COLS * GRID_ROWS);

  const [pieces, setPieces] = useState<Piece[]>([]);
  const [solution, setSolution] = useState<Piece[]>([]);

  const puzzle = usePuzzleStore((state) => state.puzzle);
  const timeSpent = usePuzzleStore((state) => state.timeSpent);
  const isWin = usePuzzleStore((state) => state.isWin);
  const setIsWin = usePuzzleStore((state) => state.setIsWin);
  const setTimeSpent = usePuzzleStore((state) => state.setTimeSpent);
  const setFinalTimeSpent = usePuzzleStore((state) => state.setFinalTimeSpent);
  const timeSpentItervalId = usePuzzleStore(
    (state) => state.timeSpentItervalId
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // todo: create game session

  useEffect(() => {
    const setupGrid = () => {
      const { pieces: _pieces, solution: _solution } =
        generateGrid(TOTAL_PIECES);

      const _solutionCopy = [..._solution]; /// temporary for testing purposes
      _solutionCopy[0] = {
        id: crypto.randomUUID(),
        position: 1,
        currentPosition: 2,
      };

      _solutionCopy[1] = {
        id: crypto.randomUUID(),
        position: 2,
        currentPosition: 1,
      };

      setPieces(_solutionCopy as Piece[]); // temp
      setSolution(_solution as Piece[]);
    };

    setupGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const draggedPieceId = active.id as string;
    const targetPieceId = over.id as string;

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

      return newPieces;
    });
  }

  useEffect(() => {
    if (pieces.length > 0) {
      const result = checkWinCondition();
      if (result && !isWin) {
        handleWin();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces]);

  function checkWinCondition(piecesToCheck?: Piece[]): boolean {
    const currentPieces = piecesToCheck || pieces;
    if (currentPieces.length !== solution.length) return false;

    return currentPieces.every(
      (p, i) => p.currentPosition === solution[i].currentPosition
    );
  }

  function handleWin() {
    setFinalTimeSpent(timeSpent);
    clearInterval(timeSpentItervalId as NodeJS.Timeout);

    setTimeout(() => {
      setIsWin(true);
    }, 500);
  }

  return (
    <>
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
            <PuzzlePiece key={gridIndex} piece={piece} />
          ))}
        </div>
      </DndContext>
      <PostGameModal isOpen={isWin} piecePositions={JSON.stringify(pieces)} />
    </>
  );
};

export default Grid;
