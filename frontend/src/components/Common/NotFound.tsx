/** 404 page displayed when no route matches the current URL. */

import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Home, SearchX } from "lucide-react"

const NotFound = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center flex-col p-4 bg-gray-50 dark:bg-gray-950"
      data-testid="not-found"
    >
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="mb-6 rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
          <SearchX className="h-12 w-12 text-amber-600 dark:text-amber-400" />
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
