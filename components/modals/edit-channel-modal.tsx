/**
 * EditChannelModal Component
 * 
 * Provides interface for modifying existing channel settings.
 * Handles updating channel name and type with form validation.
 */
"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChannelType } from "@prisma/client";
import qs from "query-string";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import {
    Dialog,
    DialogContent,
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
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

/**
 * Form validation schema
 * - Name: Required string that cannot be 'general' (reserved name)
 * - Type: Must be a valid ChannelType enum value (TEXT, AUDIO, VIDEO)
 */
const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required."
    }).refine(
        name => name !== "general",
        {
            message: "Channel name cannot be 'general'."
        }
    ),
    type: z.nativeEnum(ChannelType)
});

/**
 * Modal component for editing existing channel details
 */
export const EditChannelModal = () => {
    // Access modal state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    // Only display this modal when editChannel type is active
    const isModalOpen = isOpen && type === "editChannel";
    // Extract channel and server data passed to the modal
    const { channel, server } = data;

    /**
     * Initialize form with validation
     * Default values will be populated from channel data when available
     */
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: ChannelType.TEXT,
        }
    });

    /**
     * Populate form with channel data when it becomes available
     * Updates form values whenever the channel data changes
     */
    useEffect(() => {
        if (channel) {
            form.setValue("name", channel.name);
            
            // Convert the ChannelType enum value to the correct string format if needed
            if (data.channelType) {
                form.setValue("type", data.channelType as any); // Type cast to handle Next.js 15 type compatibility
            } else {
                form.setValue("type", ChannelType.TEXT as any); // Default to TEXT channel if type not specified
            }
        }
    }, [form, channel, data]);

    // Track form submission state for UI feedback
    const isLoading = form.formState.isSubmitting;

    /**
     * Handle form submission
     * Updates channel details via API patch request
     */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Debug log for form submission values
            console.log("Submitting form with values:", values);
            
            // Build API URL with server ID as query parameter for authorization check
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id,
                }
            });

            // Send update request to channels API endpoint
            await axios.patch(url, values);
            
            // Reset form state and close modal
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Edit Channel
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-8 px-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-300"
                                        >
                                            Channel name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                className="bg-zinc-100 dark:bg-zinc-900 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400"
                                                placeholder="Enter channel name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel
                                            className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-300"
                                        >
                                            Channel type
                                        </FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger
                                                    className="bg-zinc-300/50 dark:bg-zinc-900 border-0 focus:ring-0 text-black dark:text-white ring-offset-0 focus:ring-offset-0 captialize outline-none"
                                                >
                                                    <SelectValue placeholder="Choose a channel type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent
                                                className="bg-white dark:bg-[#313338]"
                                            >
                                                {Object.values(ChannelType).map((type) => (
                                                    <SelectItem 
                                                        key={type} 
                                                        value={type} 
                                                        className="capitalize hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition"
                                                    >
                                                        {type.toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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