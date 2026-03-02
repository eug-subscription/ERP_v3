import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Label, Slider } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
    AVATAR_CROP_ZOOM_MIN,
    AVATAR_CROP_ZOOM_MAX,
    AVATAR_CROP_ZOOM_STEP,
    AVATAR_CROP_ASPECT,
    AVATAR_CROP_AREA_HEIGHT,
} from "../../../constants/avatar-upload";

interface AvatarCropAreaProps {
    /** Object URL of the image to crop (post-HEIC conversion, if applicable). */
    imageSrc: string;
    /** Crop position controlled by parent. */
    crop: Point;
    /** Zoom level controlled by parent. */
    zoom: number;
    /** Called when the user drags to adjust the crop position. */
    onCropChange: (point: Point) => void;
    /** Called when the user adjusts the zoom level. */
    onZoomChange: (zoom: number) => void;
    /**
     * Called when react-easy-crop has finished computing the visible crop area.
     * The second argument is the pixel-precise crop used by `getCroppedImage`.
     */
    onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
}

/**
 * AvatarCropArea — circular crop preview with zoom slider.
 *
 * Wraps `react-easy-crop` with a fixed 1:1 aspect ratio and circular mask
 * that matches the Avatar component shape. Exposes a HeroUI Slider for zoom.
 */
export function AvatarCropArea({
    imageSrc,
    crop,
    zoom,
    onCropChange,
    onZoomChange,
    onCropComplete,
}: AvatarCropAreaProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* ── Crop canvas ── */}
            <div className={`relative ${AVATAR_CROP_AREA_HEIGHT} w-full overflow-hidden rounded-xl bg-black`}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={AVATAR_CROP_ASPECT}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropComplete}
                />
            </div>

            {/* ── Zoom slider ── */}
            <Slider
                value={zoom}
                onChange={(val) => onZoomChange(val as number)}
                minValue={AVATAR_CROP_ZOOM_MIN}
                maxValue={AVATAR_CROP_ZOOM_MAX}
                step={AVATAR_CROP_ZOOM_STEP}
                aria-label="Zoom"
                className="w-full"
            >
                <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs text-default-500 flex items-center gap-1.5">
                        <Icon icon="lucide:zoom-in" className="w-3.5 h-3.5" aria-hidden />
                        Zoom
                    </Label>
                    <Slider.Output className="text-xs text-default-400" />
                </div>
                <Slider.Track>
                    <Slider.Fill />
                    <Slider.Thumb />
                </Slider.Track>
            </Slider>
        </div>
    );
}
