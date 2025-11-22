import { useTranslations } from "next-intl";
import Link from "next/link";

import ThemeSwitch from "./ThemeSwitch";

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
        <ul className="menu menu-horizontal item-center px-1">
          <li>
            <a>{t("common.about")}</a>
          </li>
          <li>
            <Link href="/login">{t("common.login")}</Link>
          </li>
          <li>
            <ThemeSwitch size={6} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GuestNavbar;
