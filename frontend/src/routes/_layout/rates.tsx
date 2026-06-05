import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/rates")({
  component: RatesPage,
  head: () => ({
    meta: [
      {
        title: "Live Rates - ForeXchange",
      },
    ],
  }),
})

function RatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Rates</h1>
        <p className="text-muted-foreground">
          Real-time currency exchange rates and market data
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">
          Live rates dashboard coming in Phase 5
        </p>
      </div>
    </div>
  )
}
