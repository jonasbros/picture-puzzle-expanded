import { getAllAverageScores } from "@/lib/actions/local-leaderboards";
import LeaderboardsTable from "../components/LeaderboardsTable";
const Leaderboards = async () => {
  const allAverageScores = await getAllAverageScores();
  console.log(allAverageScores);
  return (
    <main className="container min-h-full h-full mx-auto px-4">
      <h2 className="text-xl text-center font-bold mb-4 max-w-sm mx-auto">
        All Time Leaderboards (Average Times)
      </h2>

      <div className="max-w-lg mx-auto overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <LeaderboardsTable leaderboards={allAverageScores} />
      </div>
    </main>
  );
};

export default Leaderboards;
