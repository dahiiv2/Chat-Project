/**
 * DeleteChannelModal Component
 * 
 * Confirmation dialog for channel deletion that sends a delete request
 * to the API and handles navigation after successful deletion.
 */
"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import qs from "query-string";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";

/**
 * Modal component for confirming channel deletion
 */
export const DeleteChannelModal = () => {
    // Access modal state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();
    
    // Only display this modal when deleteChannel type is active
    const isModalOpen = isOpen && type === "deleteChannel";
    // Extract server and channel data passed to the modal
    const { server, channel } = data;

    // Track loading state for UI feedback
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle delete confirmation
     * Sends delete request to API and handles navigation after deletion
     */
    const onClick = async () => {
        try {
            setIsLoading(true);
            
            // Build API URL with server ID as query parameter for authorization check
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id,
                }
            });
            
            // Send delete request to channels API endpoint
            await axios.delete(url);
            
            // Close modal after successful deletion
            onClose();
            // Navigate first, then refresh to ensure proper UI update
            router.push(`/servers/${server?.id}`);
            // Add a small delay before refreshing to allow navigation to complete
            setTimeout(() => {
                router.refresh();
            }, 100);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-amber-500">
                        Are you sure you want to delete <span className="font-semibold">#{channel?.name}</span>?
                        <br />
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-6 py-4">
                    {/* Cancel button with ghost variant */}
                    <Button
                        disabled={isLoading}
                        onClick={() => onClose()}
                        variant="ghost"
                    >
                        Cancel
                    </Button>
                    {/* Delete button with destructive styling for warning */}
                    <Button
                        disabled={isLoading}
                        onClick={onClick}
                        variant="destructive"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}