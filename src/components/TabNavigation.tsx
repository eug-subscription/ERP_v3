import { Tabs, Dropdown, Button, Label } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

interface Section {
  id: string;
  name: string;
  icon: string;
  path: string;
}

const PRIMARY_SECTIONS: Section[] = [
  { id: "overview", name: "Overview", icon: "lucide:layout-dashboard", path: "/overview" },
  { id: "details", name: "Details", icon: "lucide:file-text", path: "/details" },
  { id: "uploading", name: "Upload", icon: "lucide:upload", path: "/uploading" },
  { id: "original-photos", name: "Photos", icon: "lucide:image", path: "/original" },
  { id: "messages", name: "Messages", icon: "lucide:message-circle", path: "/messages" },
  { id: "timeline", name: "Timeline", icon: "lucide:clock", path: "/timeline" },
  { id: "billing", name: "Billing", icon: "lucide:receipt", path: "/billing" },
];

const OVERFLOW_SECTIONS: Section[] = [
  { id: "items", name: "Matching", icon: "lucide:puzzle", path: "/items" },
  { id: "team", name: "Team", icon: "lucide:users", path: "/team" },
  { id: "moderation", name: "Moderation", icon: "lucide:shield-check", path: "/moderation" },
  { id: "shot-list", name: "Shot List", icon: "lucide:clipboard-list", path: "/shot-list" },
];

/**
 * TabNavigation - Order management section tabs.
 * Primary tabs are always visible. Less-used tabs are hidden under a "More" Dropdown.
 * Uses HeroUI v3 href+render pattern for native routing integration.
 */
export function TabNavigation() {
  const routerState = useRouterState();
  const navigate = useNavigate();

  const pathname = routerState.location.pathname;
  const activePrimaryTab = PRIMARY_SECTIONS.find((s) => pathname === s.path)?.id;
  const activeOverflowSection = OVERFLOW_SECTIONS.find((s) => pathname === s.path);
  const isOverflowActive = activeOverflowSection !== undefined;

  return (
    <div className="mb-6 flex items-center gap-1">
      <Tabs selectedKey={activePrimaryTab || "overflow"}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Order Management sections" className="p-1 whitespace-nowrap">
            {PRIMARY_SECTIONS.map((section, index) => (
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

      <Dropdown>
        <Button
          variant={isOverflowActive ? "primary" : "tertiary"}
          size="sm"
          className={`ml-1 shrink-0 h-10 ${!isOverflowActive ? "text-muted" : ""}`}
          aria-label="More navigation options"
        >
          {isOverflowActive && (
            <Icon icon={activeOverflowSection!.icon} className="size-4 shrink-0" />
          )}
          {isOverflowActive ? activeOverflowSection!.name : "More"}
          <Icon icon="lucide:chevron-down" className="w-3.5 h-3.5 ml-1" />
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu
            onAction={(key) => {
              void navigate({ to: key as string });
            }}
          >
            {OVERFLOW_SECTIONS.map((section) => (
              <Dropdown.Item key={section.id} id={section.path} textValue={section.name}>
                <Icon icon={section.icon} className="size-4 shrink-0 text-muted" />
                <Label>{section.name}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
