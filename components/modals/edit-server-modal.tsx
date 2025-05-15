/**
 * EditServerModal Component
 * 
 * Provides interface for modifying existing server settings.
 * Handles updating server name and image with form validation.
 */
"use client";

import * as z from "zod";
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
import { useModal } from "@/hooks/use-modal-store";
import { FileUpload } from "@/components/file-upload";
import { useEffect } from "react";

/**
 * Form validation schema
 * - Name: Required string
 * - Image URL: Required string from file upload
 */
const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required."
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required."
    })
});

/**
 * Modal component for editing existing server details
 */
export const EditServerModal = () => {
    // Access modal state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    // Only display this modal when editServer type is active
    const isModalOpen = isOpen && type === "editServer";
    // Extract server data passed to the modal
    const { server } = data;

    /**
     * Initialize form with validation
     * Default values will be populated from server data when available
     */
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    /**
     * Populate form with server data when it becomes available
     * Using server ID as dependency ensures form updates when editing different servers
     */
    useEffect(() => {
        if (server) {
            form.setValue("name", server.name);
            form.setValue("imageUrl", server.imageUrl);
        }
    }, [server?.id]);

    // Track form submission state for UI feedback
    const isLoading = form.formState.isSubmitting;

    /**
     * Handle form submission
     * Updates server details via API patch request
     */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Send update request to server API endpoint
            await axios.patch(`/api/servers/${server?.id}`, values);
            
            // Reset form state and close modal
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Reset form when modal is closed
     * Ensures clean state for next opening
     */
    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Edit {server?.name}
                    </DialogTitle>
                    <DialogDescription className="text-center text-amber-500">
                        Pick an image and a name for your server.
                    </DialogDescription>
                </DialogHeader>
                {/* Key property forces form to re-render completely when editing a different server */}
                <Form {...form} key={server?.id || "new"}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                {/* file upload component handles image selection */}
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* server name input field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-300"
                                        >
                                            Server name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-100 dark:bg-zinc-900 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                                                placeholder="Enter server name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 dark:bg-[#2B2D31] px-6 py-4">
                            <Button 
                                disabled={isLoading}
                                className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}