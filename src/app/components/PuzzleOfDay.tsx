import { useTranslations } from "next-intl";

const PuzzleOfDay = () => {
  const t = useTranslations();

  return (
    <div className="bento-box__area-1 bg-base-300 rounded-lg p-4">
      <h1 className="text-2xl uppercase">{t("dashboard.puzzle_of_the_day")}</h1>
    </div>
  );
};

export default PuzzleOfDay;
