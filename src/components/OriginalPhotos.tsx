import { Button, Tooltip, Avatar, Chip, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { usePhotos } from "../hooks/usePhotos";

export function OriginalPhotos() {
  const { data: photos = [], isLoading } = usePhotos();

  const handleDownload = () => { };

  if (isLoading) {
    return (
      <section className="mb-8 scroll-mt-32">
        <Skeleton className="h-7 w-48 rounded-lg mb-1" />
        <Skeleton className="h-4 w-64 rounded-lg mb-6" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </section>
    );
  }

  return (
    <section className="mb-8 scroll-mt-32">
      <h2 className="text-lg font-semibold mb-1 text-default-900">Original photos</h2>
      <p className="text-default-600 text-sm mb-6">
        Archives with all original photos for this order.
      </p>

      <div className="border border-default-200 rounded-2xl overflow-hidden bg-background shadow-premium">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-default-50/80 backdrop-blur-sm border-b border-default-200">
              <tr>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
                  File name
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
                  Source
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
                  Created by
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
                  Size
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
                  Downloaded by
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
                  Status
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4 text-right">
                  Date & time
                </th>
                <th className="font-bold t-compact uppercase tracking-widest text-default-500 py-4 px-4">
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
                          onPress={handleDownload}
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
                        onPress={handleDownload}
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
}
