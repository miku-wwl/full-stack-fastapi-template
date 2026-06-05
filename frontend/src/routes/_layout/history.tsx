import { createFileRoute } from "@tanstack/react-router"

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
        <h1 className="text-2xl font-bold tracking-tight">
          Transaction History
        </h1>
        <p className="text-muted-foreground">
          View your complete remittance transaction history
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">
          Transaction history table coming in Phase 8
        </p>
      </div>
    </div>
  )
}
