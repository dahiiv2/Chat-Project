"use client";

import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { FileUpload } from "@/components/file-upload";
import { useForm } from "react-hook-form";

interface ServerImageUploadProps {
    form: ReturnType<typeof useForm>;
}

export const ServerImageUpload = ({ form }: ServerImageUploadProps) => {
    return (
        <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                    <FormControl>
                        <FileUpload
                            value={field.value}
                            onChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            )}
        />
    );
}
