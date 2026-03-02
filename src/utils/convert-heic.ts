/**
 * Converts a HEIC/HEIF image file to a JPEG Blob.
 * Required because most browsers cannot natively decode Apple's HEIC format.
 *
 * `heic2any` (~1.3 MB) is dynamically imported so it is only fetched when a
 * user actually uploads a HEIC file — keeping it out of the main bundle.
 *
 * @param file - A File whose MIME type is `image/heic` or `image/heif`.
 * @returns A JPEG Blob representing the converted image.
 * @throws Error if the conversion fails.
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
    const { default: heic2any } = await import("heic2any");
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 1 });

    // heic2any returns Blob | Blob[]; normalise to a single Blob.
    const blob = Array.isArray(result) ? result[0] : result;
    if (!blob) {
        throw new Error("convertHeicToJpeg: conversion produced no output");
    }
    return blob;
}
