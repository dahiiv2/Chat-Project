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
import { Plus, Smile } from "lucide-react";

interface ChatInputProps {
    apiUrl: string;
    query: Record<string, any>;
    name: string;
    type: "channel" | "conversation";
}

const formSchema = z.object({
    content: z.string().min(1)
});

export const ChatInput = ({ apiUrl, query, name, type }: ChatInputProps) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: ""
        }
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl,
                query
            });

            await axios.post(url, values);

            form.reset();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="px-4 mb-2 relative">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative w-full">
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
                                                <Smile className="h-5 w-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {}}
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