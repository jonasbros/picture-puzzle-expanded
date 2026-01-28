import { useEffect } from "react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import type { Piece } from "@/lib/types/puzzle";
import { generateGrid } from "@/lib/utils/puzzle-grid";
import styles from "./Grid.module.css";
import PuzzlePiece from "./PuzzlePiece";

import usePuzzleStore from "@/lib/stores/puzzle-store";

import {
  setGameSessionFromLocalStorage,
  getGameSessionFromLocalStorage,
} from "@/lib/utils/game-session";

const Grid = () => {
  // Calculate grid dimensions (12 columns x 7 rows = 84 pieces)
  const GRID_COLS = 12;
  const GRID_ROWS = 7;
  const TOTAL_PIECES = Math.floor(GRID_COLS * GRID_ROWS);

  const puzzle = usePuzzleStore((state) => state.puzzle);
  const pieces = usePuzzleStore((state) => state.pieces);
  const solution = usePuzzleStore((state) => state.solution);
  const timeSpent = usePuzzleStore((state) => state.timeSpent);
  const isWin = usePuzzleStore((state) => state.isWin);

  const setPieces = usePuzzleStore((state) => state.setPieces);
  const setSolution = usePuzzleStore((state) => state.setSolution);
  const setIsWin = usePuzzleStore((state) => state.setIsWin);
  const setFinalTimeSpent = usePuzzleStore((state) => state.setFinalTimeSpent);
  const clearTimeSpentItervalId = usePuzzleStore(
    (state) => state.clearTimeSpentItervalId
  );
  // dndkit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const saveGameSession = () => {
    const currentTimeSpent = usePuzzleStore.getState().timeSpent;
    const currentPieces = usePuzzleStore.getState().pieces;
    const puzzle = usePuzzleStore.getState().puzzle;
    if (!puzzle) return;

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
  };

  useEffect(() => {
    const setupGrid = () => {
      const { pieces, solution } = generateGrid(TOTAL_PIECES);
      setSolution(solution);

      if (process.env.NODE_ENV !== "development") {
        // Check for saved game session first
        const gameSession = getGameSessionFromLocalStorage();
        if (
          puzzle &&
          gameSession &&
          gameSession.puzzle_id == puzzle.id &&
          gameSession.piece_positions.length > 0
        ) {
          // Restore from saved session
          setPieces(gameSession.piece_positions);
        } else {
          // Set initial scrambled pieces
          setPieces(pieces);
        }
      } else {
        const _solutionCopy = [...solution]; /// temporary for testing purposes
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

        setPieces(_solutionCopy); // dev env test state
      }
    };

    setupGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveGameSession();

    if (pieces.length > 0) {
      const result = checkWinCondition(pieces);
      if (result && !isWin) {
        handleWin();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces]);

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
    const newPieces = pieces.map((p: Piece) => {
      if (p.id === draggedPiece.id) {
        return { ...p, currentPosition: targetPiece.currentPosition };
      }
      if (p.id === targetPiece.id) {
        return { ...p, currentPosition: draggedPiece.currentPosition };
      }
      return p;
    });

    setPieces(newPieces);
  }

  function checkWinCondition(piecesToCheck?: Piece[]): boolean {
    const currentPieces = piecesToCheck || pieces;
    if (currentPieces.length !== solution.length) return false;

    return currentPieces.every(
      (p, i) => p.currentPosition === solution[i].currentPosition
    );
  }

  function handleWin() {
    setFinalTimeSpent(timeSpent);
    clearTimeSpentItervalId();

    setTimeout(() => {
      setIsWin(true);
    }, 500);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`${styles.gridContainer} w-full lg:w-3/4 mx-auto rounded-lg border-2 border-base-content overflow-hidden select-none touch-none`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          aspectRatio: "12/7",
        }}
      >
        {pieces.map((piece, gridIndex) => (
          <PuzzlePiece key={gridIndex} piece={piece} />
        ))}
      </div>
    </DndContext>
  );
};

export default Grid;
