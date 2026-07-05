import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import TransactionTable from "@/components/forex/TransactionTable"

export const Route = createFileRoute("/_layout/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      {
        title: "page.history.title - ForeXchange",
      },
    ],
  }),
})

function HistoryPage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
          {t("page.history.title")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("page.history.subtitle")}
        </p>
      </div>
      <TransactionTable />
    </div>
  )
}
