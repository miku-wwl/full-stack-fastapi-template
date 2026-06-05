import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import AppLayout from "@/layout/AppLayout"
import { isLoggedIn } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate({ to: "/login", replace: true })
    }
  }, [navigate])

  return <AppLayout />
}

