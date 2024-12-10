//import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { ServerHeader } from "./server-header";

interface ServerSidebarProps {
    serverId: string;
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

    // const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
    // const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
    // const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)
    // const members = server?.members.filter((member) => member.profileId !== profile.id)

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
        </div>
    )
}