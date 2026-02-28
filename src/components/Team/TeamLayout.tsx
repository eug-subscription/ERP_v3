import { Outlet } from "@tanstack/react-router";

/**
 * TeamLayout – Simple layout wrapper for nested routes under /team.
 * Mirrors the RatesLayout pattern (pathless layout group).
 */
export function TeamLayout() {
    return <Outlet />;
}
