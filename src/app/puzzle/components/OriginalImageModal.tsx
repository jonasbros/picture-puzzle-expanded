import { useTranslations } from "next-intl";
import Image from "next/image";

const OriginalImageModal = ({
  imageUrl,
  altText,
}: {
  imageUrl: string;
  altText: string;
}) => {
  const t = useTranslations();
  const IMG_WIDTH = 600;
  const IMG_HEIGHT = IMG_WIDTH / (16 / 9);
  return (
    <>
      <button
        className="btn btn-primary uppercase transform transition-transform hover:scale-105"
        onClick={() => document.getElementById("my_modal_2")!.showModal()}
      >
        {t("puzzle.show_original_image")}
      </button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <div className="rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={altText}
              width={IMG_WIDTH}
              height={IMG_HEIGHT}
            />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default OriginalImageModal;
