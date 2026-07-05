import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { TransactionsService } from "../../client";

const statusConfig: Record<
  string,
  { color: "success" | "warning" | "error" | "info"; label: string }
> = {
  pending: { color: "warning", label: "statusPending" },
  processing: { color: "info", label: "statusProcessing" },
  completed: { color: "success", label: "statusCompleted" },
  flagged: { color: "error", label: "statusFlagged" },
  rejected: { color: "error", label: "statusRejected" },
};

export default function RecentTransactions() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () =>
      TransactionsService.readTransactions({ limit: 10 }),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const transactions = data?.data ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {t("recentTransactions.title")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("recentTransactions.subtitle")}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-gray-400">
          {t("recentTransactions.loading")}
        </div>
      )}

      {isError && (
        <div className="py-8 text-center text-red-500">
          {t("recentTransactions.error")}
        </div>
      )}

      {!isLoading && !isError && transactions.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          {t("recentTransactions.noData")}
        </div>
      )}

      {!isLoading && !isError && transactions.length > 0 && (
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("recentTransactions.colId")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("recentTransactions.colPair")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("recentTransactions.colAmount")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("recentTransactions.colRecipient")}
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("recentTransactions.colStatus")}
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const cfg = statusConfig[tx.status] ?? {
                  color: "info" as const,
                  label: tx.status,
                };
                const shortId = tx.id ? tx.id.substring(0, 8) : "N/A";

                return (
                  <TableRow key={tx.id}>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400 font-mono">
                      {shortId}...
                    </TableCell>
                    <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90 font-medium">
                      {tx.pair || "N/A"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-800 text-theme-sm dark:text-white/90">
                      {tx.source_amount?.toLocaleString()}{" "}
                      {tx.base_currency || ""}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {tx.recipient_name}
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge
                        color={cfg.color}
                        variant="light"
                      >
                        {t("recentTransactions." + cfg.label)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
