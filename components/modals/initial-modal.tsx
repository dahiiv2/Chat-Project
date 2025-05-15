/**
 * InitialModal Component
 * 
 * First-time setup modal displayed when a user first joins the platform.
 * Handles server creation with name and image upload functionality.
 */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { ModalWrapper } from "@/components/ui/modal-wrapper";

/**
 * Form validation schema
 * - Server name: Required string
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
 * Modal component for first-time server setup
 * Cannot be dismissed as it's required for onboarding
 */
export const InitialModal = () => {
    // Prevent hydration errors with server-side rendering
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    // Only render modal after component mounts on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * Initialize form with validation
     */
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    });

    // Track form submission state for UI feedback
    const isLoading = form.formState.isSubmitting;

    /**
     * Handle form submission
     * Creates the user's first server and reloads page to navigate to it
     */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Create server via API
            await axios.post("/api/servers", values);
            // Reset form state
            form.reset();
            // Update router cache
            router.refresh();
            // Force page reload to update UI with new server
            window.location.reload();
        } catch (error) {
            console.log(error);
        }
    }

    // Prevent rendering during server-side rendering
    if (!isMounted) {
        return null;
    }

    return (
        <ModalWrapper>
            <Dialog open>
                <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                    <DialogHeader className="pt-8 px-6">
                        <DialogTitle className="text-2xl text-center font-bold">
                            Create Your First Server
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-500 dark:text-zinc-400">
                            Pick an image and a name to get started
                            Reminder: You can change them later.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="space-y-8 px-6">
                                <div className="flex items-center justify-center text-center">
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
                                    Create
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </ModalWrapper>
    )
}
