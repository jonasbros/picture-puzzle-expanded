import { useDraggable, useDroppable } from "@dnd-kit/core";
import styles from "./Grid.module.css";
import type { Piece } from "@/lib/types/puzzle";
import usePuzzleStore from "@/lib/stores/puzzle-store";

const PuzzlePiece = ({ piece }: { piece: Piece }) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
  } = useDraggable({
    id: piece.id,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: piece.id,
  });

  // merge refs
  const combinedRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  const puzzle = usePuzzleStore((state) => state.puzzle);
  const isWin = usePuzzleStore((state) => state.isWin);

  return (
    <div
      ref={combinedRef}
      {...attributes}
      {...listeners}
      className={`
      ${styles[`puzzle-piece__position-${piece.currentPosition}`]} 
      ${!isWin && "border-[0.5]"}
      flex items-center justify-center text-xs font-mono cursor-pointer bg-size-[1600%_900%] text-black font-bold border-base-content`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        minHeight: "20px",
        backgroundImage: `url(${puzzle && puzzle.url})`,
        backgroundColor: isOver ? "#ddd" : "transparent",
      }}
    ></div>
  );
};

export default PuzzlePiece;
