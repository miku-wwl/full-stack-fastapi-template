import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_layout/remittance")({
  component: RemittancePage,
  head: () => ({
    meta: [
      {
        title: "New Remittance - ForeXchange",
      },
    ],
  }),
})

function RemittancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Remittance</h1>
        <p className="text-muted-foreground">
          Initiate a new cross-border remittance transaction
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">
          Remittance form coming in Phase 7
        </p>
      </div>
    </div>
  )
}
