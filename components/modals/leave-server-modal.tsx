/**
 * LeaveServerModal Component
 * 
 * Confirmation dialog for leaving a server that sends a patch request
 * to the API and handles navigation after successfully leaving.
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
 * Modal component for confirming server exit
 */
export const LeaveServerModal = () => {
    // Access modal state management
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    // Only display this modal when leaveServer type is active
    const isModalOpen = isOpen && type === "leaveServer";
    // Extract server data passed to the modal
    const { server } = data;

    // Track loading state for UI feedback
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle leave confirmation
     * Sends patch request to API and navigates to home page after leaving
     */
    const onClick = async () => {
        try {
            setIsLoading(true);
            // Send leave request to server API endpoint
            await axios.patch(`/api/servers/${server?.id}/leave`);
            // Close modal after successfully leaving
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
                        Leave server
                    </DialogTitle>
                    <DialogDescription className="text-center text-amber-500">
                        Are you sure you want to leave <span className="font-semibold">{server?.name}</span>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-6 py-4">
                    {/* Cancel button */}
                    <Button
                        disabled={isLoading}
                        onClick={() => onClose()}
                        variant="ghost"
                    >
                        Cancel
                    </Button>
                    {/* Leave button with destructive styling */}
                    <Button
                        disabled={isLoading}
                        onClick={onClick}
                        variant="destructive"
                    >
                        Leave
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}