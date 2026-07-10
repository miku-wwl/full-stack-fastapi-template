/** Dashboard statistics card displaying an icon, label, value, and optional color indicator. */

import type { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  highlight?: boolean;
  subtitle?: string;
  loading?: boolean;
}

export default function StatCard({
  icon,
  label,
  value,
  highlight = false,
  subtitle,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800 animate-pulse" />
        <div className="mt-5 space-y-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl ${
          highlight
            ? "bg-red-100 dark:bg-red-900/30"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        {icon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
          <h4
            className={`mt-2 font-bold text-title-sm ${
              highlight
                ? "text-red-600 dark:text-red-400"
                : "text-gray-800 dark:text-white/90"
            }`}
          >
            {typeof value === "number" && label.toLowerCase().includes("volume")
              ? `$${value.toLocaleString()}`
              : typeof value === "number"
                ? value.toLocaleString()
                : value}
          </h4>
        </div>
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
