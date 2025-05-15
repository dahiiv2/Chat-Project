/**
 * MembersModal Component
 * 
 * Provides an interface for managing server members with role-based permissions:
 * - Displays a scrollable list of all server members with their avatars and roles
 * - Shows member count in the modal header
 * - Allows administrators to modify member roles (User, Moderator)
 * - Provides functionality to remove members from the server
 * - Includes loading states during API operations
 * - Refreshes member data automatically after changes
 */
"use client";
import { useState } from "react";
import { Shield, Pencil, Check, ShieldCheck, Loader2 } from "lucide-react";
import { MemberRole } from "@prisma/client";
import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ServerWithmembersWithProfiles } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/user-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";


export const MembersModal = () => {
    // Access Next.js router for navigation after member changes
    const router = useRouter();
    // Access modal context for controlling modal state
    const { onOpen, isOpen, onClose, type, data } = useModal();
    // Track which member is currently being modified (for loading state)
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // Determine if this specific modal should be displayed
    const isModalOpen = isOpen && type === "members";
    // Type assertion needed here because server in data might be just Server type 
    // but we need ServerWithmembersWithProfiles to access the members array
    const { server } = data as { server: ServerWithmembersWithProfiles };

    // Handler for removing a member from the server
    const onKick = async (memberId: string) => {
        try {
            // Set loading state for the specific member being kicked
            setLoadingId(memberId);
            // Construct the API URL with query parameters
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server.id
                }
            });

            // Make API call to remove the member
            const response = await axios.delete(url);

            // Refresh the page to update UI
            router.refresh();
            // Reopen the members modal with updated data
            onOpen("members", { server: response.data });
        } catch (error) {
            console.error(error);
        } finally {
            // Reset loading state when operation completes
            setLoadingId("");
        }
    }

    // Handler for changing a member's role (USER or MODERATOR)
    const onRoleChange = async (memberId: string, role: MemberRole ) => {
        try {
            // Set loading state for the specific member being modified
            setLoadingId(memberId);
            // Construct the API URL with query parameters
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server.id
                }
            });

            // Make API call to update the member's role
            const response = await axios.patch(url, { role });

            // Refresh the page to update UI
            router.refresh();
            // Reopen the members modal with updated data
            onOpen("members", { server: response.data });
        } catch (error) {
            console.error(error);
        } finally {
            // Reset loading state when operation completes
            setLoadingId("");
        }
    }

    return (
        // Dialog component that controls the modal visibility
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            {/* Modal content container with dark/light mode support */}
            <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
                {/* Modal header section */}
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Manage Members
                    </DialogTitle>
                    <DialogDescription
                    className="text-center text-amber-500"
                    >
                    {server?.members?.length} Members
                </DialogDescription>
                </DialogHeader>
                {/* Scrollable container for member list */}
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {/* Map through each server member and render their information */}
                    {server?.members?.map((member) => (
                        // Member list item container
                        <div 
                            key={member.id} 
                            className="flex items-center gap-x-3 mb-4 mx-auto w-[90%] py-3 px-4 rounded-lg 
                                       border border-amber-200/50 dark:border-amber-500/20
                                       bg-white/50 dark:bg-zinc-800/50
                                       hover:bg-amber-50 dark:hover:bg-amber-900/10
                                       shadow-sm hover:shadow-md
                                       transition-all duration-200"
                        >
                            {/* Member's avatar */}
                            <UserAvatar src={member.profile.imageUrl} />
                            {/* Member details container */}
                            <div className="flex flex-col gap-y-1 flex-1">
                                {/* Member's display name */}
                                <div className="text-sm font-semibold flex items-center text-zinc-800 dark:text-amber-100">
                                    {member.profile.name}
                                </div>
                                {/* Member's role with proper capitalization */}
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
                                </div>
                            </div>
                            {/* Show role management dropdown for members that aren't the server owner and aren't currently being modified */}
                            {server.profileId !== member.profileId && loadingId !== member.id && (
                                <div className="ml-auto flex items-center">
                                    {/* Dropdown menu for role management */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="focus:outline-none">
                                            <Pencil className="h-4 w-4 text-amber-700 dark:text-amber-400 cursor-pointer hover:text-amber-900 dark:hover:text-amber-300 transition" />
                                        </DropdownMenuTrigger>
                                        {/* Dropdown menu content */}
                                        <DropdownMenuContent side="bottom" align="end" className="bg-white dark:bg-zinc-800 w-56">
                                            {/* Role management section header */}
                                            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                                Change Role
                                            </div>
                                            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                                            {/* USER role option */}
                                            <DropdownMenuItem 
                                                onClick={() => onRoleChange(member.id, "USER")}
                                                className="px-3 py-2 text-sm cursor-pointer flex items-center gap-x-2"
                                            >
                                                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span>User</span>
                                                {/* Show checkmark if this is the current role */}
                                                {member.role === "USER" && (
                                                    <Check className="h-4 w-4 ml-auto text-emerald-600 dark:text-emerald-400" />
                                                )}
                                            </DropdownMenuItem>
                                            {/* MODERATOR role option */}
                                            <DropdownMenuItem 
                                                onClick={() => onRoleChange(member.id, "MODERATOR")}
                                                className="px-3 py-2 text-sm cursor-pointer flex items-center gap-x-2"
                                            >
                                                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span>Moderator</span>
                                                {/* Show checkmark if this is the current role */}
                                                {member.role === "MODERATOR" && (
                                                    <Check className="h-4 w-4 ml-auto text-emerald-600 dark:text-emerald-400" />
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                                            {/* Kick user option - separate section with danger styling */}
                                            <DropdownMenuItem 
                                                onClick={() => onKick(member.id)}
                                                className="cursor-pointer text-rose-500 dark:text-rose-400 px-3 py-2 text-sm flex items-center"
                                            >
                                                <span>Kick User</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                            {/* Show loading spinner when this member is being modified */}
                            {loadingId === member.id && (
                                <div className="ml-auto flex items-center">
                                    <Loader2 className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-spin" />
                                </div>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}