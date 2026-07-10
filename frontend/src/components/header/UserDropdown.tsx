/** User avatar dropdown with profile, settings, and logout options. */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown } from "../ui/dropdown/Dropdown";
import useAuth from "@/hooks/useAuth";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const displayName = user?.full_name || user?.email?.split("@")[0] || t("user.editProfile");
  const displayEmail = user?.email || "";
  const userRole = user?.role || localStorage.getItem("user_role") || "customer";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/images/user/owner.jpg" alt="User" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{displayName}</span>
        <svg
          aria-label="Dropdown indicator"
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {displayName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </span>
          <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
            userRole === "auditor"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}>
            {userRole === "auditor" ? t("user.role.auditor") : t("user.role.customer")}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <span className="flex items-center gap-3 px-3 py-2 font-medium text-gray-400 rounded-lg text-theme-sm cursor-not-allowed opacity-50">
              <svg className="fill-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z" fill="" /></svg>
              {t("user.editProfile")}
            </span>
          </li>
          <li>
            <span className="flex items-center gap-3 px-3 py-2 font-medium text-gray-400 rounded-lg text-theme-sm cursor-not-allowed opacity-50">
              <svg className="fill-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3" fill="" /><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8Z" fill="" /></svg>
              {t("user.accountSettings")}
            </span>
          </li>
          <li>
            <span className="flex items-center gap-3 px-3 py-2 font-medium text-gray-400 rounded-lg text-theme-sm cursor-not-allowed opacity-50">
              <svg className="fill-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M3.5 12C3.5 7.306 7.306 3.5 12 3.5s8.5 3.806 8.5 8.5-3.806 8.5-8.5 8.5S3.5 16.694 3.5 12ZM12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm0 9.25c-.69 0-1.25-.56-1.25-1.25S11.31 8.75 12 8.75s1.25.56 1.25 1.25-.56 1.25-1.25 1.25Zm1.5 6.121V16.62c0-.414-.336-.75-.75-.75s-.75.336-.75.75v-4.249c0-.414.336-.75.75-.75s.75.336.75.75v1.747c.414-.229.882-.229 1.296 0 .414.23.654.694.654 1.165v.577c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-.577c0-.057.041-.104.094-.104s.094.047.094.104v.577c0 .057-.041.104-.094.104s-.094-.047-.094-.104Z" fill="" /></svg>
              {t("user.support")}
            </span>
          </li>
        </ul>
        <button
          type="button"
          onClick={() => {
            closeDropdown();
            logout();
          }}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          <svg className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M15.101 19.247c-.415 0-.75-.336-.75-.75v-4.252H12.851v4.252c0 1.243 1.007 2.25 2.25 2.25h3.4c1.243 0 2.25-1.007 2.25-2.25V5.496c0-1.243-1.007-2.25-2.25-2.25h-3.4c-1.243 0-2.25 1.007-2.25 2.25v4.249h1.5V5.496c0-.414.336-.75.75-.75h3.4c.414 0 .75.336.75.75v12.997c0 .414-.336.75-.75.75h-3.4ZM3.251 11.998c0-.216.091-.411.237-.548l4.607-4.609c.293-.293.768-.293 1.061 0 .293.293.293.768 0 1.061L5.811 12.748h10.19c.414 0 .75.336.75.75s-.336.75-.75.75H5.815l3.341 3.343c.293.293.293.768 0 1.061-.293.293-.768.293-1.061 0l-4.572-4.575c-.166-.137-.257-.345-.257-.579Z" fill="" /></svg>
          {t("action.logout")}
        </button>
      </Dropdown>
    </div>
  );
}
