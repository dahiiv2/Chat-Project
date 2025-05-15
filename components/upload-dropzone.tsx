/**
 * UploadDropzone Component
 *
 * Provides drag-and-drop file upload functionality:
 * - Wraps the UploadThing dropzone component
 * - Configures uploads for different endpoints (messageFile, serverImage)
 * - Handles upload completion and error callbacks
 * - Used for attaching files to messages and uploading server images
 */
"use client";

import { UploadDropzone as UTUploadDropzone } from "@/lib/uploadthing";

/**
 * Props for the UploadDropzone component
 * @property endpoint - The UploadThing endpoint to use ("messageFile" or "serverImage")
 * @property onClientUploadComplete - Callback fired when upload completes successfully
 * @property onUploadError - Callback fired when an error occurs during upload
 */
interface UploadDropzoneProps {
    endpoint: "messageFile" | "serverImage";
    onClientUploadComplete?: (res?: { url: string }[]) => void;
    onUploadError?: (error: Error) => void;
}

/**
 * UploadDropzone wrapper around the UploadThing dropzone component
 * that passes through props and callbacks
 */
export const UploadDropzone = ({
    endpoint,
    onClientUploadComplete,
    onUploadError
}: UploadDropzoneProps) => {
    return (
        <UTUploadDropzone
            endpoint={endpoint} // Specify which file type configuration to use
            onClientUploadComplete={onClientUploadComplete} // Forward success callback
            onUploadError={onUploadError} // Forward error callback
        />
    )
}
