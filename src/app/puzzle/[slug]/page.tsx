"use client";

import { useParams } from "next/navigation";

const Puzzle = () => {
  const { slug } = useParams();
  return <div>{slug}</div>;
};

export default Puzzle;
