/** Language toggle component switching between English and Te Reo Māori. */

import { useTranslation } from "react-i18next"
import { useState, useEffect } from "react"

const languages = [
  { code: "en", label: "EN", full: "English" },
  { code: "mi", label: "Māori", full: "Te Reo Māori" },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18n.language)

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => setCurrentLang(lng)
    i18n.on("languageChanged", handleLanguageChanged)
    return () => {
      i18n.off("languageChanged", handleLanguageChanged)
    }
  }, [i18n])

  const handleChange = (langCode: string) => {
    void i18n.changeLanguage(langCode)
  }

  return (
    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {languages.map((lang) => {
        const isActive = currentLang.startsWith(lang.code)
        return (
          <button
            type="button"
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            title={lang.full}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-brand-500 text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
