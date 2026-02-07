import { useTranslations } from "next-intl";
import { formatTimeToTimeSpent } from "@/lib/utils/dayjs";
import { LocalLeaderboard } from "@/lib/types/leaderboard";

const LeaderboardsTable = ({
  leaderboards,
}: {
  leaderboards: LocalLeaderboard[];
}) => {
  const t = useTranslations();

  return (
    <table className="table table-zebra">
      <thead>
        <tr>
          <th>{t("common.rank")}</th>
          <th>{t("common.name")}</th>
          <th>{t("puzzle.spent_time")}</th>
        </tr>
      </thead>
      <tbody>
        {leaderboards.map((leaderboard, idx) => (
          <tr key={leaderboard.id}>
            <th>#{idx + 1}</th>
            <td>
              {(leaderboard.users && leaderboard.users.username) ||
                leaderboard.username}
            </td>
            <td>
              {formatTimeToTimeSpent(
                leaderboard.spent_time_ms || leaderboard.avg_spent_time_ms,
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LeaderboardsTable;
