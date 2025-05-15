/**
 * DeleteServerModal Component
 * 
 * Confirmation dialog for server deletion that sends a delete request
 * to the API and handles navigation after successful deletion.
 */
"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
 * Modal component for confirming server deletion
 */
export const DeleteServerModal = () => {
    // Access modal state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    // Only display this modal when deleteServer type is active
    const isModalOpen = isOpen && type === "deleteServer";
    // Extract server data passed to the modal
    const { server } = data;

    // Track loading state for UI feedback
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle delete confirmation
     * Sends delete request to API and navigates to home page after successful deletion
     */
    const onClick = async () => {
        try {
            setIsLoading(true);
            // Send delete request to servers API endpoint
            await axios.delete(`/api/servers/${server?.id}`);
            // Close modal after successful deletion
            onClose();
            // Update router cache and redirect to home page
            router.refresh();
            router.push("/");
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
                        Delete server
                    </DialogTitle>
                    <DialogDescription className="text-center text-amber-500">
                        Are you sure you want to delete <span className="font-semibold">{server?.name}</span>?
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