/**
 * ServerHeader Component
 * 
 * Displays the server title with dropdown menu for server management:
 * - Shows server name with dropdown trigger
 * - Provides role-based access to server management functions
 * - Contains dropdown items for various server actions (invite, settings, manage members)
 * - Handles server deletion and exit actions
 * - Adapts UI based on user's role permissions (admin, moderator, user)
 */
"use client";

import { ServerWithmembersWithProfiles } from "@/types";
import { MemberRole } from "@prisma/client";
import { ChevronDown, LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";
import { useState } from "react";

/**
 * Props for the ServerHeader component
 * @property server - Server data including members with their profiles
 * @property role - Current user's role within the server (ADMIN, MODERATOR, USER)
 */
interface ServerHeaderProps {
    server: ServerWithmembersWithProfiles
    role?: MemberRole;
};

export const ServerHeader = ({
    server,
    role
}: ServerHeaderProps) => {
    // Access modal store for opening various server-related modals
    const { onOpen } = useModal();
    // Track dropdown menu open state
    const [open, setOpen] = useState(false);
    
    // Determine user permission levels for conditional rendering
    const isAdmin = role === MemberRole.ADMIN;
    const isModerator = isAdmin || role === MemberRole.MODERATOR;

    // Helper function to execute an action and close the dropdown
    const handleAction = (action: () => void) => {
        action();
        setOpen(false);
    };

    return (
        // Dropdown menu for server management options
        <DropdownMenu open={open} onOpenChange={setOpen}>
            {/* Server name button that triggers the dropdown */}
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
                        onClick={() => handleAction(() => onOpen("invite", { server }))}
                        className="px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100/50
                        dark:hover:bg-amber-500/10 cursor-pointer transition"
                    >
                        Create invite link
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => handleAction(() => onOpen("editServer", {server}))}
                        className="px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100
                        dark:hover:bg-zinc-700/50 cursor-pointer transition"
                    >
                        Server Settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => handleAction(() => onOpen("members", { server }))}
                        className="px-3 py-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100
                        dark:hover:bg-zinc-700/50 cursor-pointer transition"
                    >
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => handleAction(() => onOpen("createChannel", { server }))}
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
                        onClick={() => handleAction(() => onOpen("deleteServer", { server }))}
                        className="text-rose-500 dark:text-rose-400 px-3 py-2 hover:bg-rose-100/50
                        dark:hover:bg-rose-500/10 cursor-pointer transition"
                    >
                        Delete Server
                        <Trash className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem
                        onClick={() => handleAction(() => onOpen("leaveServer", { server }))}
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