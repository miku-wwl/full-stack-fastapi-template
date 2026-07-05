import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useForexRates } from "@/hooks/useForexRates"
import RateCard from "@/components/forex/RateCard"
import RateChart from "@/components/forex/RateChart"

export const Route = createFileRoute("/_layout/rates")({
  component: RatesPage,
  head: () => ({
    meta: [
      {
        title: "page.rates.title - ForeXchange",
      },
    ],
  }),
})

function RatesPage() {
  const { t } = useTranslation()
  const { data: rates, isLoading, isError, error, dataUpdatedAt } = useForexRates()

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
            {t("page.rates.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("page.rates.subtitle")}
          </p>
        </div>
        {dataUpdatedAt > 0 && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated {new Date(dataUpdatedAt).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse"
            >
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-12">
          <p className="text-red-600 dark:text-red-400 font-medium">
            {t("rates.errorTitle")}
          </p>
          <p className="text-sm text-red-500 dark:text-red-400/70 mt-1">
            {error?.message || t("rates.errorRetry")}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && rates?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-12">
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t("rates.noPairs")}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {t("rates.waitingData")}
          </p>
        </div>
      )}

      {/* Rate Trend Chart */}
      {!isLoading && !isError && rates && rates.length > 0 && (
        <RateChart defaultPair="USD/EUR" />
      )}

      {/* Rate cards grid */}
      {!isLoading && !isError && rates && rates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
          {rates.map((rate) => (
            <RateCard key={rate.pair} rate={rate} />
          ))}
        </div>
      )}
    </div>
  )
}
