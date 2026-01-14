import React from "react";
import { Avatar, Button, Chip, Checkbox, Input, Label, Separator } from "@heroui/react";
import { Icon } from "@iconify/react";
import { TeamMemberModal } from "./TeamMemberModal";

interface TeamMember {
  id: string;
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  role: string;
  status: "Active" | "Paused" | "Inactive";
  addedDate: string;
  lastActivity: string;
  workerId: string;
}

export const TeamMembers = () => {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(["2"]));
  const [page, setPage] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(false);

  const [teamMembers] = React.useState<TeamMember[]>([
    {
      id: "1",
      user: {
        name: "Tony Reichert",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=1",
        email: "tony.reichert@wolt.com",
      },
      role: "Sales",
      status: "Active",
      addedDate: "Jun 21st, 2024",
      lastActivity: "2 hours ago",
      workerId: "4121",
    },
    {
      id: "2",
      user: {
        name: "Zoey Lang",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=2",
        email: "zoey.lang@wolt.com",
      },
      role: "Onboarding manager",
      status: "Paused",
      addedDate: "Dec 11th, 2023",
      lastActivity: "1 day ago",
      workerId: "1123",
    },
    {
      id: "3",
      user: {
        name: "Jane Fisher",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=3",
        email: "jane.fisher@wolt.com",
      },
      role: "Senior Developer",
      status: "Inactive",
      addedDate: "Feb 20th, 2024",
      lastActivity: "2 weeks ago",
      workerId: "6542",
    },
  ]);

  const handleAddMember = (_userId: string) => {
    setIsOpen(false);
  };

  const statusColorMap: Record<string, "success" | "warning" | "default"> = {
    Active: "success",
    Paused: "warning",
    Inactive: "default",
  };

  const toggleSelected = (id: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedKeys(newSelected);
  };

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
          className="shadow-accent-md font-bold px-6 py-6"
          onPress={() => setIsOpen(true)}
        >
          <Icon icon="lucide:user-plus" className="w-5 h-5 mr-3" />
          Add Member
        </Button>
      </div>

      <div className="rounded-[2.5rem] border border-default-200 overflow-hidden bg-white shadow-premium">
        <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-default-50/50 border-b border-default-200 gap-4">
          <div className="w-full max-w-sm">
            <div className="space-y-1">
              <Label className="sr-only">Search team members</Label>
              <Input
                placeholder="Search by name, email or role..."
                className="w-full h-12 px-5 rounded-2xl border border-default-200 bg-white shadow-sm focus:ring-2 focus:ring-accent/20"
                aria-label="Search team members"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="bg-white border-default-200 rounded-xl px-5 h-12 font-bold flex items-center gap-2"
            >
              <Icon icon="lucide:filter" className="w-4 h-4" /> Filter
            </Button>
            <Button
              variant="ghost"
              className="bg-white border-default-200 rounded-xl px-5 h-12 font-bold flex items-center gap-2"
            >
              <Icon icon="lucide:arrow-up-down" className="w-4 h-4" /> Sort
            </Button>
            <Separator orientation="vertical" className="h-8 bg-default-200 mx-2" />
            <span className="text-xs font-black text-default-400 uppercase tracking-widest whitespace-nowrap">
              {selectedKeys.size} Selected
            </span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-default-50 text-default-500 font-black text-[10px] uppercase tracking-[0.2em] border-b border-default-200">
              <tr>
                <th className="px-6 py-5 w-10">
                  <Checkbox />
                </th>
                <th className="px-6 py-5">Member</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5">Added Date</th>
                <th className="px-6 py-5">Last Activity</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100">
              {teamMembers.map((member) => (
                <tr
                  key={member.id}
                  className={
                    selectedKeys.has(member.id)
                      ? "bg-accent/5"
                      : "hover:bg-default-50/50 transition-colors group"
                  }
                >
                  <td className="px-6 py-5">
                    <Checkbox
                      isSelected={selectedKeys.has(member.id)}
                      onChange={() => toggleSelected(member.id)}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <Avatar size="md" className="ring-2 ring-white shadow-sm">
                        <Avatar.Image src={member.user.avatar} alt={member.user.name} />
                      </Avatar>
                      <div>
                        <div className="font-bold text-default-900">{member.user.name}</div>
                        <div className="text-xs text-default-400 font-medium">
                          {member.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-default-600 font-bold">{member.role}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={statusColorMap[member.status]}
                        className="font-black px-3 py-1"
                      >
                        {member.status.toUpperCase()}
                      </Chip>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-default-500 font-medium">{member.addedDate}</td>
                  <td className="px-6 py-5 text-default-500 font-medium">{member.lastActivity}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button isIconOnly variant="ghost" size="sm" className="rounded-xl">
                        <Icon icon="lucide:eye" className="w-4 h-4 text-default-400" />
                      </Button>
                      <Button isIconOnly variant="ghost" size="sm" className="rounded-xl">
                        <Icon icon="lucide:pencil" className="w-4 h-4 text-default-400" />
                      </Button>
                      <Button
                        isIconOnly
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-danger hover:bg-danger/10 border-none"
                      >
                        <Icon icon="lucide:trash-2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-8 py-6 bg-default-50/50 border-t border-default-200">
          <div className="text-[10px] font-black text-default-400 uppercase tracking-[0.2em]">
            {selectedKeys.size} of {teamMembers.length} selected
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white border-default-200 rounded-xl font-bold px-4"
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {[1].map((pageNum) => (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={pageNum === page ? "primary" : "ghost"}
                  className="font-black min-w-[36px] rounded-xl"
                  onPress={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white border-default-200 rounded-xl font-bold px-4"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <TeamMemberModal isOpen={isOpen} onOpenChange={setIsOpen} onAddMember={handleAddMember} />
    </section>
  );
};
