import PuzzleOfDay from "./components/PuzzleOfDay";

export default function Home() {
  return (
    <main className="w-full h-screen pt-24 pb-16 px-16">
      <div className="bento-box container min-h-screen mx-auto text-base-content">
        <PuzzleOfDay />

        <div className="bento-box__area-2 bg-base-300 rounded-lg p-4">
          PREVIOUS DAYS
        </div>
        <div className="bento-box__area-3 bg-base-300 rounded-lg p-4">
          LEAEDERBOARD PREV
        </div>
        <div className="bento-box__area-4 bg-base-300 rounded-lg p-4">
          GLOBAL GAMES HISTORY PREVIEW
        </div>
        <div className="bento-box__area-5 bg-base-300 rounded-lg p-4">
          SUB / CTA
        </div>
        <div className="bento-box__area-6 bg-base-300 rounded-lg p-4">AD</div>
      </div>
    </main>
  );
}
