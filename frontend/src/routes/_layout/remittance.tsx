import { createFileRoute } from "@tanstack/react-router"
import RemittanceForm from "@/components/forex/RemittanceForm"

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
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
          New Remittance
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Initiate a cross-border remittance with real-time exchange rates
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <RemittanceForm />
      </div>
    </div>
  )
}
