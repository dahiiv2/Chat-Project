/**
 * ServerImageUpload Component
 * 
 * Form field component for uploading server images:
 * - Integrates with react-hook-form for form state management
 * - Wraps the FileUpload component with appropriate form controls
 * - Handles image file uploads specifically for server images
 * - Provides a consistent interface for server image selection
 */
"use client";

import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { FileUpload } from "@/components/file-upload";
import { useForm } from "react-hook-form";

/**
 * Props for the ServerImageUpload component
 * @property form - React Hook Form instance for managing form state
 */
interface ServerImageUploadProps {
    form: ReturnType<typeof useForm>;
}

export const ServerImageUpload = ({ form }: ServerImageUploadProps) => {
    return (
        // Form field for the server image URL
        <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        {/* File upload component configured for server images */}
                        <FileUpload
                            endpoint="serverImage" // UploadThing endpoint for server images
                            value={field.value} // Current image URL value
                            onChange={field.onChange} // Update form state when image changes
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
