"use client";

import { UploadDropzone as UTUploadDropzone } from "@/lib/uploadthing";

interface UploadDropzoneProps {
    endpoint: "messageFile" | "serverImage";
    onClientUploadComplete?: (res?: { url: string }[]) => void;
    onUploadError?: (error: Error) => void;
}

export const UploadDropzone = ({
    endpoint,
    onClientUploadComplete,
    onUploadError
}: UploadDropzoneProps) => {
    return (
        <UTUploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={onClientUploadComplete}
            onUploadError={onUploadError}
        />
    )
}
