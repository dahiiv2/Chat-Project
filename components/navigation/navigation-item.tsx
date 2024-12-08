"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils"
import { ActionTooltip } from "@/components/action-tooltip";

interface NavigationItemProps {
    id: string;
    imageUrl: string;
    name: string;
}

export const NavigationItem = ({
    id,
    imageUrl,
    name
}: NavigationItemProps) => {
    // These hooks help us with navigation and getting URL parameters
    const params = useParams();      // Gets URL parameters (like serverId)
    const router = useRouter();      // Helps us navigate between pages

    return (
        // This adds a tooltip that shows the server name when you hover
        <ActionTooltip
            side="right"
            align="center"
            label={name}
        >
            {/* The button that wraps the whole server icon */}
            <button
                onClick={() => {}}
                className="group relative flex items center"   // 'group' lets us style children on hover
            >
                {/* This is the little indicator bar on the left */}
                <div className={cn(
                    // Base styles: 4px wide, rounded on right, animates changes
                    "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                    
                    // When this isn't the current server, grow to 20px on hover
                    params?.serverId !== id && "group-hover:h-[20px]",
                    
                    // If this is the current server, make it 36px tall, otherwise 8px
                    params?.serverId === id ? "h-[36px]" : "h-[8px]"
                )}/>
                <div className={cn(
                    "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-primary/10 text-primary rounded-[16px]"
                )}>
                    <Image
                        fill
                        src={imageUrl}
                        alt="Channel"
                    />
                </div>
            </button>
        </ActionTooltip>
    )
}