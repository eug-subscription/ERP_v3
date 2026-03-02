import React from "react";
import { Alert, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TeamMemberModal } from "./TeamMemberModal";
import { TeamTable } from "./Team/TeamTable";
import { useTeam } from "../hooks/useTeam";
import { TEXT_TAB_HEADING, TEXT_TINY_MUTED_BOLD } from "../constants/ui-tokens";

export function TeamMembers() {
  const { teamMembers, isLoading, error } = useTeam();

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleSelected = (id: string) => {
    const next = new Set(selectedKeys);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedKeys(next);
  };

  const handleSelectAll = () => {
    if (selectedKeys.size === teamMembers.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(teamMembers.map((m) => m.id)));
    }
  };

  if (isLoading) {
    return (
      <section className="mb-8 scroll-mt-32">
        <header className="flex items-center justify-between mb-6">
          <div className="h-10 w-48 bg-default animate-pulse rounded-lg" />
          <div className="h-12 w-32 bg-default animate-pulse rounded-xl" />
        </header>
        <div className="h-64 bg-surface-secondary animate-pulse rounded-premium-lg border border-default" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8 scroll-mt-32">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Failed to load team members</Alert.Title>
            <Alert.Description>
              An error occurred while fetching the team. Please try refreshing the page.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </section>
    );
  }

  return (
    <section className="mb-8 scroll-mt-32">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className={TEXT_TAB_HEADING}>Team Members</h2>
          <p className="text-default-500 text-sm mt-1 font-medium">
            Manage your team and their roles across projects.
          </p>
        </div>
        <Button variant="primary" size="md" onPress={() => setIsOpen(true)}>
          <Icon icon="lucide:user-plus" />
          Add Member
        </Button>
      </header>

      <TeamTable
        members={teamMembers}
        selectedKeys={selectedKeys}
        onSelectAll={handleSelectAll}
        onToggleSelect={toggleSelected}
        onAddMember={() => setIsOpen(true)}
      />

      <div className="flex items-center px-8 py-6 bg-surface-secondary border-t border-default rounded-b-2xl">
        <div className={TEXT_TINY_MUTED_BOLD}>
          {selectedKeys.size} of {teamMembers.length} selected
        </div>
      </div>

      <TeamMemberModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onAddMember={() => setIsOpen(false)}
      />
    </section>
  );
}
