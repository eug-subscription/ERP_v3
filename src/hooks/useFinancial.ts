import { useQuery } from "@tanstack/react-query";
import { mockFinancialData, FinancialBreakdownData } from "../data/mock-financial";

async function fetchFinancialData(): Promise<FinancialBreakdownData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 550));
    return mockFinancialData;
}

export function useFinancial() {
    return useQuery({
        queryKey: ["financial"],
        queryFn: fetchFinancialData,
    });
}
