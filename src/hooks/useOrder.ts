import { useQuery } from "@tanstack/react-query";
import { mockOrderData, OrderData } from "../data/mock-order";

/**
 * Simulates an asynchronous API fetch for order data.
 * @returns A promise that resolves with the mock order data after a delay.
 */
async function fetchOrderData(): Promise<OrderData> {
  // Simulate network delay (800ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real app, this would be:
  // const response = await fetch('/api/orders/123');
  // return response.json();

  return mockOrderData;
}

/**
 * Hook to fetch and manage order data using TanStack Query.
 */
export function useOrder() {
  return useQuery({
    queryKey: ["order"],
    queryFn: fetchOrderData,
    // Add some options to keep data fresh but not refetch too aggressively
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
