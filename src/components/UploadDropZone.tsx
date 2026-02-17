import { Icon } from "@iconify/react";
import { ICON_CONTAINER_LG, ICON_SIZE_CONTAINER } from "../constants/ui-tokens";

export function UploadDropZone() {
    return (
        <div className="p-8">
            <div className="border-2 border-dashed border-default-200 rounded-premium p-10 flex flex-col items-center justify-center bg-background/50 hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 cursor-pointer group">
                <div className={`${ICON_CONTAINER_LG} mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon icon="lucide:upload-cloud" className={ICON_SIZE_CONTAINER} />
                </div>
                <p className="text-sm font-semibold text-default-900 mb-1">
                    Click to upload or drag and drop
                </p>
                <p className="text-xs text-default-500">SVG, PNG, JPG or GIF (MAX. 800×400px)</p>
            </div>
        </div>
    );
}
