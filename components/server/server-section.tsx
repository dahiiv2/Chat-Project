/**
 * ServerSection Component
 * 
 * Renders a section of server content (channels or members):
 * - Groups related items with section headers
 * - Provides role-based permission controls
 * - Handles navigation between channels and conversations
 * - Includes management controls for channels (edit, delete)
 * - Highlights active channel in the UI
 */
"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { ActionTooltip } from "@/components/action-tooltip";
import { Plus, Settings, Edit, Trash } from "lucide-react";
import { MemberRole, Server, ChannelType } from "@prisma/client";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/user-avatar";
import { useRouter, useParams } from "next/navigation";
import { ModalType } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";

/**
 * Props for the ServerSection component
 * @property data - Array of section data with label, type, and items
 * @property role - Current user's role within the server
 * @property server - Server data object
 * @property channelType - Optional channel type for creating new channels
 */
interface ServerSectionProps {
    data: {
        label: string;
        type: "channel" | "member";
        data: {
            icon: React.ReactNode;
            name: string;
            id: string;
            imageUrl?: string;
        }[] | undefined;
    }[];
    role: MemberRole;
    server: Server;
    channelType?: ChannelType;
}

export const ServerSection = ({ data, role, server, channelType }: ServerSectionProps) => {
    // Access modal store for channel management actions
    const { onOpen } = useModal();
    // Access Next.js router for navigation
    const router = useRouter();
    // Get current route parameters
    const params = useParams();

    // Handle channel actions (edit, delete) with event propagation control
    const onAction = (e: React.MouseEvent, action: ModalType, channelData: any) => {
        // Prevent triggering parent click handlers (channel navigation)
        e.stopPropagation();
        // Open the requested modal with relevant context data
        onOpen(action, { 
            server, 
            channel: channelData,
            channelType 
        });
    }

    return (
        <div className="space-y-4 mt-2">
            {/* Map through each section (Text Channels, Voice Channels, etc.) */}
            {data.map((item) => (
                <div key={item.label} className="space-y-2">
                    {/* Section header with label and separator */}
                    <div className="flex items-center px-2">
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">{item.label}</p>
                        <Separator className="ml-2 h-[1px] flex-1 bg-zinc-300 dark:bg-zinc-700" />
                        {/* Create channel button - only visible to admins and moderators */}
                        {role !== MemberRole.USER && item.type === "channel" && (
                            <ActionTooltip label="Create Channel">
                                <button
                                    onClick={() => onOpen("createChannel", { channelType })}
                                    className="ml-2 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </ActionTooltip>
                        )}

                        {/* Manage members button - only visible to admins */}
                        {role === MemberRole.ADMIN && item.type === "member" && (
                            <ActionTooltip label="Manage Members">
                                <button
                                    onClick={() => onOpen("members", { server })}
                                    className="ml-2 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400"
                                >
                                    <Settings className="h-4 w-4" />
                                </button>
                            </ActionTooltip>
                        )}
                    </div>
                    {/* List of items in the section (channels or members) */}
                    <div className="space-y-1">
                        {/* Map through items in the section */}
                        {item.data?.map((data) => (
                            <div 
                                key={data.id} 
                                className={cn(
                                    "flex items-center gap-x-2 px-3 py-2 rounded-md hover:bg-zinc-200/80 dark:hover:bg-zinc-700/50 cursor-pointer group transition",
                                    // Add highlight for active channel
                                    item.type === "channel" && params?.channelId === data.id && 
                                    "bg-zinc-300/80 dark:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200"
                                )}
                                onClick={
                                    // Navigate to channel or conversation based on type
                                    item.type === "channel" 
                                        ? () => router.push(`/servers/${server.id}/channels/${data.id}`)
                                        : item.type === "member"
                                            ? () => router.push(`/servers/${server.id}/conversations/${data.id}`)
                                            : undefined
                                }
                            >
                                {/* Avatar for members, icon for channels */}
                                {item.type === "member" ? (
                                    <UserAvatar 
                                        src={data.imageUrl} 
                                        className="h-8 w-8 md:h-8 md:w-8"
                                    />
                                ) : (
                                    data.icon
                                )}
                                {/* Channel or member name */}
                                <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300 
                                            group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition">
                                    {data.name}
                                </p>
                                {/* Channel management actions - not shown for general channel or regular users */}
                                {item.type === "channel" && data.name !== "general" && role !== MemberRole.USER && (
                                    <div className="ml-auto flex items-center gap-x-2">
                                        <ActionTooltip label="Edit">
                                            <Edit 
                                                onClick={(e) => onAction(e, "editChannel", data)}
                                                className="hidden group-hover:block h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                                            />
                                        </ActionTooltip>
                                        <ActionTooltip label="Delete">
                                            <Trash 
                                                onClick={(e) => onAction(e, "deleteChannel", data)}
                                                className="hidden group-hover:block h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                                            />
                                        </ActionTooltip>
                                    </div>
                                )}
                                {/* Display role icon for members */}
                                {item.type === "member" && data.icon && (
                                    <div className="ml-auto">
                                        {data.icon}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
