import { Suspense } from "react";
import HomePuzzleOfDay from "./components/HomePuzzleOfDay";
import Loading from "./loading";

export default function Home() {
  return (
    <main className="container h-full mx-auto pb-16">
      <div className="flex w-1/2 mt-4 mx-auto justify-between">
        <Suspense fallback={<Loading />}>
          <HomePuzzleOfDay />
        </Suspense>
      </div>
    </main>
  );
}
