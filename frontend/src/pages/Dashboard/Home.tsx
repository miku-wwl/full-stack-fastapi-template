/** Dashboard home page with real-time forex rates, statistics cards, and charts. */

import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  GridIcon,
  DollarLineIcon,
  BoxCubeIcon,
  AlertHexaIcon,
  GroupIcon,
} from "../../icons";
import StatCard from "../../components/Common/StatCard";
import RecentTransactions from "../../components/forex/RecentTransactions";
import RateChart from "../../components/forex/RateChart";
import PageMeta from "../../components/Common/PageMeta";
import { DashboardService } from "../../client";

const isAuditor = () => localStorage.getItem("user_role") === "auditor";
const getUserName = () => localStorage.getItem("user_name") || "";

export default function Home() {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => DashboardService.readDashboardSummary(),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const auditor = isAuditor();
  const userName = getUserName();

  return (
    <>
      {/* Kia ora greeting — Māori language welcome as a sign of cultural respect */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {userName ? t("greeting.user", { name: userName }) : t("greeting.noUser")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("landing.subtitle")}
        </p>
      </div>
      <PageMeta
        title="Dashboard - ForeXchange"
        description="ForeXchange real-time remittance dashboard"
      />
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 ${auditor ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          <StatCard
            icon={
              <BoxCubeIcon className="text-blue-600 dark:text-blue-400 size-6" />
            }
            label={t("dashboard.activePairs")}
            value={summary?.active_pairs ?? 0}
            loading={isLoading}
          />
          <StatCard
            icon={
              <GroupIcon className="text-green-600 dark:text-green-400 size-6" />
            }
            label={t("dashboard.yourTransactions")}
            value={summary?.today_transactions ?? 0}
            loading={isLoading}
          />
          <StatCard
            icon={
              <DollarLineIcon className="text-indigo-600 dark:text-indigo-400 size-6" />
            }
            label={t("dashboard.totalVolume")}
            value={summary?.total_volume_usd ?? 0}
            loading={isLoading}
          />
          {auditor && (
            <StatCard
              icon={
                <AlertHexaIcon className="text-red-600 dark:text-red-400 size-6" />
              }
              label={t("dashboard.complianceAlerts")}
              value={summary?.flagged_count ?? 0}
              highlight={!!summary?.flagged_count && summary.flagged_count > 0}
              loading={isLoading}
            />
          )}
        </div>

        {/* Live Rates Preview (mini) */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl dark:bg-green-900/30">
                <GridIcon className="text-green-600 dark:text-green-400 size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {t("dashboard.forexMarketStatus")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("dashboard.ratesUpdating")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {t("dashboard.live")}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {summary?.active_pairs ?? 0} {t("dashboard.pairsActive")}
                {auditor && (
                  <> · {summary?.today_transactions ?? 0} {t("dashboard.transactionsToday")}</>
                )}
              </span>
            </div>
            {auditor && summary?.flagged_count && summary.flagged_count > 0 ? (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  ⚠️ {t("dashboard.flaggedReview", { count: summary.flagged_count, plural: summary.flagged_count !== 1 ? "s" : "" })}
                </p>
              </div>
            ) : null}
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl dark:bg-blue-900/30">
                <DollarLineIcon className="text-blue-600 dark:text-blue-400 size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {auditor ? t("dashboard.systemOverview") : t("dashboard.yourSummary")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {auditor ? t("dashboard.operationalMetrics") : t("dashboard.yourRemittanceActivity")}
                </p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {auditor && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("dashboard.avgProcessingTime")}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {summary?.avg_processing_time_ms
                      ? `${(summary.avg_processing_time_ms / 1000).toFixed(1)}s`
                      : t("common.na")}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("dashboard.totalVolume")}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  $
                  {summary?.total_volume_usd
                    ? summary.total_volume_usd.toLocaleString()
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Transactions
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {summary?.today_transactions ?? 0}
                </span>
              </div>
              {auditor && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t("dashboard.compliancePassRate")}
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {summary?.today_transactions && summary.flagged_count != null
                      ? `${Math.round(((summary.today_transactions - summary.flagged_count) / summary.today_transactions) * 100)}%`
                      : "100%"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rate Trend Chart */}
        <RateChart defaultPair="USD/EUR" height={320} />

        {/* Recent Transactions */}
        <div>
          <RecentTransactions />
        </div>
      </div>
    </>
  );
}
