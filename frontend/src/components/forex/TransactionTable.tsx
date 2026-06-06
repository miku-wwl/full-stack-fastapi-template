import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { OpenAPI } from "../../client";
import Badge from "../ui/badge/Badge";

const STATUS_OPTIONS = ["all", "pending", "processing", "completed", "flagged", "rejected"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const statusConfig: Record<string, { color: "success" | "warning" | "error" | "info"; label: string }> = {
  pending: { color: "warning", label: "Pending" },
  processing: { color: "info", label: "Processing" },
  completed: { color: "success", label: "Completed" },
  flagged: { color: "error", label: "Flagged" },
  rejected: { color: "error", label: "Rejected" },
};

const PAGE_SIZE = 10;

async function fetchTransactions(skip: number, limit: number, status?: string) {
  const base = OpenAPI.BASE ?? "";
  const token = typeof OpenAPI.TOKEN === "function" ? await OpenAPI.TOKEN({} as any) : (OpenAPI.TOKEN ?? "");
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (status && status !== "all") params.set("status", status);
  const res = await fetch(`${base}/api/v1/transactions?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<{ data: any[]; count: number }>;
}

export default function TransactionTable() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["transactions", "list", page, statusFilter],
    queryFn: () => fetchTransactions(page * PAGE_SIZE, PAGE_SIZE, statusFilter),
    staleTime: 10_000,
  });

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Header + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {data ? `${data.count}` : "—"} transactions
        </h3>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(0); }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All Statuses" : statusConfig[s]?.label ?? s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr>
                {["ID", "Date", "Pair", "Amount", "Recipient", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              )}
              {isError && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-red-500">Failed to load transactions.</td></tr>
              )}
              {!isLoading && !isError && data?.data.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No transactions found.</td></tr>
              )}
              {!isLoading && !isError && data?.data.map((tx: any) => {
                const cfg = statusConfig[tx.status] ?? { color: "info" as const, label: tx.status };
                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.id?.substring(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{tx.pair}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {tx.source_amount?.toLocaleString()} {tx.base_currency}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{tx.recipient_name}</td>
                    <td className="px-4 py-3"><Badge color={cfg.color} variant="light">{cfg.label}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setSelectedTx(null)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Transaction Detail</h3>
              <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-mono text-gray-800 dark:text-white/90">{selectedTx.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-gray-800 dark:text-white/90">{selectedTx.created_at ? new Date(selectedTx.created_at).toLocaleString() : "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pair</span><span className="text-gray-800 dark:text-white/90">{selectedTx.pair}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Source Amount</span><span className="text-gray-800 dark:text-white/90">{selectedTx.source_amount?.toLocaleString()} {selectedTx.base_currency}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Target Amount</span><span className="text-gray-800 dark:text-white/90">{selectedTx.target_amount?.toLocaleString()} {selectedTx.quote_currency}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rate</span><span className="text-gray-800 dark:text-white/90">{selectedTx.locked_rate?.toFixed(6)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Fee</span><span className="text-gray-800 dark:text-white/90">{selectedTx.fee_amount?.toFixed(2)} {selectedTx.base_currency} ({selectedTx.fee_percentage}%)</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Recipient</span><span className="text-gray-800 dark:text-white/90">{selectedTx.recipient_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">IBAN</span><span className="font-mono text-gray-800 dark:text-white/90">{selectedTx.recipient_iban}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Purpose</span><span className="text-gray-800 dark:text-white/90">{selectedTx.purpose}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span>
                <Badge color={statusConfig[selectedTx.status]?.color ?? "info"} variant="light">{statusConfig[selectedTx.status]?.label ?? selectedTx.status}</Badge>
              </div>
              {selectedTx.compliance_score != null && (
                <div className="flex justify-between"><span className="text-gray-500">Compliance</span><span className="text-gray-800 dark:text-white/90">Score: {selectedTx.compliance_score} | {selectedTx.compliance_status}</span></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
