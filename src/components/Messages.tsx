import { Avatar, Button, Card, Input, Label, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMessages } from "../hooks/useMessages";

export function Messages() {
  const { data: messages = [], isLoading } = useMessages();

  if (isLoading) {
    return (
      <section className="mb-8 scroll-mt-32">
        <Card className="shadow-premium border-none p-6">
          <Skeleton className="h-6 w-32 rounded-lg mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-16 w-3/4 rounded-xl" />
            <Skeleton className="h-16 w-2/3 rounded-xl ml-auto" />
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8 scroll-mt-32">
      <Card className="shadow-premium border-none">
        <Card.Content className="p-6">
          <h3 className="text-lg font-semibold mb-6">Messages</h3>

          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                <Avatar size="sm">
                  <Avatar.Image src={message.user.avatar} alt={message.user.name} />
                </Avatar>
                <div
                  className={`rounded-xl p-3 max-w-[80%] ${message.isCurrentUser ? "bg-accent-100 text-accent-900 shadow-accent-sm" : "bg-default-100 text-default-900 shadow-sm"}`}
                >
                  <div className="flex justify-between items-center mb-1 gap-4">
                    <span className="font-semibold text-xs">{message.user.name}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-wider">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-8 py-4 border-t border-default-100">
            <div className="flex items-center gap-1">
              <Button isIconOnly variant="ghost" className="text-accent border-accent/20">
                <Icon icon="lucide:thumbs-up" className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium text-default-600">1</span>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <Button isIconOnly variant="ghost">
                <Icon icon="lucide:thumbs-down" className="w-4 h-4" />
              </Button>
              <span className="text-xs font-medium text-default-600">0</span>
            </div>
            <div className="ml-auto">
              <Button variant="ghost" className="bg-accent/10 text-accent border-none font-medium">
                Public Channel
              </Button>
            </div>
          </div>
        </Card.Content>
        <Card.Footer className="border-t border-default-100 p-4 flex items-center gap-3 bg-default-50/50">
          <Avatar size="sm" className="flex-shrink-0 shadow-sm">
            <Avatar.Image
              src="https://img.heroui.chat/image/avatar?w=32&h=32&u=3"
              alt="Your Avatar"
            />
          </Avatar>
          <div className="flex-1">
            <div className="space-y-1">
              <Label className="sr-only">Message content</Label>
              <Input
                placeholder="Type a message..."
                className="w-full h-10 px-4 rounded-xl border border-default-200 bg-white"
                aria-label="Message content"
              />
            </div>
          </div>
          <Button isIconOnly variant="primary" className="shadow-accent-md">
            <Icon icon="lucide:send" className="w-4 h-4" />
          </Button>
        </Card.Footer>
      </Card>
    </section>
  );
}
