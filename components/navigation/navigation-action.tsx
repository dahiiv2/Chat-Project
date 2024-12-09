"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
    const { onOpen } = useModal();

    return(
        <div>
            <ActionTooltip
                side="right"
                align="center"
                label="Add/create a server"
            >
                <button 
                    onClick={() => onOpen("createServer")}
                    className="group flex items-center"
                >
                    <div className="flex mx-3 h-[52px] w-[52px] rounded-[28px]
                    group-hover:rounded-[16px] transition-all overflow-hidden
                    items-center justify-center bg-background dark:bg-neutral-700
                    group-hover:bg-[#B8860B]">
                        <Plus
                            className="group-hover:text-white transition text-[#B8860B]"
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}