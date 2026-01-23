import React from "react";
import { Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

// 1. Root Route - Global shell (providers, etc.)
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  ),
});

// 2. Order Layout Route (Pathless)
const orderLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_order",
  component: React.lazy(() => import("./components/layouts/OrderLayout").then(m => ({ default: m.OrderLayout }))),
});

// 3. Child Routes (Order)
const indexRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/",
  beforeLoad: ({ navigate }) => {
    throw navigate({ to: "/uploading", replace: true });
  },
});

const uploadingRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/uploading",
  component: () => {
    const FileUploadSection = React.lazy(() => import("./components/FileUploadSection").then(m => ({ default: m.FileUploadSection })));
    return (
      <React.Suspense fallback={<div className="p-8 text-center animate-pulse">Loading Uploads...</div>}>
        <FileUploadSection
          title="Uploading unedited photos"
          description="Upload unedited photos for further processing."
        />
        <FileUploadSection
          title="Uploading edited photos"
          description="Upload a folder with all edited photos to the same structure as the original photos."
        />
      </React.Suspense>
    );
  },
});

const originalRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/original",
  component: React.lazy(() => import("./components/OriginalPhotos").then(m => ({ default: m.OriginalPhotos }))),
});

const itemsRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/items",
  component: React.lazy(() => import("./components/UnmatchedItems").then(m => ({ default: m.UnmatchedItems }))),
});

const teamRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/team",
  component: React.lazy(() => import("./components/TeamMembers").then(m => ({ default: m.TeamMembers }))),
});

const financesRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/finances",
  component: React.lazy(() => import("./components/FinancialBreakdown").then(m => ({ default: m.FinancialBreakdown }))),
});

const timelineRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/timeline",
  component: React.lazy(() => import("./components/Timeline").then(m => ({ default: m.Timeline }))),
});

const messagesRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/messages",
  component: React.lazy(() => import("./components/Messages").then(m => ({ default: m.Messages }))),
});

// 4. Project Page Route (Parent)
const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project",
  component: React.lazy(() => import("./components/ProjectPage/ProjectPage").then(m => ({ default: m.ProjectPage }))),
});

const projectIndexRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/",
  beforeLoad: ({ navigate }) => {
    throw navigate({ to: "/project/prices", replace: true });
  },
});

const projectAccountRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/account",
  component: () => <div className="p-8 text-center text-default-500">Account Details (Coming Soon)</div>,
});

const projectNotificationsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/notifications",
  component: () => <div className="p-8 text-center text-default-500">Notifications (Coming Soon)</div>,
});

const projectSecurityRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/security",
  component: () => <div className="p-8 text-center text-default-500">Security (Coming Soon)</div>,
});

const projectManagersRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/managers",
  component: () => <div className="p-8 text-center text-default-500">Managers (Coming Soon)</div>,
});

const projectPricesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/prices",
  component: React.lazy(() => import("./components/ProjectPage/ProjectPrices").then(m => ({ default: m.ProjectPrices }))),
});

const projectWorkflowRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/workflow",
  component: React.lazy(() => import("./components/ProjectPage/WorkflowBuilder/WorkflowBuilder").then(m => ({ default: m.WorkflowBuilder }))),
});

const projectGuidelinesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/guidelines",
  component: () => <div className="p-8 text-center text-default-500">Guidelines (Coming Soon)</div>,
});

const projectSettingsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/settings",
  component: () => <div className="p-8 text-center text-default-500">Settings (Coming Soon)</div>,
});

// 5. Create Router
const routeTree = rootRoute.addChildren([
  orderLayoutRoute.addChildren([
    indexRoute,
    uploadingRoute,
    originalRoute,
    itemsRoute,
    teamRoute,
    financesRoute,
    timelineRoute,
    messagesRoute,
  ]),
  projectRoute.addChildren([
    projectIndexRoute,
    projectAccountRoute,
    projectNotificationsRoute,
    projectSecurityRoute,
    projectManagersRoute,
    projectPricesRoute,
    projectWorkflowRoute,
    projectGuidelinesRoute,
    projectSettingsRoute,
  ]),
]);

export const router = createRouter({ routeTree });

// 6. Register router for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
