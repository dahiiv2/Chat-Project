import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";

import { Hash, Music, Film, UserPlus, ShieldCheck, ShieldAlert } from "lucide-react";

interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className="h-4 w-4"/>,
    [ChannelType.AUDIO]: <Music className="h-4 w-4"/>,
    [ChannelType.VIDEO]: <Film className="h-4 w-4"/>
}

const roleIconMap = {
    [MemberRole.ADMIN]: <ShieldCheck className="h-4 w-4"/>,
    [MemberRole.MODERATOR]: <ShieldAlert className="h-4 w-4"/>,
    [MemberRole.USER]: <UserPlus className="h-4 w-4"/>
}

export const ServerSidebar = async ({
    serverId
}: ServerSidebarProps) => {
    const profile = await currentProfile();
    
    if (!profile) {
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                }
            } 
        }
    });

    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)
    const members = server?.members.filter((member) => member.profileId !== profile.id)

    if (!server) {
        return redirect("/");
    }

    const role = server.members.find((member) => member.profileId === profile.id)?.role;


    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-zinc-800 bg-zinc-200 
        transition-all duration-200 ease-in-out border-r dark:border-zinc-700 border-zinc-300
        backdrop-blur-sm dark:backdrop-blur-md shadow-lg dark:shadow-zinc-900/20 font-sans">
            <ServerHeader
                server={server}
                role={role}
            />
            <ScrollArea className="px-3 h-full">
                <div className="space-y-2">
                    <ServerSearch data={
                        [
                            {
                                label: "Text",
                                type: "channel",
                                data: textChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Voice",
                                type: "channel",
                                data: audioChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Video",
                                type: "channel",
                                data: videoChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type]
                                }))
                            },
                            {
                                label: "Members",
                                type: "member",
                                data: members?.map((member) => ({
                                    id: member.id,
                                    name: member.profile.name,
                                    icon: roleIconMap[member.role]
                                }))
                            }
                        ]
                    } />
                </div>
            </ScrollArea>
        </div>
    )
}