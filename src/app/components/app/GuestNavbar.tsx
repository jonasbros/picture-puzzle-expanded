"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import ThemeSwitch from "./ThemeSwitch";
import { signOut } from "@/lib/actions/auth";

const GuestNavbar = () => {
  const t = useTranslations();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="navbar bg-base-100 shadow-sm fixed z-1">
      <div className="container flex mx-auto">
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
              <a onClick={() => handleLogout()}>{t("common.logout")}</a>
            </li>
            <li>
              <ThemeSwitch />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GuestNavbar;
