import { useTranslations } from "next-intl";
import Link from "next/link";

const GuestNavbar = () => {
  const t = useTranslations();

  return (
    <div className="navbar bg-base-100 shadow-sm fixed">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          {t("common.brand")}
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a>{t("common.about")}</a>
          </li>
          <li>
            <Link href="/login">{t("common.login")}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GuestNavbar;
