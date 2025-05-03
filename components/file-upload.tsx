"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import axios, { AxiosError } from "axios";

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
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileType = value?.split(".").pop();

    const handleUpload = async (file: File) => {
        try {
            setIsUploading(true);
            setError(null);
            
            const formData = new FormData();
            formData.append("file", file);
            formData.append("endpoint", endpoint);
            
            const response = await axios.post("/api/upload", formData);
            onChange(response.data.url);
        } catch (error) {
            console.error("Upload error:", error);
            const axiosError = error as AxiosError;
            setError(axiosError.response?.data as string || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    if (value) {
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
        
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={value}
                    alt="Upload"
                    className="rounded-full"    
                />
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

    return (
        <div className="flex flex-col items-center justify-center">
            <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept={endpoint === "messageFile" ? "image/*,application/pdf" : "image/*"}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-lg ${isUploading ? 'opacity-50' : 'hover:bg-gray-50'}`}
                type="button"
                disabled={isUploading}
            >
                <UploadCloud className="h-10 w-10 text-zinc-500" />
                <p className="mt-2 text-sm text-zinc-500">
                    {isUploading ? 'Uploading...' : endpoint === "messageFile" ? 'Upload an image or PDF' : 'Upload an image'}
                </p>
            </button>
            {error && (
                <p className="mt-2 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}