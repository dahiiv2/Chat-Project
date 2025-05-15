/**
 * CreateChannelModal Component
 * 
 * A modal dialog for creating new channels within a server.
 * Features include:
 * - Channel name input with validation (cannot be 'general')
 * - Channel type selection (TEXT, AUDIO, VIDEO)
 * - Form submission to create the channel via API
 * - Preset channel type when opened from specific contexts
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
 * Zod schema for form validation
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
 * Modal component for creating a new channel within a server
 */
export const CreateChannelModal = () => {
    // Access modal store for state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    const params = useParams();

    // Only show this modal when the createChannel type is active
    const isModalOpen = isOpen && type === "createChannel";
    // Channel type can be preset when opened from specific UI locations
    const channelType = data?.channelType;

    /**
     * Initialize form with zod validation
     * Default to TEXT channel type unless another type is specified
     */
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: data?.channelType || ChannelType.TEXT,
        }
    });

    /**
     * Update channel type when modal data changes
     * Ensures the form reflects the intended channel type when opened from different contexts
     */
    useEffect(() => {
        if (data?.channelType) {
            form.setValue("type", data.channelType);
        } else {
            form.setValue("type", ChannelType.TEXT);
        }
    }, [data?.channelType]);

    // Track form submission state
    const isLoading = form.formState.isSubmitting;

    /**
     * Handle form submission to create a new channel
     * Posts channel data to API with the current server ID
     */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Build API URL with the server ID as a query parameter
            const url = qs.stringifyUrl({
                url: "/api/channels",
                query: {
                    serverId: params?.serverId,
                }
            });

            // Send channel creation request to server
            await axios.post(url, values);
            
            // Reset form, refresh page data, and close modal
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Reset form state when modal is closed
     * Ensures a clean form when reopening the modal
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
                        Create Channel
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
                        {/* Footer with submit button */}
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
    )
}