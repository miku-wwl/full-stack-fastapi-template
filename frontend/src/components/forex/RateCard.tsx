import { ArrowDownIcon, ArrowUpIcon } from "../../icons";
import type { RateWithPair } from "../../client";

interface RateCardProps {
  rate: RateWithPair;
}

/**
 * Displays a single currency pair's live exchange rate.
 * - Green background/gradient for positive change_pct
 * - Red background/gradient for negative change_pct
 */
export default function RateCard({ rate }: RateCardProps) {
  const isPositive = rate.change_pct >= 0;
  const isNegative = rate.change_pct < 0;

  // Format numbers for display
  const formatRate = (value: number) => {
    if (value >= 100) return value.toFixed(2);   // e.g. JPY rates
    return value.toFixed(4);                      // e.g. EUR/USD rates
  };

  const formatPct = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(4)}%`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 transition-shadow hover:shadow-md">
      {/* Header: Pair name + change badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-800 dark:text-white/90">
            {rate.pair}
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPositive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {isPositive ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
          {formatPct(rate.change_pct)}
        </span>
      </div>

      {/* Mid Rate - Large */}
      <div className="mb-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Mid</span>
        <div
          className={`text-2xl font-bold mt-0.5 ${
            isPositive
              ? "text-green-600 dark:text-green-400"
              : isNegative
                ? "text-red-600 dark:text-red-400"
                : "text-gray-800 dark:text-white/90"
          }`}
        >
          {formatRate(rate.mid)}
        </div>
      </div>

      {/* Bid / Ask row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/20">
          <span className="text-xs text-gray-500 dark:text-gray-400">Bid</span>
          <div className="text-sm font-semibold text-green-700 dark:text-green-400 mt-0.5">
            {formatRate(rate.bid)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20">
          <span className="text-xs text-gray-500 dark:text-gray-400">Ask</span>
          <div className="text-sm font-semibold text-red-700 dark:text-red-400 mt-0.5">
            {formatRate(rate.ask)}
          </div>
        </div>
      </div>

      {/* Spread + Time */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span>
          Spread: {formatRate(rate.spread)}
        </span>
        <span>
          {rate.timestamp
            ? new Date(rate.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })
            : "—"}
        </span>
      </div>
    </div>
  );
}
