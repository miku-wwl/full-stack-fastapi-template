/** Utility functions for API error handling and string formatting. */

import { AxiosError } from "axios"
import type { ApiError } from "./client"

/** Extract a human-readable error message from an API error response. */
function extractErrorMessage(err: ApiError): string {
  if (err instanceof AxiosError) {
    return err.message
  }

  // The API error body may contain a 'detail' field (string or validation error array)
  const body = err.body as { detail?: string | Array<{ msg: string }> } | undefined
  const errDetail = body?.detail
  if (Array.isArray(errDetail) && errDetail.length > 0) {
    return errDetail[0].msg
  }
  return errDetail || "Something went wrong."
}

export const handleError = function (
  this: (msg: string) => void,
  err: ApiError,
) {
  const errorMessage = extractErrorMessage(err)
  this(errorMessage)
}

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
