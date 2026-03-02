import heic2any from "heic2any";

/**
 * Converts a HEIC/HEIF image file to a JPEG Blob using the `heic2any` library.
 * Required because most browsers cannot natively decode Apple's HEIC format.
 *
 * @param file - A File whose MIME type is `image/heic` or `image/heif`.
 * @returns A JPEG Blob representing the converted image.
 * @throws Error if the conversion fails.
 */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 1 });

    // heic2any returns Blob | Blob[]; normalise to a single Blob.
    const blob = Array.isArray(result) ? result[0] : result;
    if (!blob) {
        throw new Error("convertHeicToJpeg: conversion produced no output");
    }
    return blob;
}
