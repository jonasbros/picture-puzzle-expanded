import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import dayjs from "@/lib/utils/dayjs";
import { createUserAction } from "@/lib/actions/users";
import { createGameSession } from "@/lib/actions/game-sessions";
import usePuzzleStore from "@/lib/stores/puzzle-store";

const PostGameModal = ({
  isOpen,
  piecePositions,
}: {
  isOpen: boolean;
  piecePositions: string;
}) => {
  const t = useTranslations();
  const modal = useRef<HTMLDialogElement>(null);
  const puzzle = usePuzzleStore((state) => state.puzzle);
  const finalTimeSpent = usePuzzleStore((state) => state.finalTimeSpent);

  useEffect(() => {
    if (!modal) return;
    if (isOpen) modal.current!.showModal();
  }, [isOpen]);

  async function postGameProcess(formData: FormData) {
    // save guest user -> save game session -> calculate / save leaderboard position
    const { data: user } = await createUserAction({
      username: formData.get("username") as string,
      is_guest: true,
    });

    if (!user) {
      // todo: proper error handling
      console.error("user not found");
      return;
    }

    if (!puzzle) {
      // todo: proper error handling
      console.error("puzzle not found");
      return;
    }

    const gameSession = await createGameSession({
      user_id: user.id,
      puzzle_id: puzzle.id,
      piece_positions: piecePositions,
      time_spent_ms: finalTimeSpent,
      completion_percentage: 100,
      mmr_change: 0,
      is_finished: true,
      difficulty_level: "hard",
    });

    console.log("gameSession", gameSession);
  }

  return (
    <>
      <dialog ref={modal} className="modal">
        <div className="modal-box w-fit">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg text-center uppercase mb-4">
            {t("puzzle.you_won")}
          </h3>

          <p className="text-center">{t("puzzle.your_time")}</p>
          <p className="text-2xl font-bold text-center mb-4">
            {`${dayjs.duration(finalTimeSpent).format("HH:mm:ss.SSS")}`}
          </p>

          <form action={postGameProcess}>
            <fieldset className="fieldset">
              <input
                name="username"
                type="text"
                className="input w-72 mb-2"
                placeholder={t("puzzle.name_in_leaderboards").toUpperCase()}
              />
              <button className="btn btn-primary">{t("common.submit")}</button>
            </fieldset>
          </form>
        </div>
      </dialog>
    </>
  );
};

export default PostGameModal;
