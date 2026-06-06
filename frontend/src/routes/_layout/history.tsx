import { createFileRoute } from "@tanstack/react-router"
import TransactionTable from "@/components/forex/TransactionTable"

export const Route = createFileRoute("/_layout/history")({
  component: HistoryPage,
  head: () => ({
    meta: [
      {
        title: "Transaction History - ForeXchange",
      },
    ],
  }),
})

function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
          Transaction History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Immutable ledger of all remittance transactions
        </p>
      </div>
      <TransactionTable />
    </div>
  )
}
