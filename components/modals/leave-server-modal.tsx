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

export const LeaveServerModal = () => {
    const { isOpen, onClose, type, data } = useModal();
    const router = useRouter();

    const isModalOpen = isOpen && type === "leaveServer";
    const { server } = data;

    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);
            await axios.patch(`/api/servers/${server?.id}/leave`);
            onClose();
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
                    <Button
                        disabled={isLoading}
                        onClick={() => onClose()}
                        variant="ghost"
                    >
                        Cancel
                    </Button>
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