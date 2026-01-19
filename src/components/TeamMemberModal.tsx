import React from "react";
import { Avatar, ComboBox, ListBox, Button, Modal, Input, Label } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useUsers } from "../hooks/useUsers";

interface TeamMemberModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddMember: (userId: string) => void;
}


export function TeamMemberModal({
  isOpen,
  onOpenChange,
  onAddMember,
}: TeamMemberModalProps) {
  const { data: users = [] } = useUsers();
  const [selectedKey, setSelectedKey] = React.useState<string | number | null>(null);
  const [filterValue, setFilterValue] = React.useState("");

  const handleCreateNewMember = () => {
    onOpenChange(false);
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.email.toLowerCase().includes(filterValue.toLowerCase()) ||
        user.role.toLowerCase().includes(filterValue.toLowerCase())
    );
  }, [users, filterValue]);

  const handleAddMember = () => {
    if (selectedKey) {
      onAddMember(selectedKey.toString());
      onOpenChange(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-xl font-bold">Add Team Member</Modal.Heading>
              <p className="text-xs text-default-500 font-normal mt-1">
                Select a user from the directory to add to your team.
              </p>
            </Modal.Header>
            <Modal.Body className="pb-8">
              <div className="space-y-6">
                <ComboBox
                  className="w-full"
                  selectedKey={selectedKey}
                  onSelectionChange={setSelectedKey}
                  inputValue={filterValue}
                  onInputChange={setFilterValue}
                >
                  <Label className="text-sm font-bold text-default-700 ml-1 mb-2 block">
                    Search for user
                  </Label>
                  <ComboBox.InputGroup>
                    <Input
                      placeholder="Type to search for a user..."
                      className="bg-default-50 border-none"
                    />
                    <ComboBox.Trigger className="bg-default-50 border-none text-default-400 hover:text-default-600 transition-colors" />
                  </ComboBox.InputGroup>
                  <ComboBox.Popover className="min-w-[400px]">
                    <ListBox className="p-1">
                      {filteredUsers.map((item) => (
                        <ListBox.Item
                          key={item.id}
                          id={item.id}
                          textValue={item.name}
                          className="rounded-xl px-3 py-2.5"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <Avatar.Image src={item.avatar} alt={item.name} />
                            </Avatar>
                            <div className="flex flex-col flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-default-900">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-default-500 font-bold px-2 py-0.5 bg-default-100 rounded uppercase tracking-widest">
                                  {item.role}
                                </span>
                              </div>
                              <span className="text-[10px] text-default-400 font-normal">
                                {item.email}
                              </span>
                            </div>
                          </div>
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                    {filteredUsers.length === 0 && (
                      <div className="p-4 flex flex-col items-stretch border-t border-default-100">
                        <p className="text-default-500 text-center mb-4 text-sm">
                          No results found.
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-full text-accent border-accent font-bold"
                          onPress={handleCreateNewMember}
                        >
                          <Icon icon="lucide:plus" className="w-4 h-4 mr-2" />
                          Add as new team member
                        </Button>
                      </div>
                    )}
                  </ComboBox.Popover>
                </ComboBox>
              </div>
            </Modal.Body>
            <Modal.Footer className="bg-default-50/30 p-4 border-t border-default-100">
              <Button
                variant="ghost"
                className="border-none font-medium hover:bg-default-100"
                onPress={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="px-8 shadow-accent-md font-bold"
                onPress={handleAddMember}
                isDisabled={!selectedKey}
              >
                Add Member
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
