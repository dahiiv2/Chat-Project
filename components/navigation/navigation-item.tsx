/**
 * NavigationItem Component
 * 
 * Displays individual server entries in the navigation sidebar:
 * - Renders server icons with tooltips showing server names
 * - Provides visual indicators for active/selected servers
 * - Handles navigation between servers when clicked
 * - Implements hover effects and active state styling
 * - Uses dynamic styling based on current server selection
 */
"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils"
import { ActionTooltip } from "@/components/action-tooltip";

/**
 * Props for the NavigationItem component
 * @property id - Unique identifier for the server
 * @property imageUrl - URL to the server's icon image
 * @property name - Display name of the server
 */
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
    // Access route parameters to determine current server selection
    const params = useParams();
    // Access router for navigation between servers
    const router = useRouter();

    return (
        // Wrap server icon with tooltip that displays server name on hover
        <ActionTooltip
            side="right"
            align="center"
            label={name}
        >
            {/* Button to navigate to the specific server when clicked */}
            <button
                onClick={() => router.push(`/servers/${id}`)}
                className="group relative flex items-center"
            >
                {/* Active server indicator - vertical bar that changes height/opacity based on selection */}
                <div className={cn(
                    "absolute left-0 rounded-r-full transition-all w-[4px]",
                    "bg-gradient-to-b from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700",
                    params?.serverId !== id && "group-hover:h-[20px] opacity-0 group-hover:opacity-40",
                    params?.serverId === id ? "h-[36px]" : "h-[8px]"
                )}/>
                {/* Server icon container with shape transition effect and active state styling */}
                <div className={cn(
                    "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-amber-500/10 dark:bg-amber-500/20 rounded-[16px]"
                )}>
                    {/* Server icon image with responsive sizing */}
                    <Image 
                        fill
                        src={imageUrl}
                        alt="Server"
                    />
                </div>
            </button>
        </ActionTooltip>
    )
}