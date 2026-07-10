/**
 * Custom toast notification hook.
 *
 * Wraps the `sonner` toast library to provide standardised success/error
 * messages across the application.
 */

import { toast } from "sonner"

/** Hook returning showSuccessToast and showErrorToast helper functions. */
const useCustomToast = () => {
  /** Display a success toast with the given description text. */
  const showSuccessToast = (description: string) => {
    toast.success("Success!", {
      description,
    })
  }

  /** Display an error toast with the given description text. */
  const showErrorToast = (description: string) => {
    toast.error("Something went wrong!", {
      description,
    })
  }

  return { showSuccessToast, showErrorToast }
}

export default useCustomToast
