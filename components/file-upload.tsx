/**
 * FileUpload Component
 * 
 * Handles file uploads for various parts of the application:
 * - Manages different upload endpoints (profile images, server images, message files)
 * - Displays previews of uploaded content
 * - Provides a customized interface based on file type
 * - Handles errors and loading states during upload process
 */
"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import axios, { AxiosError } from "axios";

/**
 * Props for the FileUpload component
 * @property onChange - Callback function that receives the uploaded file URL
 * @property value - Current file URL (if already uploaded)
 * @property endpoint - Upload destination identifier ("serverImage", "messageFile", etc.)
 */
interface FileUploadProps {
    onChange: (url?: string) => void;
    value: string;
    endpoint: string;
}

export const FileUpload = ({
    onChange,
    value,
    endpoint,
}: FileUploadProps) => {
    // Track upload state and errors
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Reference to hidden file input element
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Extract file extension from value URL
    const fileType = value?.split(".").pop();

    /**
     * Handles the file upload process
     * @param file - The file selected by the user
     */
    const handleUpload = async (file: File) => {
        try {
            setIsUploading(true);
            setError(null);
            
            // Prepare form data for upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("endpoint", endpoint);
            
            // Send file to upload API
            const response = await axios.post("/api/upload", formData);
            onChange(response.data.url); // Pass URL to parent component
        } catch (error) {
            console.error("Upload error:", error);
            const axiosError = error as AxiosError;
            setError(axiosError.response?.data as string || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    /**
     * Handles file selection from input element
     */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    // Render different UI based on current value and file type
    if (value) {
        // Special case for PDF files in message attachments
        if (fileType === "pdf" && endpoint === "messageFile") {
            return (
                <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                    <a 
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-amber-500 dark:text-amber-400 hover:underline"
                    >
                        {value.split("/").pop()}
                    </a>
                    <button
                        onClick={() => onChange("")}
                        className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                        type="button"
                    >
                        <X className="h-4 w-4"/>
                    </button>
                </div>
            )
        }
        
        // Default image preview (for profile pictures, server icons, etc.)
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="rounded-full"    
                />
                {/* Remove button to clear the current image */}
                <button
                    onClick={() => onChange("")}
                    className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4"/>
                </button>
            </div>
        )
    }

    // Upload interface when no file is selected
    return (
        <div className="flex flex-col items-center justify-center">
            {/* Hidden file input triggered by button */}
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept={endpoint === "messageFile" ? "image/*,application/pdf" : "image/*"}
            />
            {/* Upload button with dynamic state */}
            <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-lg ${isUploading ? 'opacity-50' : 'hover:bg-gray-50'}`}
                type="button"
                disabled={isUploading}
            >
                <UploadCloud className="h-10 w-10 text-zinc-500" />
                {/* Dynamic label based on state and endpoint */}
                <p className="mt-2 text-sm text-zinc-500">
                    {isUploading ? 'Uploading...' : endpoint === "messageFile" ? 'Upload an image or PDF' : 'Upload an image'}
                </p>
            </button>
            {/* Error message display */}
            {error && (
                <p className="mt-2 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}