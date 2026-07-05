import { createFileRoute, Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import LanguageSwitcher from "../components/Common/LanguageSwitcher"

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      {
        title: "privacy.title",
      },
    ],
  }),
})

function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top bar with language switcher */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <Link
          to="/"
          className="text-lg font-bold text-gray-800 dark:text-white/90"
        >
          ForeXchange
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 mb-8">
          {t("privacy.title")}
        </h1>

        {/* Data Collection */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
            {t("privacy.sectionCollection")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("privacy.textCollection")}
          </p>
        </section>

        {/* Data Storage & Encryption */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
            {t("privacy.sectionEncryption")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("privacy.textEncryption")}
          </p>
        </section>

        {/* Access Control */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
            {t("privacy.sectionAccess")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("privacy.textAccess")}
          </p>
        </section>

        {/* Right to Deletion */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
            {t("privacy.sectionDeletion")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("privacy.textDeletion")}
          </p>
        </section>

        {/* Data Sovereignty */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
            {t("privacy.sectionSovereignty")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("privacy.textSovereignty")}
          </p>
        </section>

        {/* Contact */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
            {t("privacy.sectionContact")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {t("privacy.textContact")}
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 underline"
          >
            {t("privacy.backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
