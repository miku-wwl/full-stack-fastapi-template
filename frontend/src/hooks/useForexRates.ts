import { useQuery } from "@tanstack/react-query";
import { RatesService } from "@/client";

/**
 * Custom hook for live forex rates with 5-second polling.
 * Returns all active currency pairs with their latest rate data.
 */
export function useForexRates() {
  return useQuery({
    queryKey: ["rates", "live"],
    queryFn: () => RatesService.readRatesLive(),
    refetchInterval: 5_000,   // poll every 5 seconds
    staleTime: 0,             // always treat data as stale for immediate refresh
  });
}
