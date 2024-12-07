"use client";
import Image from "next/image";

import { UploadDropzone } from "@/lib/uploadthing";

import "@uploadthing/react/styles.css"

// Defines what props the component accepts
interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: "messageFile" | "serverImage"
}

// File upload component
export const FileUpload = ({
    onChange,
    value,
    endpoint
}: FileUploadProps) => {
    // Get the file extension from the URL (e.g., "image.jpg" -> "jpg")
    const fileType = value?.split(".").pop();

    // If we already have an uploaded file and it's not a PDF
    if (value && fileType !== "pdf") {
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill    // Make the image fill the container
                    src={value} // URL of the uploaded file
                    alt="Upload"
                    className="rounded-full"    
                />
            </div>
        )
    }

    return (
        <UploadDropzone
            endpoint={endpoint}  // Uploadthing endpoint
            onClientUploadComplete={(res) => { // Uploadthing callback
                onChange(res?.[0].url);
            }}
            onUploadError={(error: Error) => { // Uploadthing error callback
                console.log(error);
            }}
        />
    )
}