import { Outlet } from "@tanstack/react-router";
import { Surface } from "@heroui/react";
import { SidebarNav } from "./SidebarNav";

/**
 * AppLayout - The primary shell for the "Avant-Garde ERP".
 * Uses a Surface-based layout to create a "workbench" effect with 
 * depth, oklch surfaces, and premium transitions.
 */
export function AppLayout() {
    return (
        <div className="flex min-h-screen bg-surface-base selection:bg-accent/20">
            <SidebarNav />
            <div className="flex-1 flex flex-col min-w-0">
                <Surface
                    variant="default"
                    className="flex-1 m-4 sm:m-6 rounded-3xl shadow-premium-sm flex flex-col overflow-hidden"
                >
                    <main className="flex-1 overflow-y-auto px-6 sm:px-12 py-8">
                        <Outlet />
                    </main>
                </Surface>
            </div>
        </div>
    );
}
