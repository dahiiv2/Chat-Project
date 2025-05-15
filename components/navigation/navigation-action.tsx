/**
 * NavigationAction Component
 * 
 * Provides a button in the navigation sidebar for creating new servers:
 * - Displays a plus icon with hover effects that changes shape and color
 * - Uses ActionTooltip for displaying helper text on hover
 * - Triggers the createServer modal when clicked
 */
"use client";

import { Plus } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import { useModal } from "@/hooks/use-modal-store";

export const NavigationAction = () => {
    // Access the modal store to open the create server modal
    const { onOpen } = useModal();

    return(
        <div>
            {/* Tooltip wrapper that shows helper text on hover */}
            <ActionTooltip
                side="right"
                align="center"
                label="Add/create a server"
            >
                {/* Button that triggers the server creation modal */}
                <button 
                    onClick={() => onOpen("createServer")}
                    className="group flex items-center"
                >
                    {/* Container for the plus icon with shape-shifting animation */}
                    <div className="flex mx-3 h-[52px] w-[52px] rounded-[28px]
                    group-hover:rounded-[16px] transition-all overflow-hidden
                    items-center justify-center bg-background dark:bg-neutral-700
                    group-hover:bg-[#B8860B]">
                        {/* Plus icon that changes color on hover */}
                        <Plus
                            className="group-hover:text-white transition text-[#B8860B]"
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}