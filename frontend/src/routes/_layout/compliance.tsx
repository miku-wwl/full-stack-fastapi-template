import { createFileRoute, redirect } from "@tanstack/react-router"
import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/compliance")({
  component: CompliancePage,
  head: () => ({
    meta: [
      {
        title: "Compliance Audit - ForeXchange",
      },
    ],
  }),
})

function CompliancePage() {
  const { user } = useAuth()

  // Route guard: redirect non-auditor users
  if (user && user.role !== "auditor") {
    throw redirect({ to: "/" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Compliance Audit
        </h1>
        <p className="text-muted-foreground">
          Review flagged transactions and compliance alerts (Auditor only)
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">
          Compliance audit dashboard coming in Phase 9
        </p>
      </div>
    </div>
  )
}
