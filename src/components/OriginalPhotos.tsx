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
      <h2 className="text-lg font-semibold mb-1 text-default-900">Original photos</h2>
      <p className="text-default-600 text-sm mb-6">
        Archives with all original photos for this order.
      </p>

      <PhotosTable photos={photos} />

      <div className="flex justify-end mt-4">
        <Button variant="ghost" className="text-accent border-accent font-bold px-6">
          View Contact Sheet
        </Button>
      </div>
    </section>
  );
}
