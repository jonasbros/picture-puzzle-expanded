import type { Piece } from "@/lib/types/puzzle";

export function generateGrid(size: number = 16) {
  const pieces = [];
  for (let i = 1; i <= size; i++) {
    pieces.push({
      id: crypto.randomUUID(),
      position: i,
      currentPosition: i,
    });
  }

  return {
    pieces: shufflePieces(pieces, size),
    solution: pieces,
  };
}

export function getProgress(currentPieces: Piece[], solution: Piece[]) {
  const total = solution.length;
  const correct = currentPieces.filter(
    (p, i) => p.currentPosition === solution[i].currentPosition
  ).length;

  return (correct / total) * 100;
}

function shufflePieces(pieces: Array<object>, size: number) {
  // make array [1,2,3,4,5,6,7,8,9]
  const positions = Array.from({ length: size }, (_, i) => i + 1);

  // shuffle it (Fisher–Yates)
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // assign each shuffled position
  return pieces.map((item, index) => ({
    ...item,
    currentPosition: positions[index],
  }));
}
