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
    const router = useRouter();
    const { onOpen, isOpen, onClose, type, data } = useModal();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const isModalOpen = isOpen && type === "members";
    // type assertion needed here because server in data might be just Server type 
    // but we need ServerWithmembersWithProfiles to access the members array
    const { server } = data as { server: ServerWithmembersWithProfiles };

    const onKick = async (memberId: string) => {
        try {
            setLoadingId(memberId);
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server.id
                }
            });

            const response = await axios.delete(url);

            router.refresh();
            onOpen("members", { server: response.data });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId("");
        }
    }

    const onRoleChange = async (memberId: string, role: MemberRole ) => {
        try {
            setLoadingId(memberId);
            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    serverId: server.id
                }
            });

            const response = await axios.patch(url, { role });

            router.refresh();
            onOpen("members", { server: response.data });
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId("");
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white dark:bg-[#313338] p-0 overflow-hidden">
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
                <ScrollArea className="mt-8 max-h-[420px] pr-6">
                    {server?.members?.map((member) => (
                        <div 
                            key={member.id} 
                            className="flex items-center gap-x-3 mb-4 mx-auto w-[90%] py-3 px-4 rounded-lg 
                                       border border-amber-200/50 dark:border-amber-500/20
                                       bg-white/50 dark:bg-zinc-800/50
                                       hover:bg-amber-50 dark:hover:bg-amber-900/10
                                       shadow-sm hover:shadow-md
                                       transition-all duration-200"
                        >
                            <UserAvatar src={member.profile.imageUrl} />
                            <div className="flex flex-col gap-y-1 flex-1">
                                <div className="text-sm font-semibold flex items-center text-zinc-800 dark:text-amber-100">
                                    {member.profile.name}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()}
                                </div>
                            </div>
                            {server.profileId !== member.profileId && loadingId !== member.id && (
                                <div className="ml-auto flex items-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="focus:outline-none">
                                            <Pencil className="h-4 w-4 text-amber-700 dark:text-amber-400 cursor-pointer hover:text-amber-900 dark:hover:text-amber-300 transition" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="bottom" align="end" className="bg-white dark:bg-zinc-800 w-56">
                                            <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                                Change Role
                                            </div>
                                            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
                                            <DropdownMenuItem 
                                                onClick={() => onRoleChange(member.id, "USER")}
                                                className="px-3 py-2 text-sm cursor-pointer flex items-center gap-x-2"
                                            >
                                                <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span>User</span>
                                                {member.role === "USER" && (
                                                    <Check className="h-4 w-4 ml-auto text-emerald-600 dark:text-emerald-400" />
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => onRoleChange(member.id, "MODERATOR")}
                                                className="px-3 py-2 text-sm cursor-pointer flex items-center gap-x-2"
                                            >
                                                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span>Moderator</span>
                                                {member.role === "MODERATOR" && (
                                                    <Check className="h-4 w-4 ml-auto text-emerald-600 dark:text-emerald-400" />
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-700" />
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