import { create } from "zustand";

import type { Puzzle } from "@/lib/types/puzzle";

type Interval = NodeJS.Timeout | null;

interface PuzzleState {
  puzzle: Puzzle | null;
  timeSpent: number;
  finalTimeSpent: number;
  isWin: boolean;
  progress: number;
  timeSpentItervalId: Interval;
  gameSessionSaveIntervalId: Interval;
}

interface PuzzleActions {
  setPuzzle: (puzzle: Puzzle | null) => void;
  clearPuzzle: () => void;
  setTimeSpent: (timeSpent: number) => void;
  clearTimeSpent: () => void;
  setFinalTimeSpent: (timeSpent: number) => void;
  clearFinalTimeSpent: () => void;
  setIsWin: (isWin: boolean) => void;
  setProgress: (progress: number) => void;
  clearProgress: () => void;
  setTimeSpentItervalId: (intervalId: Interval) => void;
  clearTimeSpentItervalId: () => void;
  setGameSessionSaveIntervalId: (intervalId: Interval) => void;
  clearGameSessionSaveIntervalId: () => void;
}

type PuzzleStore = PuzzleState & PuzzleActions;

const usePuzzleStore = create<PuzzleStore>((set) => ({
  // State
  puzzle: null,
  timeSpent: 0,
  finalTimeSpent: 0,
  isWin: false,
  progress: 0,
  timeSpentItervalId: null,
  gameSessionSaveIntervalId: null,

  // Actions
  setPuzzle: (puzzle) => set({ puzzle }),
  clearPuzzle: () => set({ puzzle: null }),

  setTimeSpent: (timeSpent) => set({ timeSpent }),
  clearTimeSpent: () => set({ timeSpent: 0 }),

  setFinalTimeSpent: (finalTimeSpent) => set({ finalTimeSpent }),
  clearFinalTimeSpent: () => set({ finalTimeSpent: 0 }),

  setIsWin: (isWin) => set({ isWin }),

  setProgress: (progress) => set({ progress }),
  clearProgress: () => set({ progress: 0 }),

  setTimeSpentItervalId: (timeSpentItervalId) => set({ timeSpentItervalId }),
  clearTimeSpentItervalId: () => set({ timeSpentItervalId: null }),

  setGameSessionSaveIntervalId: (gameSessionSaveIntervalId) =>
    set({ gameSessionSaveIntervalId }),
  clearGameSessionSaveIntervalId: () =>
    set({ gameSessionSaveIntervalId: null }),
}));

export default usePuzzleStore;
