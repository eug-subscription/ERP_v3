import React, { useState } from "react";
import {
  Card,
  Separator,
  Button,
  Input,
  Select,
  Label,
  DateField,
  TimeField,
  DateInputGroup,
  ListBox,
  TagGroup,
  Tag,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { getLocalTimeZone, CalendarDateTime } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import { availableTags, OrderTag, countries, StructuredAddress } from "../data/mock-order";
import { useOrder } from "../hooks/useOrder";

export function OrderInfo() {
  const { data: order, isLoading } = useOrder();

  const [orderDate, setOrderDate] = useState<CalendarDateTime | null>(null);
  const [tags, setTags] = useState<OrderTag[]>([]);
  const [rating, setRating] = useState(3);
  const [client, setClient] = useState<string | null>(null);
  const [address, setAddress] = useState<StructuredAddress | null>(null);

  const [isEditingClient, setIsEditingClient] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const dateFormatter = useDateFormatter({ dateStyle: "full", timeStyle: "short" });

  // Sync state with fetched data
  React.useEffect(() => {
    if (order) {
      setOrderDate(order.orderDate);
      setTags(order.tags);
      setClient(order.client);
      setAddress(order.address);
    }
  }, [order]);

  if (isLoading || !order || !orderDate) {
    return (
      <Card className="bg-background border-none shadow-premium overflow-hidden">
        <Card.Content className="p-6">
          <div className="animate-pulse space-y-8">
            <div className="h-7 w-48 bg-default-100 rounded-lg" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-default-50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-12 bg-default-100 rounded" />
                    <div className="h-5 w-3/4 bg-default-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card.Content>
      </Card>
    );
  }

  const handleUpdateAddress = (field: string, value: string) => {
    if (!address) return;
    setAddress({ ...address, [field]: value });
  };

  const handleRemoveTags = (keys: Set<React.Key>) => {
    setTags((prev) => prev.filter((t) => !keys.has(t.id)));
  };

  const handleAddTag = (key: React.Key | null) => {
    if (!key) return;
    const selectedId = key as string;
    const tagToAdd = availableTags.find((t) => t.id === selectedId);
    if (tagToAdd && !tags.find((t) => t.id === selectedId)) {
      setTags((prev) => [...prev, tagToAdd]);
    }
  };

  return (
    <Card className="bg-background border-none shadow-premium overflow-hidden">
      <Card.Content className="p-6">
        <h3 className="text-xl font-semibold mb-6">Order Details</h3>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-default-50 flex items-center justify-center flex-shrink-0">
              <Icon icon="lucide:user" className="w-5 h-5 text-default-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">
                Client
              </p>
              {isEditingClient ? (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Input
                    autoFocus
                    fullWidth
                    value={client || ""}
                    onChange={(e) => setClient(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingClient(false)}
                    aria-label="Client Name"
                  />
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onPress={() => setIsEditingClient(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="font-semibold text-default-900">
                    {client || "Not applicable"}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => setIsEditingClient(true)}
                    aria-label="Edit Client"
                  >
                    <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-default-50 flex items-center justify-center flex-shrink-0">
              <Icon icon="lucide:map-pin" className="w-5 h-5 text-default-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">
                Location
              </p>
              {isEditingLocation ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-default-500">Street Address</Label>
                      <Input
                        value={address?.line1 || ""}
                        onChange={(e) => handleUpdateAddress("line1", e.target.value)}
                        aria-label="Street Address"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs font-medium text-default-500">City</Label>
                        <Input
                          value={address?.city || ""}
                          onChange={(e) => handleUpdateAddress("city", e.target.value)}
                          aria-label="City"
                        />
                      </div>
                      <div className="w-32 space-y-1">
                        <Label className="text-xs font-medium text-default-500">Country</Label>
                        <Select
                          selectedKey={address?.country || "DE"}
                          onSelectionChange={(key) => handleUpdateAddress("country", key as string)}
                          aria-label="Country"
                        >
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
                              {countries.map((c) => (
                                <ListBox.Item key={c.code} id={c.code} textValue={c.name}>
                                  {c.name}
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onPress={() => setIsEditingLocation(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="font-semibold text-default-900 whitespace-pre-line">
                    {address
                      ? `${address.line1}\n${address.city}, ${address.country}`
                      : "No address"}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => setIsEditingLocation(true)}
                    aria-label="Edit Location"
                  >
                    <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-default-50 flex items-center justify-center flex-shrink-0">
              <Icon icon="lucide:calendar" className="w-5 h-5 text-default-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-1">
                Schedule
              </p>
              {isEditingSchedule ? (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-default-500">Date</Label>
                    <DateField
                      className="w-full"
                      value={orderDate}
                      onChange={(val) =>
                        val && setOrderDate(val.copy() as unknown as CalendarDateTime)
                      }
                      aria-label="Order Date"
                    >
                      <DateInputGroup>
                        <DateInputGroup.Input>
                          {(segment) => <DateInputGroup.Segment segment={segment} />}
                        </DateInputGroup.Input>
                      </DateInputGroup>
                    </DateField>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-default-500">Time</Label>
                    <TimeField
                      className="w-full"
                      value={orderDate}
                      onChange={(val) =>
                        val && setOrderDate(val.copy() as unknown as CalendarDateTime)
                      }
                      aria-label="Order Time"
                    >
                      <DateInputGroup>
                        <DateInputGroup.Input>
                          {(segment) => <DateInputGroup.Segment segment={segment} />}
                        </DateInputGroup.Input>
                      </DateInputGroup>
                    </TimeField>
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onPress={() => setIsEditingSchedule(false)}>
                      Okay
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <span className="font-semibold text-default-900">
                    {dateFormatter.format(orderDate.toDate(getLocalTimeZone()))}
                  </span>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onPress={() => setIsEditingSchedule(true)}
                    aria-label="Edit Schedule"
                  >
                    <Icon icon="lucide:pencil" className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-default-100/50">
            <div>
              <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">
                Status
              </p>
              <Chip color="success" variant="soft" size="md" className="font-bold px-3">
                Completed
              </Chip>
            </div>
            <div>
              <p className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">
                Profit
              </p>
              <p className="text-3xl font-black text-default-900">£{order.profit}</p>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-default-100/50" />

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-default-900 uppercase tracking-widest">Tags</h4>
              <Select aria-label="Add tag" className="w-10" onSelectionChange={handleAddTag}>
                <Select.Trigger>
                  <Button isIconOnly size="sm" variant="ghost" className="rounded-full">
                    <Icon icon="lucide:plus" className="w-4 h-4" />
                  </Button>
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {availableTags.map((tag) => (
                      <ListBox.Item key={tag.id} id={tag.id} textValue={tag.text}>
                        <Chip size="sm" color={tag.color} variant="soft">
                          {tag.text}
                        </Chip>
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <TagGroup aria-label="Order tags" onRemove={handleRemoveTags}>
              <TagGroup.List>
                {tags.map((tag) => (
                  <Tag
                    key={tag.id}
                    id={tag.id}
                    textValue={tag.text}
                    className="border-none bg-transparent p-0"
                  >
                    <Chip color={tag.color} variant="soft" size="sm" className="font-medium px-2">
                      {tag.text}
                      <Tag.RemoveButton className="ml-1" />
                    </Chip>
                  </Tag>
                ))}
              </TagGroup.List>
            </TagGroup>
          </div>

          <div>
            <h4 className="text-sm font-bold text-default-900 uppercase tracking-widest mb-4">
              Rating
            </h4>
            <div className="flex items-center gap-1.5 p-3 bg-default-50 rounded-2xl w-fit">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={() => setRating(star)}
                  className={`border-none transition-all duration-200 hover:scale-125 focus:outline-none ${star <= rating ? "text-warning" : "text-default-200"
                    }`}
                  aria-label={`Rate ${star} stars`}
                >
                  <Icon
                    icon="lucide:star"
                    className={`w-7 h-7 ${star <= rating ? "fill-current" : "fill-none"}`}
                  />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
