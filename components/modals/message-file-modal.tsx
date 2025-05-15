/**
 * MessageFileModal Component
 * 
 * A modal dialog for uploading file attachments to messages in channels or conversations.
 * Features include:
 * - File upload interface with drag and drop support
 * - Form validation ensuring a file is selected
 * - Posts the file URL to appropriate channel or conversation API
 * - Provides visual feedback during upload process
 */
"use client";

import * as z from "zod";
import qs from "query-string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { useModal } from "@/hooks/use-modal-store";

/**
 * Zod schema for form validation
 * Ensures a file URL is provided before allowing submission
 */
const formSchema = z.object({
    fileUrl: z.string().min(1, {
        message: "Attachment is required."
    })
});

/**
 * Modal component for uploading file attachments to messages
 */
export const MessageFileModal = () => {
    // Access modal store for state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    // Only show this modal when the messageFile type is active
    const isModalOpen = isOpen && type === "messageFile";
    // Extract API endpoint and query parameters passed from the chat input
    const { apiUrl, query } = data;

    /**
     * Initialize form with zod validation
     * Default file URL is empty string
     */
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {    
            fileUrl: "",
        }
    });

    /**
     * Reset form state when modal is closed
     * Ensures a clean form when reopening the modal
     */
    const handleClose = () => {
        form.reset();
        onClose();
    }

    // Track form submission state
    const isLoading = form.formState.isSubmitting;

    /**
     * Handle form submission to upload a file attachment
     * Posts file URL to the appropriate message API endpoint
     */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Build API URL with the provided query parameters
            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query: query,
            })
            
            // Send file attachment to server
            // The content field is set to the file URL for compatibility with
            // the message API which expects a content field
            await axios.post(url, {
                ...values,
                content: values.fileUrl,
            });

            // Reset form, refresh page data, and close modal
            form.reset();
            router.refresh();
            handleClose();
        } catch (error) {
            console.log(error);
        }
    }

    return (
            <Dialog open={isModalOpen} onOpenChange={handleClose}>
                <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                    <DialogHeader className="pt-8 px-6">
                        <DialogTitle className="text-2xl text-center font-bold">
                            Add an attachment
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-8 px-6">
                                <div className="flex items-center justify-center text-center">
                                    <FormField
                                        control={form.control}
                                        name="fileUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    {/* File upload component with UploadThing integration */}
                                                    <FileUpload
                                                        endpoint="messageFile" 
                                                        value={field.value}
                                                        onChange={field.onChange} 
                                                        /* UploadThing endpoint for message attachments */
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            {/* Footer with send button */}
                            <DialogFooter className="bg-gray-100 dark:bg-[#2B2D31] px-6 py-4">
                                <Button
                                    variant="primary" 
                                    disabled={isLoading}
                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    Send
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
    )
}   
