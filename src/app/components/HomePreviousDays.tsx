import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPreviousDailyPuzzles } from "@/lib/actions/puzzles";

const LIMIT = 5;

interface Props {
  page: number;
}

const HomePreviousDays = async ({ page }: Props) => {
  const t = await getTranslations();
  const { data: puzzles, total, error } = await getPreviousDailyPuzzles(page);

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

  return (
    <div className="flex flex-col h-full gap-4">
      <h2 className="text-xl font-bold uppercase">Previous Days</h2>

      <ul className="menu menu-md w-full flex-1 p-0 flex-nowrap">
        {puzzles?.map((daily) => (
          <li key={daily.id} className="flex-1">
            <Link
              href={`/puzzle/${daily.puzzle?.slug}`}
              className="flex items-center justify-between h-full"
            >
              <span className="truncate">{daily.puzzle?.title}</span>
              <span className="text-sm text-base-content/60 shrink-0">
                {new Date(daily.puzzle_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>


      <div className="flex items-center justify-between">
        <div className="join">
          <Link
            href={`?page=${page - 1}`}
            className={`join-item btn btn-sm btn-ghost ${!hasPrev ? "btn-disabled pointer-events-none" : ""}`}
            aria-disabled={!hasPrev}
            tabIndex={!hasPrev ? -1 : undefined}
          >
            «
          </Link>
          <span className="join-item btn btn-sm btn-ghost btn-disabled no-animation cursor-default">
            {page} / {totalPages}
          </span>
          <Link
            href={`?page=${page + 1}`}
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

export default HomePreviousDays;
