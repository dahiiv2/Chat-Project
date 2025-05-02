import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";

import { 
    MessageSquare, 
    Headphones, 
    Video, 
    Shield, 
    ShieldCheck, 
    User 
} from "lucide-react";

interface ServerSidebarProps {
    serverId: string;
}

const iconMap = {
    [ChannelType.TEXT]: <MessageSquare className="h-4 w-4"/>,
    [ChannelType.AUDIO]: <Headphones className="h-4 w-4"/>,
    [ChannelType.VIDEO]: <Video className="h-4 w-4"/>
}

const roleIconMap = {
    [MemberRole.ADMIN]: <Shield className="h-4 w-4 text-amber-500"/>,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 text-indigo-500"/>,
    [MemberRole.USER]: <User className="h-4 w-4 text-emerald-500"/>
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
    const members = server?.members.filter((member) => member.profileId)

    if (!server) {
        return redirect("/");
    }

    const role = server.members.find((member) => member.profileId === profile.id)?.role || MemberRole.USER;

    const serverData = [
        {
            label: "Text Channels",
            type: "channel" as const,
            data: textChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: iconMap[channel.type]
            }))
        },
        {
            label: "Voice Channels",
            type: "channel" as const,
            data: audioChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: iconMap[channel.type]
            }))
        },
        {
            label: "Video Channels",
            type: "channel" as const,
            data: videoChannels?.map((channel) => ({
                id: channel.id,
                name: channel.name,
                icon: iconMap[channel.type]
            }))
        },
        {
            label: "Members",
            type: "member" as const,
            data: members?.map((member) => ({
                id: member.id,
                name: member.profile.name,
                icon: roleIconMap[member.role],
                imageUrl: member.profile.imageUrl
            }))
        }
    ];

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-zinc-800 bg-zinc-200 
        transition-all duration-200 ease-in-out border-r dark:border-zinc-700 border-zinc-300
        backdrop-blur-sm dark:backdrop-blur-md shadow-lg dark:shadow-zinc-900/20 font-sans">
            <ServerHeader
                server={server}
                role={role}
            />
            <ScrollArea className="px-3 h-full">
                <div className="mt-2">
                    <ServerSearch data={serverData} />
                    <div className="space-y-2">
                        <ServerSection 
                            data={[serverData[0]]} 
                            role={role} 
                            server={server}
                            channelType={ChannelType.TEXT} 
                        />
                        <ServerSection 
                            data={[serverData[1]]} 
                            role={role} 
                            server={server}
                            channelType={ChannelType.AUDIO} 
                        />
                        <ServerSection 
                            data={[serverData[2]]} 
                            role={role} 
                            server={server}
                            channelType={ChannelType.VIDEO} 
                        />
                        <ServerSection 
                            data={[serverData[3]]} 
                            role={role} 
                            server={server} 
                        />
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}