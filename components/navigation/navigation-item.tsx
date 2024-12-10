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
    const params = useParams();
    const router = useRouter();

    return (
        <ActionTooltip
            side="right"
            align="center"
            label={name}
        >
            <button
                onClick={() => router.push(`/servers/${id}`)}
                className="group relative flex items-center"
            >
                <div className={cn(
                    "absolute left-0 rounded-r-full transition-all w-[4px]",
                    "bg-gradient-to-b from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700",
                    params?.serverId !== id && "group-hover:h-[20px] opacity-0 group-hover:opacity-40",
                    params?.serverId === id ? "h-[36px]" : "h-[8px]"
                )}/>
                <div className={cn(
                    "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                    params?.serverId === id && "bg-amber-500/10 dark:bg-amber-500/20 rounded-[16px]"
                )}>
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