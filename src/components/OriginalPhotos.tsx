import React from "react";
import { Button, Tooltip, Avatar, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

interface PhotoData {
  id: string;
  fileName: string;
  source: "API" | "Admin";
  size: string;
  createdBy: {
    name: string;
    avatar: string;
  };
  downloadedBy: {
    name: string;
    avatar: string;
  };
  status: "Available" | "In process" | "Completed";
  createdAt: string;
}

export const OriginalPhotos = () => {
  const photos: PhotoData[] = [
    {
      id: "1",
      fileName: "Archive_1.zip",
      source: "API",
      size: "54 KB",
      createdBy: {
        name: "Gary Reichert",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=1",
      },
      downloadedBy: {
        name: "Emma Thompson",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=6",
      },
      status: "Completed",
      createdAt: "21 Jan 2024, 12:30 AM",
    },
    {
      id: "2",
      fileName: "Archive_2.rar",
      source: "Admin",
      size: "41 KB",
      createdBy: {
        name: "Olivia Martinez",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=2",
      },
      downloadedBy: {
        name: "Marcus Lee",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=7",
      },
      status: "Available",
      createdAt: "21 Jan 2024, 12:35 AM",
    },
    {
      id: "3",
      fileName: "Product_Photo_01.zip",
      source: "API",
      size: "1.2 MB",
      createdBy: {
        name: "Gary Reichert",
        avatar: "https://img.heroui.chat/image/avatar?w=40&h=40&u=1",
      },
      downloadedBy: {
        name: "Not downloaded yet",
        avatar: "",
      },
      status: "In process",
      createdAt: "22 Jan 2024, 09:15 AM",
    },
  ];

  const handleDownload = (_fileName: string) => {};

  return (
    <section className="mb-8 scroll-mt-32">
      <h2 className="text-lg font-semibold mb-1 text-default-900">Original photos</h2>
      <p className="text-default-600 text-sm mb-6">
        Archives with all original photos for this order.
      </p>

      <div className="border border-default-200 rounded-2xl overflow-hidden bg-white shadow-premium">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-default-50/80 backdrop-blur-sm border-b border-default-200">
              <tr>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  File name
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  Source
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  Created by
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  Size
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  Downloaded by
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  Status
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4 text-right">
                  Date & time
                </th>
                <th className="font-bold text-[11px] uppercase tracking-widest text-default-500 py-4 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100">
              {photos.map((photo) => (
                <tr key={photo.id} className="hover:bg-default-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Button
                          variant="ghost"
                          onPress={() => handleDownload(photo.fileName)}
                          className="p-0 h-auto min-w-0 text-accent hover:underline text-left font-bold text-sm max-w-[180px] truncate block bg-transparent"
                        >
                          {photo.fileName}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>{photo.fileName}</Tooltip.Content>
                    </Tooltip>
                  </td>
                  <td className="py-4 px-4">
                    <Chip
                      color={photo.source === "API" ? "accent" : "default"}
                      variant="soft"
                      size="sm"
                      className="font-bold"
                    >
                      {photo.source}
                    </Chip>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <Avatar.Image src={photo.createdBy.avatar} alt={photo.createdBy.name} />
                      </Avatar>
                      <span className="text-sm font-medium text-default-900">
                        {photo.createdBy.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-default-600">{photo.size}</td>
                  <td className="py-4 px-4">
                    {photo.downloadedBy.avatar ? (
                      <div className="flex items-center gap-2">
                        <Avatar size="sm">
                          <Avatar.Image
                            src={photo.downloadedBy.avatar}
                            alt={photo.downloadedBy.name}
                          />
                        </Avatar>
                        <span className="text-sm font-medium text-default-900">
                          {photo.downloadedBy.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-default-400 font-medium">Not downloaded</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Chip
                      color={
                        photo.status === "Completed"
                          ? "accent"
                          : photo.status === "Available"
                            ? "success"
                            : photo.status === "In process"
                              ? "warning"
                              : "default"
                      }
                      size="sm"
                      variant="soft"
                      className="font-bold"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon
                          icon={
                            photo.status === "Completed"
                              ? "lucide:check-circle"
                              : photo.status === "Available"
                                ? "lucide:check"
                                : "lucide:clock"
                          }
                          className="w-3.5 h-3.5"
                        />
                        {photo.status}
                      </div>
                    </Chip>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-medium text-default-500">
                    {photo.createdAt}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        isIconOnly
                        variant="ghost"
                        onPress={() => handleDownload(photo.fileName)}
                      >
                        <Icon icon="lucide:download" className="w-4 h-4 text-accent" />
                      </Button>
                      <Button isIconOnly variant="ghost">
                        <Icon icon="lucide:eye" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="ghost" className="text-accent border-accent font-bold px-6">
          View Contact Sheet
        </Button>
      </div>
    </section>
  );
};
