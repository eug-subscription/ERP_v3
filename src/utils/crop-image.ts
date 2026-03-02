import type { Area } from "react-easy-crop";
import { AVATAR_CROP_OUTPUT_QUALITY } from "../constants/avatar-upload";

/**
 * Creates a cropped JPEG Blob from a source image URL and the pixel crop area
 * produced by react-easy-crop's `onCropComplete` callback.
 *
 * @param imageSrc - Object URL or data URL of the source image.
 * @param pixelCrop - The exact pixel rectangle to crop (x, y, width, height).
 * @returns A JPEG Blob at `AVATAR_CROP_OUTPUT_QUALITY` quality.
 */
export async function getCroppedImage(
    imageSrc: string,
    pixelCrop: Area,
): Promise<Blob> {
    const image = await loadImage(imageSrc);

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("getCroppedImage: failed to get 2D canvas context");
    }

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
    );

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("getCroppedImage: canvas.toBlob returned null"));
                }
            },
            "image/jpeg",
            AVATAR_CROP_OUTPUT_QUALITY,
        );
    });
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", () =>
            reject(new Error(`getCroppedImage: failed to load image from ${src}`)),
        );
        img.src = src;
    });
}
