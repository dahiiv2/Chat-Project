"use client";

import { ServerWithmembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";

interface ServerHeaderProps {
    server: ServerWithmembersWithProfiles
    role?: MemberRole;
};

export const ServerHeader = ({
    server,
    role
}: ServerHeaderProps) => {
    const { onOpen } = useModal();
    
    const isAdmin = role === MemberRole.ADMIN;
    const isModerator = isAdmin || role === MemberRole.MODERATOR;


    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className="focus:outline-none"
                asChild
            >
                <button
                    className="w-full text-md font-semibold px-3 flex items-center 
                    h-12 border-neutral-200 dark:border-neutral-800 border-b-2 
                    hover:bg-amber-100/10 dark:hover:bg-amber-500/10 transition"
                >
                    {server.name}
                    <ChevronDown className="h-5 w-5 ml-auto text-amber-500"/>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 text-xs font-medium text-black dark:text-neutral-300 space-y-[2px]
                border border-amber-200 dark:border-amber-500/20 bg-white/95 dark:bg-zinc-800/95
                backdrop-blur-sm"
            >
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen("invite", { server })}
                        className="px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50
                        dark:hover:bg-amber-500/10 cursor-pointer transition"
                    >
                        Create invite link
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen("editServer", {server})}
                        className="px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100
                        dark:hover:bg-zinc-700/50 cursor-pointer transition"
                    >
                        Server Settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        className="px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100
                        dark:hover:bg-zinc-700/50 cursor-pointer transition"
                    >
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem
                        className="px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100
                        dark:hover:bg-zinc-700/50 cursor-pointer transition"
                    >
                        Create Channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        className="text-rose-500 dark:text-rose-400 px-3 py-2 hover:bg-rose-100/50
                        dark:hover:bg-rose-500/10 cursor-pointer transition"
                    >
                        Delete Server
                        <Trash className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem
                        className="text-rose-500 dark:text-rose-400 px-3 py-2 hover:bg-rose-100/50
                        dark:hover:bg-rose-500/10 cursor-pointer transition"
                    >
                        Leave Server
                        <LogOut className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}