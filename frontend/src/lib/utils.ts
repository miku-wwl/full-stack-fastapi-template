/** Utility for merging Tailwind CSS class names with conflict resolution. */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge class names using clsx and tailwind-merge to handle conflicting utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
