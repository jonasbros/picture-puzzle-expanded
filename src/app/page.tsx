import { Suspense } from "react";
import HomePuzzleOfDay from "./components/HomePuzzleOfDay";

export default function Home() {
  return (
    <main className="container h-full mx-auto pb-16">
      <div className="flex w-1/2 mt-4 mx-auto justify-between">
        <Suspense
          fallback={<div>LOADING -- make skeleton component later</div>}
        >
          <HomePuzzleOfDay />
        </Suspense>
      </div>
    </main>
  );
}
