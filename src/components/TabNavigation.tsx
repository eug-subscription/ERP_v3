import { Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link, useRouterState } from "@tanstack/react-router";

interface Section {
  id: string;
  name: string;
  icon: string;
  path: string;
}

/**
 * TabNavigation - Order management section tabs.
 * Uses HeroUI v3 href+render pattern for native routing integration.
 */
export function TabNavigation() {
  const routerState = useRouterState();

  // Map internal IDs to the paths defined in router.tsx
  const sections: Section[] = [
    { id: "uploading", name: "Upload", icon: "lucide:upload", path: "/uploading" },
    { id: "original-photos", name: "Photos", icon: "lucide:image", path: "/original" },
    { id: "items", name: "Matching", icon: "lucide:puzzle", path: "/items" },
    { id: "messages", name: "Messages", icon: "lucide:message-circle", path: "/messages" },
    { id: "team", name: "Team", icon: "lucide:users", path: "/team" },
    { id: "billing", name: "Billing (Beta)", icon: "lucide:receipt", path: "/billing" },
    { id: "timeline", name: "Timeline", icon: "lucide:clock", path: "/timeline" },
    { id: "moderation", name: "Moderation", icon: "lucide:shield-check", path: "/moderation" },
    { id: "shot-list", name: "Shot List", icon: "lucide:clipboard-list", path: "/shot-list" },
  ];

  // Determine active tab based on current pathname
  const activeTab =
    sections.find((s) => routerState.location.pathname === s.path)?.id || "uploading";

  return (
    <div className="mb-6">
      <Tabs
        selectedKey={activeTab}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Order Management sections" className="p-1">
            {sections.map((section, index) => (
              <Tabs.Tab
                key={section.id}
                id={section.id}
                href={section.path}
                // @ts-expect-error - HeroUI v3 render prop types don't align with TanStack Router Link props
                render={(domProps) => <Link {...domProps} to={section.path} />}
              >
                {index > 0 && <Tabs.Separator />}
                <div className="flex items-center gap-2 px-2">
                  <Icon icon={section.icon} className="w-4 h-4" />
                  <span className="font-medium">{section.name}</span>
                </div>
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  );
}

