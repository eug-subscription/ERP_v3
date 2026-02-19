import React from "react";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
// Eagerly imported — these 6 components are <1KB combined, not worth lazy-loading.
// Trade-off: lose code-splitting but gain stable component identity to prevent remounting.
import {
  AccountComingSoon,
  NotificationsComingSoon,
  SecurityComingSoon,
  ManagersComingSoon,
  GuidelinesComingSoon,
  SettingsComingSoon,
} from "./components/ComingSoonPages";

// 1. Root Route - Global shell (providers, etc.)
const rootRoute = createRootRoute({
  component: React.lazy(() =>
    import("./components/layouts/AppLayout").then(m => ({ default: m.AppLayout }))
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
  component: React.lazy(() => import("./components/FileUploadTabs").then(m => ({ default: m.FileUploadTabs }))),
});

const originalRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/original",
  component: React.lazy(() => import("./components/OriginalPhotos").then(m => ({ default: m.OriginalPhotos }))),
});

const itemsRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/items",
  component: React.lazy(() => import("./components/Matching/MatchingTab").then(m => ({ default: m.MatchingTab }))),
});

const teamRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/team",
  component: React.lazy(() => import("./components/TeamMembers").then(m => ({ default: m.TeamMembers }))),
});


const timelineRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/timeline",
  component: React.lazy(() => import("./components/Timeline").then(m => ({ default: m.Timeline }))),
});

const billingRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/billing",
  component: React.lazy(() => import("./components/OrderBillingRoute").then(m => ({ default: m.OrderBillingRoute }))),
});

const messagesRoute = createRoute({
  getParentRoute: () => orderLayoutRoute,
  path: "/messages",
  component: React.lazy(() => import("./components/Messages/MessagesTab").then(m => ({ default: m.MessagesTab }))),
});

// 4. Project Page Route (Parent)
const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project/$projectId",
  component: React.lazy(() => import("./components/ProjectPage/ProjectPage").then(m => ({ default: m.ProjectPage }))),
});

const projectIndexRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/",
  beforeLoad: ({ navigate, params: { projectId } }) => {
    throw navigate({ to: `/project/${projectId}/prices`, replace: true });
  },
});

const projectAccountRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/account",
  component: AccountComingSoon,
});

const projectNotificationsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/notifications",
  component: NotificationsComingSoon,
});

const projectSecurityRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/security",
  component: SecurityComingSoon,
});

const projectManagersRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/managers",
  component: ManagersComingSoon,
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

const projectPricingBetaRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/pricing-beta",
  component: React.lazy(() => import("./components/ProjectPage/Pricing/ProjectPricingTab").then(m => ({ default: m.ProjectPricingTab }))),
});

const projectGuidelinesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/guidelines",
  component: GuidelinesComingSoon,
});

const projectSettingsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: "/settings",
  component: SettingsComingSoon,
});

export type PricingTab = "rate-items" | "rate-cards" | "modifier-codes";

export type PricingSearch = {
  tab?: PricingTab;
};

// Rates Layout Route (Parent)
const ratesLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_rates",
  component: React.lazy(() =>
    import("./components/RateManagement/RatesLayout").then(m => ({ default: m.RatesLayout }))
  ),
});

// Rates Index Route (Main page with tabs)
const ratesIndexRoute = createRoute({
  getParentRoute: () => ratesLayoutRoute,
  path: "/rates",
  validateSearch: (search: Record<string, unknown>): PricingSearch => {
    return {
      tab: (search.tab as PricingTab) || "rate-items",
    };
  },
  component: React.lazy(() =>
    import("./components/RateManagement/RateManagementPage").then(m => ({ default: m.RateManagementPage }))
  ),
});

// Rate Card Detail Route
const rateCardDetailRoute = createRoute({
  getParentRoute: () => ratesLayoutRoute,
  path: "/rates/rate-cards/$cardId",
  component: React.lazy(() =>
    import("./components/RateManagement/RateCards/RateCardDetailPage").then(m => ({ default: m.RateCardDetailPage }))
  ),
});

// 5. Create Router
const routeTree = rootRoute.addChildren([
  orderLayoutRoute.addChildren([
    indexRoute,
    uploadingRoute,
    originalRoute,
    itemsRoute,
    teamRoute,
    billingRoute,
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
    projectPricingBetaRoute,
    projectGuidelinesRoute,
    projectSettingsRoute,
  ]),
  ratesLayoutRoute.addChildren([
    ratesIndexRoute,
    rateCardDetailRoute,
  ]),
]);

export const router = createRouter({ routeTree });

// 6. Register router for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
