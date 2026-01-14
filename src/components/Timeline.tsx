import React from "react";
import { Card, Button, TextArea, Input, Label } from "@heroui/react";
import { Icon } from "@iconify/react";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "success" | "info" | "warning" | "danger";
  icon: string;
}

export const Timeline = () => {
  const [comment, setComment] = React.useState("");
  const maxLength = 2000;

  const handleCommentChange = (value: string) => {
    if (value.length <= maxLength) {
      setComment(value);
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      // Here you would normally send the comment to your API
      setComment("");
    }
  };

  const events: TimelineEvent[] = [
    {
      id: "1",
      date: "20 Jan, 2023",
      title: "Photos are ready and were sent to Micky Mouse",
      description: "Photos were processed by artistic assistant Natiq Neytonovich",
      type: "success",
      icon: "lucide:image",
    },
    {
      id: "2",
      date: "18 Jan, 2023",
      title: "7 photos from Heinz have been successfully uploaded",
      description: "Photos were processed by executive Heinz Steinbauer",
      type: "info",
      icon: "lucide:check-circle",
    },
    {
      id: "3",
      date: "15 Jan, 2023",
      title: "Original photos have been uploaded",
      description: "Photos were uploaded via the Food Web App",
      type: "info",
      icon: "lucide:upload-cloud",
    },
    {
      id: "4",
      date: "12 Jan, 2023",
      title: "Order was created",
      description: "The order was created via the Web Germany manager",
      type: "info",
      icon: "lucide:clipboard-check",
    },
  ];

  const getIconColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "success":
        return "text-success";
      case "info":
        return "text-accent";
      case "warning":
        return "text-warning";
      case "danger":
        return "text-danger";
      default:
        return "text-accent";
    }
  };

  return (
    <section className="mb-8 scroll-mt-32">
      <h2 className="text-lg font-semibold mb-4 text-default-900">Timeline</h2>

      {/* Comment section */}
      <div className="mb-8">
        <div className="bg-default-50 rounded-2xl p-6 border border-default-200">
          <div className="space-y-1 relative">
            <Label className="text-sm font-bold text-default-700 ml-1">Leave a comment</Label>
            <TextArea
              placeholder="Write your update here..."
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              className="w-full h-32 px-4 py-3 rounded-xl border border-default-200 bg-white shadow-inner focus:ring-2 focus:ring-accent/20"
            />
            <Button
              isIconOnly
              variant="primary"
              className="absolute top-10 right-3 m-2 shadow-accent-sm"
              onPress={handleSubmitComment}
              isDisabled={!comment.trim()}
            >
              <Icon icon="lucide:arrow-up" className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white hover:bg-default-100 border-default-200"
              >
                <Icon icon="lucide:paperclip" className="w-4 h-4 mr-2" />
                Attach
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white hover:bg-default-100 border-default-200"
              >
                <Icon icon="lucide:mic" className="w-4 h-4 mr-2" />
                Voice
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white hover:bg-default-100 border-default-200"
              >
                <Icon icon="lucide:file-text" className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-default-400 self-center">
              {comment.length} / {maxLength}
            </div>
          </div>

          <p className="text-[10px] text-default-400 mt-4 flex items-center gap-1.5 font-medium">
            <Icon icon="lucide:lock" className="w-3 h-3" />
            Internal: Only staff members can view these comments
          </p>
        </div>
      </div>

      {/* Timeline Card */}
      <Card className="shadow-premium border-none overflow-hidden">
        <Card.Header className="px-6 py-4 border-b border-default-100 bg-default-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-default-900">History & Milestones</h3>
          <div className="w-full md:w-80">
            <div className="space-y-1">
              <Label className="sr-only">Search a milestone</Label>
              <Input
                placeholder="Search history..."
                className="w-full h-9 px-3 rounded-lg border border-default-200 bg-white"
                aria-label="Search milestones"
              />
            </div>
          </div>
        </Card.Header>
        <Card.Content className="px-6 py-8">
          <div className="relative pl-8 border-l-2 border-default-100 ml-4 space-y-10">
            {events.map((event) => (
              <div key={event.id} className="relative">
                <div
                  className={`absolute -left-[45px] w-8 h-8 rounded-full bg-white shadow-md border-2 ${event.type === "success" ? "border-success" : "border-accent"} flex items-center justify-center`}
                >
                  <Icon icon={event.icon} className={`w-4 h-4 ${getIconColor(event.type)}`} />
                </div>
                <div className="bg-default-50/30 p-4 rounded-xl border border-default-50 hover:bg-default-50 transition-colors">
                  <p className="text-[10px] uppercase font-black tracking-widest text-default-500 mb-2">
                    {event.date}
                  </p>
                  <h3 className="text-sm font-bold text-default-900 mb-1 leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-default-600 leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </section>
  );
};
