import { Hash, Video, Mic } from "lucide-react";
import { ChannelType } from "@prisma/client";
import { MobileToggle } from "@/components/mobile-toggle";
import { SocketIndicator } from "@/components/socket-indicator";

interface ChatHeaderProps {
    name: string;
    channelType?: ChannelType;
    serverId?: string;
    type: "channel" | "conversation";
    imageUrl?: string;
}

export const ChatHeader = ({
    name,
    channelType,
    serverId,
    type,
    imageUrl
}: ChatHeaderProps) => {
    // Get the correct icon based on channel type
    const Icon = () => {
        if (type === "channel") {
            if (!channelType || channelType === "TEXT") {
                return <Hash className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mr-2" />;
            } else if (channelType === "AUDIO") {
                return <Mic className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mr-2" />;
            } else {
                return <Video className="h-5 w-5 text-zinc-500 dark:text-zinc-400 mr-2" />;
            }
        } else {
            // For conversation type, use profile image if available
            return imageUrl ? (
                <div className="relative w-12 h-12 mr-2">
                    <img 
                        src={imageUrl} 
                        alt={name}
                        className="rounded-full"
                    />
                </div>
            ) : null;
        }
    };

    return (        
        <div className="relative">
            {/* Header top section with menu and gold line */}
            <div className="relative h-6 pt-1">
                {/* Simple menu icon */}
                <div className="absolute left-2 top-0 z-10">
                    {serverId && <MobileToggle serverId={serverId} />}
                </div>
                
                {/* Gold gradient that adapts to screen size */}
                <div className="absolute top-2 w-full h-[2px]">
                    {/* On mobile: starts after the menu */}
                    <div className="md:hidden absolute left-10 right-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 shadow-[0_0_15px_0_rgba(251,191,36,0.7)] dark:shadow-[0_0_10px_0_rgba(217,119,6,0.7)]" />
                    
                    {/* On desktop: spans the full width */}
                    <div className="hidden md:block absolute left-0 right-0 h-full bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 shadow-[0_0_15px_0_rgba(251,191,36,0.7)] dark:shadow-[0_0_10px_0_rgba(217,119,6,0.7)]" />
                </div>

            </div>
            
            {/* Content with channel info */}
            <div className="flex items-center p-2 mt-2">
                <Icon />
                <span className="font-bold text-xl text-zinc-700 dark:text-white relative inline-flex">
                    <span className="relative z-10">{name}</span>
                    <span className="absolute inset-0 bg-white/20 dark:bg-white/10 blur-md rounded-lg -z-0"></span>
                </span>
            </div>
        </div>
    );
}