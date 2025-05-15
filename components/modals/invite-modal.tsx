/**
 * InviteModal Component
 * 
 * Provides an interface for generating, copying, and refreshing server invite links:
 * - Displays the current invite URL in a read-only input field
 * - Offers a copy button that provides visual feedback when clicked
 * - Includes functionality to generate a new invite code via API
 * - Updates the UI state during loading operations
 * - Links are constructed using the application's origin + the server's invite code
 */
"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, RefreshCw } from "lucide-react";
import { useOrigin } from "@/hooks/use-origin";
import { useState } from "react";
import axios from "axios";


export const InviteModal = () => {
    // Access the modal context to control open/close states and data
    const { onOpen, isOpen, onClose, type, data } = useModal();
    // Get the application's origin URL for creating complete invite links
    const origin = useOrigin();

    // Determine if this specific modal should be displayed
    const isModalOpen = isOpen && type === "invite";
    // Extract server data from the modal context
    const { server } = data;

    // Track if the invite link has been copied to clipboard
    const [copied, setCopied] = useState(false);
    // Track loading state during API operations
    const [isLoading, setIsLoading] = useState(false);

    // Handler for copying the invite URL to clipboard
    const onCopy = () => {
        // Copy the URL to the user's clipboard
        navigator.clipboard.writeText(inviteUrl);
        // Set copied state to true to show visual feedback
        setCopied(true);

        // Reset the copied state after a brief delay
        setTimeout(() => {
            setCopied(false);
        }, 1000)
    };

    // Handler for generating a new invite code via API
    const onNew = async () => {
        try {
            // Set loading state to provide UI feedback
            setIsLoading(true);
            // Make API call to regenerate the server's invite code
            const response = await axios.patch(`/api/servers/${server?.id}/invite-code`);

            // Reopen the invite modal with the updated server data
            onOpen("invite", { server: response.data });
        } catch (error) {
            console.log(error);
        } finally {
            // Reset loading state when operation completes
            setIsLoading(false);
        }
    }

    // Construct the complete invite URL by combining origin and server invite code
    const inviteUrl = `${origin}/invite/${server?.inviteCode}`;

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                {/* Modal header section with title and description */}
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create an invite link
                    </DialogTitle>
                    <DialogDescription className="text-center text-amber-500">
                        This is your sharable invite link, be careful who you give it to!
                    </DialogDescription>
                </DialogHeader>
                {/* Modal body content section */}
                <div className="p-6">
                    {/* Label for the invite link input field */}
                    <Label
                        className="uppercase text-xs font-bold text-zinc-500 dark:text-zinc-300"
                    >
                        Server invite link
                    </Label>
                    {/* Container for input field and copy button */}
                    <div className="flex items-center mt-2 gap-x-2">
                        {/* Read-only input field displaying the invite URL */}
                        <Input 
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0
                        text-black focus-visible:ring-offset-0"
                        value={inviteUrl}/>
                    <Button disabled={isLoading} onClick={onCopy} size="icon">
                        {copied 
                        ? <Check className="w-4 h-4"/>
                        : <Copy className="w-4 h-4"/>}
                    </Button>
                </div>
                <Button
                onClick={onNew}
                    disabled={isLoading}
                    variant="link"
                    size="sm"
                    className="text-xs text-zinc-500 mt-4"
                >
                   Create a new invite link 
                   <RefreshCw className="w-4 h-4 mr-2"/>
                </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}