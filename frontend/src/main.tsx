/**
 * Application entry point.
 *
 * Initialises React Query, TanStack Router, theme provider, i18n,
 * and configures the OpenAPI client base URL and auth token injection.
 */

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { HelmetProvider } from "react-helmet-async"
import { ApiError, OpenAPI } from "./client"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/sonner"
import { toast } from "sonner"
import "./index.css"
import "./i18n"
import { routeTree } from "./routeTree.gen"

// Configure OpenAPI client: backend URL from env, token from localStorage
OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

/** Handle 401/403 API errors by clearing session and redirecting to login. */
const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_role")
    toast.error(error.status === 401 ? "Session expired. Please log in again." : "Access denied.")
    setTimeout(() => {
      window.location.href = "/login"
    }, 800)
  }
}
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Assert root element exists — guaranteed by index.html template
const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element #root not found in index.html")

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster richColors closeButton />
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
)
