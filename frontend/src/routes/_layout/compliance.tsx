import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react"
import { OpenAPI } from "@/client"
import StatCard from "@/components/Common/StatCard"

interface ComplianceOverview {
  flagged_count: number
  reviewed_today: number
  approved_today: number
  rejected_today: number
  pass_rate: number
}

interface TxPublic {
  id: string
  user_id: string
  pair_id: string
  source_amount: number
  target_amount: number | null
  locked_rate: number
  fee_amount: number
  fee_percentage: number
  recipient_name: string
  recipient_iban: string
  purpose: string
  status: string
  compliance_status: string | null
  compliance_score: number | null
  compliance_details: Record<string, unknown> | null
  created_at: string | null
  updated_at: string | null
  completed_at: string | null
  pair: string | null
  base_currency: string | null
  quote_currency: string | null
}

interface FlaggedList {
  data: TxPublic[]
  count: number
}

export const Route = createFileRoute("/_layout/compliance")({
  component: CompliancePage,
  beforeLoad: async () => {
    const role = localStorage.getItem("user_role")
    if (role !== "auditor") {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [{ title: "Compliance Audit - ForeXchange" }],
  }),
})

function CompliancePage() {
  const queryClient = useQueryClient()
  const [modalTx, setModalTx] = useState<TxPublic | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  async function authHeaders(): Promise<Record<string, string>> {
    const token = typeof OpenAPI.TOKEN === "function" ? await OpenAPI.TOKEN({} as any) : (OpenAPI.TOKEN ?? "")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const { data: overview, isLoading: overviewLoading } = useQuery<ComplianceOverview>({
    queryKey: ["compliance-overview"],
    queryFn: async () => {
      const res = await fetch(`${OpenAPI.BASE}/api/v1/compliance/overview`, { headers: await authHeaders() })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    refetchInterval: 15_000,
  })

  const { data: flagged, isLoading: flaggedLoading } = useQuery<FlaggedList>({
    queryKey: ["compliance-flagged"],
    queryFn: async () => {
      const res = await fetch(`${OpenAPI.BASE}/api/v1/compliance/flagged`, { headers: await authHeaders() })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    refetchInterval: 10_000,
  })

  const reviewMutation = useMutation({
    mutationFn: async ({
      txId,
      action,
      reason,
    }: {
      txId: string
      action: string
      reason?: string
    }) => {
      const res = await fetch(`${OpenAPI.BASE}/api/v1/compliance/review/${txId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ action, reason: reason || null }),
      })
      if (!res.ok) throw new Error("Review failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-overview"] })
      queryClient.invalidateQueries({ queryKey: ["compliance-flagged"] })
      setModalTx(null)
      setRejectReason("")
    },
  })

  function handleApprove(txId: string) {
    reviewMutation.mutate({ txId, action: "approve" })
  }

  function handleReject() {
    if (!modalTx) return
    reviewMutation.mutate({ txId: modalTx.id, action: "reject", reason: rejectReason })
  }

  function getScoreColor(score: number | null): string {
    if (score === null) return "text-gray-400"
    if (score >= 70) return "text-red-600 dark:text-red-400"
    if (score >= 35) return "text-amber-600 dark:text-amber-400"
    return "text-yellow-600 dark:text-yellow-400"
  }

  function getScoreBg(score: number | null): string {
    if (score === null) return "bg-gray-100 dark:bg-gray-800"
    if (score >= 70) return "bg-red-50 dark:bg-red-950"
    if (score >= 35) return "bg-amber-50 dark:bg-amber-950"
    return "bg-yellow-50 dark:bg-yellow-950"
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance Audit</h1>
        <p className="text-muted-foreground">
          Review flagged transactions and compliance alerts (Auditor only)
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          label="Flagged"
          value={overview?.flagged_count ?? "—"}
          loading={overviewLoading}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          label="Reviewed Today"
          value={overview?.reviewed_today ?? "—"}
          loading={overviewLoading}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Approved"
          value={overview?.approved_today ?? "—"}
          loading={overviewLoading}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          label="Rejected"
          value={overview?.rejected_today ?? "—"}
          loading={overviewLoading}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          label="Pass Rate"
          value={`${overview?.pass_rate ?? 0}%`}
          loading={overviewLoading}
        />
      </div>

      {/* Flagged transactions table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold">
            Flagged Transactions{" "}
            {flagged ? `(${flagged.count})` : ""}
          </h2>
        </div>

        {flaggedLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : !flagged || flagged.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No flagged transactions — all clear ✅
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-left">
                  <th className="px-5 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Pair</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-right">
                    Amount
                  </th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">Recipient</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground">IBAN</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-center">
                    Risk Score
                  </th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-center">
                    Rules
                  </th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {flagged.data.map((tx) => {
                  const rules = (tx.compliance_details as { rules?: Array<{ rule: string; detail: string }> })?.rules ?? []
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 font-mono text-xs">
                        {tx.id.slice(0, 8)}…
                      </td>
                      <td className="px-5 py-3 font-medium">{tx.pair}</td>
                      <td className="px-5 py-3 text-right font-mono">
                        {tx.source_amount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-5 py-3">{tx.recipient_name}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {tx.recipient_iban}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${getScoreBg(tx.compliance_score)} ${getScoreColor(tx.compliance_score)}`}
                        >
                          {tx.compliance_score ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {rules.map((r: { rule: string; detail: string }) => (
                            <span
                              key={r.rule}
                              className="inline-flex items-center rounded-md bg-red-50 dark:bg-red-950 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400"
                              title={r.detail}
                            >
                              {r.rule.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(tx.id)}
                            disabled={reviewMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900 disabled:opacity-50"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalTx(tx)}
                            disabled={reviewMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 disabled:opacity-50"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {modalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold">Reject Transaction</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ID: <span className="font-mono">{modalTx.id.slice(0, 8)}…</span>
              {" "}&mdash; {modalTx.pair} —{" "}
              {modalTx.source_amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <label className="mt-4 block text-sm font-medium">
              Reason for rejection
            </label>
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800 dark:bg-gray-950"
              rows={3}
              placeholder="e.g. Suspicious structuring pattern"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setModalTx(null)
                  setRejectReason("")
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectReason.trim() || reviewMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
