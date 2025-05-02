"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import { ActionTooltip } from "@/components/action-tooltip";
import { Plus, Settings, Edit, Trash } from "lucide-react";
import { MemberRole, Server, ChannelType } from "@prisma/client";
import { useModal } from "@/hooks/use-modal-store";
import { UserAvatar } from "@/components/user-avatar";

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
    const { onOpen } = useModal();

    return (
        <div className="space-y-4 mt-2">
            {data.map((item) => (
                <div key={item.label} className="space-y-2">
                    <div className="flex items-center px-2">
                        <p className="text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">{item.label}</p>
                        <Separator className="ml-2 h-[1px] flex-1 bg-zinc-300 dark:bg-zinc-700" />
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
                    <div className="space-y-1">
                        {item.data?.map((data) => (
                            <div 
                                key={data.id} 
                                className="flex items-center gap-x-2 px-3 py-2 rounded-md hover:bg-zinc-200/80 
                                          dark:hover:bg-zinc-700/50 cursor-pointer group transition"
                            >
                                {item.type === "member" ? (
                                    <UserAvatar 
                                        src={data.imageUrl} 
                                        className="h-8 w-8 md:h-8 md:w-8"
                                    />
                                ) : (
                                    data.icon
                                )}
                                <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300 
                                            group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition">
                                    {data.name}
                                </p>
                                {item.type === "channel" && data.name !== "general" && role !== MemberRole.USER && (
                                    <div className="ml-auto flex items-center gap-x-2">
                                        <ActionTooltip label="Edit">
                                            <Edit 
                                                className="hidden group-hover:block h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                                            />
                                        </ActionTooltip>
                                        <ActionTooltip label="Delete">
                                            <Trash 
                                                className="hidden group-hover:block h-4 w-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                                            />
                                        </ActionTooltip>
                                    </div>
                                )}
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
