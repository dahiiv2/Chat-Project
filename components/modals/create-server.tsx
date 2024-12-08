"use client";

import axios from "axios";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { ModalWrapper } from "@/components/ui/modal-wrapper";
import React, { useEffect } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { useRouter } from "next/navigation";


// Form validation schema
const formSchema = zod.object({
    name: zod.string().min(1, {
        message: "Choose a server name."
    }),
    imageUrl: zod.string().min(1, {
        message: "Upload a server image."
    })
})

// Modal for creating a new server
export const CreateServer = () => {

    //prevent Hydration error
    const [isMounted, setIsMounted] = React.useState(false);

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            imageUrl: "",
        }
    })

    if (!isMounted) {
        return null;
    }

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: zod.infer<typeof formSchema>) => {
        try {
            await axios.post("/api/servers", values);

            form.reset();
            router.refresh();
            window.location.reload();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    }

    return (
        <ModalWrapper>
            <Dialog open>
                <DialogContent className="bg-white text-black p-0 overflow-hidden rounded-lg shadow-xl transform transition-all w-full max-w-md font-sans">
                    <DialogHeader className="pt-8 px-6">
                        <DialogTitle className="text-2xl text-center font-bold">
                            Create your first server!
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-500 text-sm mt-2">
                            Pick a name and image for your server.
                            <br />
                            Reminder: You can always change these later!
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)(e);
                        }} className="space-y-8">
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
                                            <FormLabel className="uppercase text-xs font-bold text-zinc-500">
                                                Server name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isLoading}
                                                    className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                                                    placeholder="Enter server name"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter className="bg-gray-100 px-6 py-4">
                                <Button variant="primary" disabled={isLoading}>
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