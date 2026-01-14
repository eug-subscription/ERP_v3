import React from "react";
import { Tabs } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

interface Section {
  id: string;
  name: string;
  icon: string;
  path: string;
}

export function TabNavigation() {
  const routerState = useRouterState();
  const navigate = useNavigate();

  // Map internal IDs to the paths defined in router.tsx
  const sections: Section[] = [
    { id: "uploading", name: "Upload", icon: "lucide:upload", path: "/uploading" },
    { id: "original-photos", name: "Photos", icon: "lucide:image", path: "/original" },
    { id: "items", name: "Matching", icon: "lucide:puzzle", path: "/items" },
    { id: "messages", name: "Messages", icon: "lucide:message-circle", path: "/messages" },
    { id: "team", name: "Team", icon: "lucide:users", path: "/team" },
    { id: "finances", name: "Finance", icon: "lucide:dollar-sign", path: "/finances" },
    { id: "timeline", name: "Timeline", icon: "lucide:clock", path: "/timeline" },
  ];

  // Determine active tab based on current pathname
  const activeTab =
    sections.find((s) => routerState.location.pathname === s.path)?.id || "uploading";

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-default-100 mb-8">
      <div className="container mx-auto px-4 max-w-7xl py-4">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => {
            const section = sections.find((s) => s.id === key);
            if (section) {
              navigate({ to: section.path });
            }
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Order Management sections" className="p-1">
              {sections.map((section) => (
                <Tabs.Tab key={section.id} id={section.id}>
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
    </div>
  );
}
