export interface FinancialItem {
    label: string;
    value: string;
}

export interface FinancialBreakdownData {
    orderNumber: string;
    costs: {
        items: FinancialItem[];
        total: string;
    };
    revenue: {
        items: FinancialItem[];
        total: string;
    };
    summary: {
        grossProfit: string;
        netFinal: string;
        profitMargin: string;
    };
}

export const mockFinancialData: FinancialBreakdownData = {
    orderNumber: "123456",
    costs: {
        items: [
            { label: "Photographer price", value: "$500 (£400)" },
            { label: "Travel cost", value: "$500 (£400)" },
            { label: "Videographer price", value: "$500 (£400)" },
            { label: "Other expenses", value: "$500 (£400)" },
            { label: "Retoucher Standard", value: "£500" },
            { label: "VAT", value: "£400" },
        ],
        total: "£5,500",
    },
    revenue: {
        items: [
            { label: "Photography (10 dishes)", value: "£400" },
            { label: "Image-to-menu creation", value: "£400" },
            { label: "Standard editing", value: "£1,000" },
            { label: "AI Generations", value: "£400" },
        ],
        total: "£6,500",
    },
    summary: {
        grossProfit: "£1,000",
        netFinal: "£1,200",
        profitMargin: "+20%",
    },
};
