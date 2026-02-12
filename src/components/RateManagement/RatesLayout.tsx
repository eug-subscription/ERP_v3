import { Outlet } from "@tanstack/react-router";

/**
 * RatesLayout - Simple layout wrapper for nested routes under /rates
 * Provides a container for both the RateManagementPage (index) and RateCardDetailPage (detail)
 */
export function RatesLayout() {
    return <Outlet />;
}
