import { Suspense } from "react";
import HomePuzzleOfDay from "./components/HomePuzzleOfDay";

export default function Home() {
  return (
    <main className="container h-screen pb-16 px-16">
      <div className="w-1/2 min-h-screen mx-auto">
        <Suspense
          fallback={<div>LOADING -- make skeleton component later</div>}
        >
          <HomePuzzleOfDay />
        </Suspense>
      </div>
    </main>
  );
}
