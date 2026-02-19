import { Avatar, Button, Chip, Checkbox, Dropdown, Label } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TeamMemberModal } from "./TeamMemberModal";
import { useTeam } from "../hooks/useTeam";
import { Table } from "./pricing/Table";

export function TeamMembers() {
  const {
    teamMembers,
    selectedKeys,
    page,
    isOpen,
    isLoading,
    setIsOpen,
    setPage,
    toggleSelected,
    handleAddMember,
  } = useTeam();

  const statusColorMap: Record<string, "success" | "warning" | "default"> = {
    Active: "success",
    Paused: "warning",
    Inactive: "default",
  };

  if (isLoading) {
    return (
      <section className="mb-8 scroll-mt-32">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 w-48 bg-default-200 animate-pulse rounded-lg" />
          <div className="h-12 w-32 bg-default-200 animate-pulse rounded-xl" />
        </div>
        <div className="h-64 bg-default-50 animate-pulse rounded-premium-lg border border-default-200" />
      </section>
    );
  }

  return (
    <section className="mb-8 scroll-mt-32">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-default-900 tracking-tight">Team Members</h2>
          <p className="text-default-500 text-sm mt-1 font-medium">
            Manage your team and their roles across projects.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onPress={() => setIsOpen(true)}
        >
          <Icon icon="lucide:user-plus" />
          Add Member
        </Button>
      </div>

      <Table>
        <Table.Header>
          <tr>
            <Table.Column className="w-10">
              <Checkbox>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox>
            </Table.Column>
            <Table.Column isBlack>Member</Table.Column>
            <Table.Column>Role</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Added Date</Table.Column>
            <Table.Column>Last Activity</Table.Column>
            <Table.Column align="right">Actions</Table.Column>
          </tr>
        </Table.Header>
        <Table.Body>
          {teamMembers.map((member) => (
            <Table.Row
              key={member.id}
              className={selectedKeys.has(member.id) ? "!bg-accent/5" : ""}
            >
              <Table.Cell>
                <Checkbox
                  isSelected={selectedKeys.has(member.id)}
                  onChange={() => toggleSelected(member.id)}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <Avatar.Image src={member.user.avatar} alt={member.user.name} />
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-default-900">{member.user.name}</div>
                    <div className="text-xs text-default-400 font-normal">
                      {member.user.email}
                    </div>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <span className="text-sm font-medium text-default-600">{member.role}</span>
              </Table.Cell>
              <Table.Cell>
                <Chip
                  size="sm"
                  variant="soft"
                  color={statusColorMap[member.status]}
                >
                  {member.status}
                </Chip>
              </Table.Cell>
              <Table.Cell>
                <span className="text-xs font-medium text-default-500 whitespace-nowrap">{member.addedDate}</span>
              </Table.Cell>
              <Table.Cell>
                <span className="text-xs font-medium text-default-500 whitespace-nowrap">{member.lastActivity}</span>
              </Table.Cell>
              <Table.Cell align="right">
                <Dropdown>
                  <Dropdown.Trigger
                    aria-label="Actions"
                    className="button button-sm button--ghost button--icon-only rounded-full bg-default-100/50 border border-transparent hover:border-accent/20 hover:bg-accent/10 text-default-500"
                  >
                    <Icon icon="lucide:ellipsis-vertical" className="w-4 h-4" />
                  </Dropdown.Trigger>
                  <Dropdown.Popover>
                    <Dropdown.Menu>
                      <Dropdown.Item id="view" textValue="View">
                        <Icon icon="lucide:eye" className="w-4 h-4 text-default-500" />
                        <Label>View</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="edit" textValue="Edit">
                        <Icon icon="lucide:pencil" className="w-4 h-4 text-default-500" />
                        <Label>Edit</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="delete" textValue="Delete" className="text-danger">
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                        <Label>Delete</Label>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <div className="flex justify-between items-center px-8 py-6 bg-default-50/50 border-t border-default-200 rounded-b-2xl">
        <div className="t-mini font-black text-default-400 uppercase tracking-[0.2em]">
          {selectedKeys.size} of {teamMembers.length} selected
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            Previous
          </Button>
          <div className="flex gap-2">
            {[1].map((pageNum) => (
              <Button
                key={pageNum}
                size="sm"
                variant={pageNum === page ? "primary" : "ghost"}
                onPress={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
          <Button variant="ghost" size="sm">
            Next
          </Button>
        </div>
      </div>

      <TeamMemberModal isOpen={isOpen} onOpenChange={setIsOpen} onAddMember={handleAddMember} />
    </section>
  );
}
