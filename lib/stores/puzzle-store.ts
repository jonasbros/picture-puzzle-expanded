import { create } from 'zustand';

import type { Puzzle, Piece } from '@/lib/types/puzzle';

type Interval = NodeJS.Timeout | null;

interface PuzzleState {
  puzzle: Puzzle | null;
  pieces: Piece[];
  solution: Piece[];
  timeSpent: number;
  finalTimeSpent: number;
  isWin: boolean;
  progress: number;
  timeSpentItervalId: Interval;
  gameSessionSaveIntervalId: Interval;
}

interface PuzzleActions {
  setPuzzle: (puzzle: Puzzle | null) => void;
  setPieces: (pieces: Piece[]) => void;
  setSolution: (solution: Piece[]) => void;
  clearPuzzle: () => void;
  setTimeSpent: (timeSpent: number) => void;
  clearTimeSpent: () => void;
  setFinalTimeSpent: (timeSpent: number) => void;
  clearFinalTimeSpent: () => void;
  setIsWin: (isWin: boolean) => void;
  setProgress: (progress: number) => void;
  clearProgress: () => void;
  setTimeSpentItervalId: (intervalId: Interval) => void;
  clearTimeSpentItervalId: (intervalId: Interval) => void;
  setGameSessionSaveIntervalId: (intervalId: Interval) => void;
  clearGameSessionSaveIntervalId: (intervalId: Interval) => void;
}

type PuzzleStore = PuzzleState & PuzzleActions;

const usePuzzleStore = create<PuzzleStore>((set) => ({
  // State
  puzzle: null,
  pieces: [],
  solution: [],
  timeSpent: 0,
  finalTimeSpent: 0,
  isWin: false,
  progress: 0,
  timeSpentItervalId: null,
  gameSessionSaveIntervalId: null,

  // Actions
  setPuzzle: (puzzle) => set({ puzzle }),
  clearPuzzle: () => set({ puzzle: null }),

  setPieces: (pieces: Piece[]) => set({ pieces }),
  setSolution: (solution: Piece[]) => set({ solution }),

  setTimeSpent: (timeSpent) => set({ timeSpent }),
  clearTimeSpent: () => set({ timeSpent: 0 }),

  setFinalTimeSpent: (finalTimeSpent) => set({ finalTimeSpent }),
  clearFinalTimeSpent: () => set({ finalTimeSpent: 0 }),

  setIsWin: (isWin) => set({ isWin }),

  setProgress: (progress) => set({ progress }),
  clearProgress: () => set({ progress: 0 }),

  setTimeSpentItervalId: (timeSpentItervalId) => set({ timeSpentItervalId }),
  clearTimeSpentItervalId: (timeSpentItervalId: Interval) => {
    clearInterval(timeSpentItervalId as NodeJS.Timeout);
    set({ timeSpentItervalId: null });
  },

  setGameSessionSaveIntervalId: (gameSessionSaveIntervalId) =>
    set({ gameSessionSaveIntervalId }),
  clearGameSessionSaveIntervalId: (gameSessionSaveIntervalId: Interval) => {
    clearInterval(gameSessionSaveIntervalId as NodeJS.Timeout);
    set({ gameSessionSaveIntervalId: null });
  },
}));

export default usePuzzleStore;
