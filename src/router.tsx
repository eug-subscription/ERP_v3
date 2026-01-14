import React from "react";
import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { Header } from "./components/Header";
import { TabNavigation } from "./components/TabNavigation";
import { OrderInfo } from "./components/OrderInfo";
import { FileUploadSection } from "./components/FileUploadSection";
import { OriginalPhotos } from "./components/OriginalPhotos";
import { UnmatchedItems } from "./components/UnmatchedItems";
import { TeamMembers } from "./components/TeamMembers";
import { FinancialBreakdown } from "./components/FinancialBreakdown";
import { Timeline } from "./components/Timeline";
import { Messages } from "./components/Messages";

// 1. Root Route - Defines the global layout
const rootRoute = createRootRoute({
  component: () => (
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
  ),
});

// 2. Child Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ navigate }) => {
    throw navigate({ to: "/uploading", replace: true });
  },
});

const uploadingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/uploading",
  component: () => (
    <div>
      <FileUploadSection
        title="Uploading unedited photos"
        description="Upload unedited photos for further processing."
        type="unedited"
      />
      <FileUploadSection
        title="Uploading edited photos"
        description="Upload a folder with all edited photos to the same structure as the original photos."
        type="edited"
      />
    </div>
  ),
});

const originalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/original",
  component: OriginalPhotos,
});

const itemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/items",
  component: UnmatchedItems,
});

const teamRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/team",
  component: TeamMembers,
});

const financesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finances",
  component: FinancialBreakdown,
});

const timelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/timeline",
  component: Timeline,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: Messages,
});

// 3. Create Router
const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadingRoute,
  originalRoute,
  itemsRoute,
  teamRoute,
  financesRoute,
  timelineRoute,
  messagesRoute,
]);

export const router = createRouter({ routeTree });

// 4. Register router for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
