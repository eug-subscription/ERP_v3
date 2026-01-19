import React from "react";
import { Outlet } from "@tanstack/react-router";
import { Header } from "../Header";
import { TabNavigation } from "../TabNavigation";
import { OrderInfo } from "../OrderInfo";

export function OrderLayout() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <TabNavigation />
            <div className="container mx-auto px-4 py-4 pt-6 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
                        <OrderInfo />
                    </div>
                </div>
            </div>
        </div>
    );
}
