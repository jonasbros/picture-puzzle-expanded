import Link from "next/link";
import { getLeaderboardPreview } from "@/lib/actions/local-leaderboards";
import { formatTimeToTimeSpent } from "@/lib/utils/dayjs";
import { getTranslations } from "next-intl/server";

const LIMIT = 5;

interface Props {
  page: number;
}

type LeaderboardEntry = {
  username: string;
  avg_spent_time_ms: number;
};

const HomeLeaderboard = async ({ page }: Props) => {
  const t = await getTranslations();
  const { data: entries, total, error } = await getLeaderboardPreview(page);

  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        <span>{t("common.errors.generic")}</span>
      </div>
    );
  }

  const totalPages = Math.ceil((total ?? 0) / LIMIT);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const offset = (page - 1) * LIMIT;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase">{t("common.leaderboards")}</h2>
        <Link href="/leaderboards" className="link link-primary text-sm">
          View all
        </Link>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th className="text-right">Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {(entries as LeaderboardEntry[])?.map((entry, i) => (
              <tr key={entry.username} className="hover">
                <td>
                  <span className="badge badge-ghost badge-sm">
                    {offset + i + 1}
                  </span>
                </td>
                <td className="font-medium">{entry.username}</td>
                <td className="text-right font-mono text-sm text-base-content/70">
                  {formatTimeToTimeSpent(Number(entry.avg_spent_time_ms))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      <div className="flex items-center justify-between">
        <div className="join">
          <Link
            href={`?lbPage=${page - 1}`}
            className={`join-item btn btn-sm btn-ghost ${!hasPrev ? "btn-disabled pointer-events-none" : ""}`}
            aria-disabled={!hasPrev}
            tabIndex={!hasPrev ? -1 : undefined}
          >
            «
          </Link>
          <span className="join-item btn btn-sm btn-ghost btn-disabled no-animation cursor-default">
            {page} / {totalPages || 1}
          </span>
          <Link
            href={`?lbPage=${page + 1}`}
            className={`join-item btn btn-sm btn-ghost ${!hasNext ? "btn-disabled pointer-events-none" : ""}`}
            aria-disabled={!hasNext}
            tabIndex={!hasNext ? -1 : undefined}
          >
            »
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeLeaderboard;
