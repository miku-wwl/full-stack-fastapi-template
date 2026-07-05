import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { OpenAPI } from "../../client";
import { useState } from "react";

const PAIR_OPTIONS = [
  "USD/EUR", "USD/GBP", "USD/JPY", "USD/CHF", "USD/AUD", "USD/CAD",
  "EUR/GBP", "EUR/JPY", "GBP/JPY", "USD/NZD", "USD/SGD", "USD/HKD",
];

const RANGE_OPTIONS = [
  { label: "1H", value: "1h" },
  { label: "6H", value: "6h" },
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
];

interface RateChartProps {
  defaultPair?: string;
  className?: string;
  height?: number;
}

export default function RateChart({
  defaultPair = "USD/EUR",
  className = "",
  height = 350,
}: RateChartProps) {
  const { t } = useTranslation();
  const [pair, setPair] = useState(defaultPair);
  const [range, setRange] = useState("24h");

  const interval = range === "1h" ? "1m" : range === "6h" ? "5m" : "5m";

  const { data: history, isLoading, isError } = useQuery({
    queryKey: ["rates", "history", pair, range, interval],
    queryFn: async () => {
      const base = OpenAPI.BASE ?? "";
      const token = typeof OpenAPI.TOKEN === "function" ? await OpenAPI.TOKEN({} as any) : (OpenAPI.TOKEN ?? "");
      const res = await fetch(
        `${base}/api/v1/rates/history/${pair.replace("/", "-")}?range=${range}&interval=${interval}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      return res.json();
    },
    staleTime: 30_000,
  });

  const timestamps = history?.map((p: any) => new Date(p.timestamp).getTime()) ?? [];
  const midData = history?.map((p: any) => p.mid) ?? [];
  const bidData = history?.map((p: any) => p.bid) ?? [];
  const askData = history?.map((p: any) => p.ask) ?? [];

  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 500 },
      background: "transparent",
    },
    stroke: {
      curve: "smooth",
      width: [2, 1, 1],
      dashArray: [0, 4, 4],
    },
    colors: ["#3B82F6", "#22C55E", "#EF4444"],
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#9CA3AF", fontSize: "11px" },
        datetimeUTC: false,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#9CA3AF", fontSize: "11px" },
        formatter: (val: number) => val.toFixed(4),
      },
    },
    tooltip: {
      theme: "dark",
      x: { format: "HH:mm:ss" },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      padding: { left: 0, right: 0, top: -10 },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { colors: "#6B7280" },
    },
  };

  const series = [
    { name: "Mid", data: timestamps.map((t: number, i: number) => [t, midData[i]]) },
    { name: "Bid", data: timestamps.map((t: number, i: number) => [t, bidData[i]]) },
    { name: "Ask", data: timestamps.map((t: number, i: number) => [t, askData[i]]) },
  ];

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {t("rates.rateTrend")}
        </h3>
        <div className="flex items-center gap-2">
          {/* Pair selector */}
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAIR_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {/* Range selector */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === r.value
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {isLoading && (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="animate-pulse text-gray-400">Loading chart data...</div>
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20" style={{ height }}>
          <p className="text-sm text-red-500">Failed to load chart data</p>
        </div>
      )}

      {!isLoading && !isError && history?.length === 0 && (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700" style={{ height }}>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Waiting for market data...
          </p>
        </div>
      )}

      {!isLoading && !isError && history && history.length > 0 && (
        <Chart options={chartOptions} series={series} type="line" height={height} />
      )}
    </div>
  );
}
