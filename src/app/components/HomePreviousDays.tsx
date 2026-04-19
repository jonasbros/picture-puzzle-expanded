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

  if (error) return <div>{t("common.errors.generic")}</div>;

  const totalPages = Math.ceil((total ?? 0) / LIMIT);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex flex-col h-full gap-4">
      <h2 className="text-xl font-bold uppercase">Previous Days</h2>

      <ul className="flex flex-col gap-2 flex-1">
        {puzzles?.map((daily) => (
          <li key={daily.id}>
            <Link
              href={`/puzzle/${daily.puzzle?.slug}`}
              className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-base-100 transition-colors"
            >
              <span className="font-medium truncate">{daily.puzzle?.title}</span>
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

      <div className="flex items-center justify-between pt-2 border-t border-base-content/10">
        <Link
          href={`?page=${page - 1}`}
          className={`btn btn-sm btn-ghost ${!hasPrev ? "btn-disabled" : ""}`}
          aria-disabled={!hasPrev}
          tabIndex={!hasPrev ? -1 : undefined}
        >
          ← Prev
        </Link>
        <span className="text-sm text-base-content/60">
          {page} / {totalPages}
        </span>
        <Link
          href={`?page=${page + 1}`}
          className={`btn btn-sm btn-ghost ${!hasNext ? "btn-disabled" : ""}`}
          aria-disabled={!hasNext}
          tabIndex={!hasNext ? -1 : undefined}
        >
          Next →
        </Link>
      </div>
    </div>
  );
};

export default HomePreviousDays;
