import { FileUploadSection } from "./FileUploadSection";

export function FileUploadTabs() {
    return (
        <>
            <FileUploadSection
                title="Uploading unedited photos"
                description="Upload unedited photos for further processing."
            />
            <FileUploadSection
                title="Uploading edited photos"
                description="Upload a folder with all edited photos to the same structure as the original photos."
            />
        </>
    );
}
