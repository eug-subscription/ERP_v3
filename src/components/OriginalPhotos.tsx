import { Button, Skeleton } from "@heroui/react";
import { usePhotos } from "../hooks/usePhotos";
import { PhotosTable } from "./PhotosTable";

export function OriginalPhotos() {
  const { data: photos = [], isLoading } = usePhotos();

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
      <h2 className="text-2xl font-black text-default-900 tracking-tight">Original photos</h2>
      <p className="text-sm font-medium text-default-500 mt-1">
        Archives with all original photos for this order.
      </p>

      <div className="mt-6">
        <PhotosTable photos={photos} />
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline">
          View Contact Sheet
        </Button>
      </div>
    </section>
  );
}
