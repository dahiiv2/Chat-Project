/**
 * ChatInput Component
 * 
 * Provides an input field for users to type and send messages
 * in either channel or direct message conversations.
 * 
 * Features:
 * - Text input with validation
 * - Emoji picker integration
 * - File upload button
 * - Real-time submission to API
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import axios from "axios";
import qs from "query-string";

import {
    Form,
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useModal } from "@/hooks/use-modal-store";
import { EmojiPicker } from "@/components/emoji-picker";

/**
 * Props for the ChatInput component
 */
interface ChatInputProps {
    apiUrl: string;                     // API endpoint for sending messages
    query: Record<string, any>;         // Query parameters to include in API request
    name: string;                       // Channel name or conversation partner's name
    type: "channel" | "conversation";    // Whether this is a server channel or direct message
}

/**
 * Zod schema for form validation
 * Ensures messages have at least 1 character
 */
const formSchema = z.object({
    content: z.string().min(1)
});

/**
 * Renders an input field for sending messages with emoji picker and file upload
 */
export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {
    // Access modal store to open file upload modal
    const { onOpen } = useModal();

    // Initialize form with zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: ""
        }
    });

    // Track form submission state
    const isLoading = form.formState.isSubmitting;

    /**
     * Handles form submission
     * Sends message content to API and resets the input field
     */
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            // Build API URL with query parameters
            const url = qs.stringifyUrl({
                url: apiUrl,
                query
            });

            // Send message to server
            await axios.post(url, values);

            // Clear input field after successful submission
            form.reset();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="px-4 mb-2 relative">
            {/* Form component from shadcn/ui with react-hook-form integration */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative w-full">
                                        {/* Message input field with gold/amber accent in focus state */}
                                        <Input
                                            disabled={isLoading}
                                            className="px-4 py-6 pr-24 bg-zinc-200/90 dark:bg-[#000000] border-none border-0 focus-visible:ring-1 focus-visible:ring-amber-500/50 dark:focus-visible:ring-amber-500/30 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                            placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
                                            {...field}
                                        />
                                        <div className="absolute right-2 inset-y-0 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {}}
                                                className="h-8 w-8 hover:bg-zinc-500/10 dark:hover:bg-amber-500/20 rounded-full p-1 flex items-center justify-center text-zinc-500 dark:text-amber-500 transition"
                                            >
                                                {/* Emoji picker that appends selected emoji to current input */}
                                                <EmojiPicker onChange={(emoji: string) => field.onChange(`${field.value} ${emoji}`)} />
                                            </button>
                                            {/* Button to open file upload modal */}
                                            <button
                                                type="button"
                                                onClick={() => {onOpen("messageFile", {
                                                     apiUrl,
                                                     query
                                                })}}
                                                className="h-8 w-8 hover:bg-zinc-500/10 dark:hover:bg-amber-500/20 rounded-full p-1 flex items-center justify-center text-zinc-500 dark:text-amber-500 transition"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
        </div>
    );
}