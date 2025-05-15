/**
 * ServerSidebar Component
 * 
 * Server-side rendered component that displays the server sidebar with channels and members:
 * - Fetches and organizes server data including channels and members
 * - Groups channels by type (text, audio, video) and displays members
 * - Provides navigation and management of server content
 * - Handles authentication state and permissions
 * - Organizes UI with section headers and scrollable content areas
 */
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

/**
 * Props for the ServerSidebar component
 * @property serverId - Unique identifier for the server to display
 */
interface ServerSidebarProps {
    serverId: string;
}

// Map channel types to their respective icons
const iconMap = {
    [ChannelType.TEXT]: <MessageSquare className="h-4 w-4"/>,
    [ChannelType.AUDIO]: <Headphones className="h-4 w-4"/>,
    [ChannelType.VIDEO]: <Video className="h-4 w-4"/>
}

// Map user roles to their respective icons with distinctive colors
const roleIconMap = {
    [MemberRole.ADMIN]: <Shield className="h-4 w-4 text-amber-500"/>,
    [MemberRole.MODERATOR]: <ShieldCheck className="h-4 w-4 text-indigo-500"/>,
    [MemberRole.USER]: <User className="h-4 w-4 text-emerald-500"/>
}

export const ServerSidebar = async ({
    serverId
}: ServerSidebarProps) => {
    // Fetch the current user's profile from authentication context
    const profile = await currentProfile();
    
    // Redirect unauthenticated users to the home page
    if (!profile) {
        return redirect("/");
    }

    // Fetch the server data with channels and members
    const server = await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            // Include channels ordered by creation date
            channels: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            // Include members with their profiles, ordered by role
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

    // Filter channels by type for organization in the sidebar
    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT)
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO)
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO)
    // Filter valid members with profile IDs
    const members = server?.members.filter((member) => member.profileId)

    // Redirect if server not found
    if (!server) {
        return redirect("/");
    }

    // Determine the current user's role in this server (defaults to USER)
    const role = server.members.find((member) => member.profileId === profile.id)?.role || MemberRole.USER;

    // Prepare data structure for rendering in the sidebar sections
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
        // Main sidebar container with responsive styling
        <div className="flex flex-col h-full text-primary w-full dark:bg-zinc-800 bg-zinc-200 
        transition-all duration-200 ease-in-out border-r dark:border-zinc-700 border-zinc-300
        backdrop-blur-sm dark:backdrop-blur-md shadow-lg dark:shadow-zinc-900/20 font-sans">
            {/* Server header with dropdown menu */}
            <ServerHeader
                server={server}
                role={role}
            />
            {/* Scrollable content area */}
            <ScrollArea className="px-3 h-full">
                <div className="mt-2">
                    {/* Server search component */}
                    <ServerSearch data={serverData} />
                    <div className="space-y-2">
                        {/* Text channels section */}
                        <ServerSection 
                            data={[serverData[0]]} 
                            role={role} 
                            server={server}
                            channelType={ChannelType.TEXT} 
                        />
                        {/* Voice channels section */}
                        <ServerSection 
                            data={[serverData[1]]} 
                            role={role} 
                            server={server}
                            channelType={ChannelType.AUDIO} 
                        />
                        {/* Video channels section */}
                        <ServerSection 
                            data={[serverData[2]]} 
                            role={role} 
                            server={server}
                            channelType={ChannelType.VIDEO} 
                        />
                        {/* Members section */}
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