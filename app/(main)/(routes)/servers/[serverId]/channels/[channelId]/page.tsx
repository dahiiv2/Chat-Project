import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";  
import { redirect } from "next/navigation";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { ChannelType } from "@prisma/client";

// Using any type for params to avoid TypeScript issues in Next.js 15
interface ChannelIDPageProps {
    params: any;
}

const ChannelIDPage = async ({ 
    params 
}: ChannelIDPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return <RedirectToSignIn />;
    }

    const channel = await db.channel.findUnique({
        where: {
            id: params.channelId
        }
    });

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        }
    });

    if (!member || !channel) {
        return redirect("/");
    }

    return ( 
        <div className="bg-white dark:bg-[#1E1F22] flex flex-col h-full">
            {/* Enhanced header with darker background and shadow - matching conversation page */}
            <div className="bg-zinc-100 dark:bg-[#2B2D31] border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4">
                    <ChatHeader 
                        name={channel.name}
                        channelType={channel.type}
                        serverId={params.serverId}
                        type="channel"
                    />
                </div>
            </div>
            
            {/* Messages area - flex-1 to expand and take available space */}
            {channel.type === ChannelType.TEXT && (
                <>
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <ChatMessages 
                                member={member}
                                name={channel.name}
                                chatId={channel.id}
                                type="channel"
                                apiUrl="/api/messages"
                                socketUrl="/api/socket/messages"
                                socketQuery={{
                                    channelId: channel.id,
                                    serverId: channel.serverId
                                }}
                                paramKey="channelId"
                                paramValue={channel.id}
                            />
                        </div>
                    </div>
                    
                    {/* Chat input fixed at the bottom */}
                    <div className="mt-auto pb-6 px-4">
                        <ChatInput 
                            name={channel.name}
                            type="channel"
                            apiUrl="/api/socket/messages"
                            query={{
                                channelId: channel.id,
                                serverId: channel.serverId
                            }}
                        />
                    </div>  
                </>
            )}
            {channel.type === ChannelType.AUDIO && (
                <MediaRoom
                    chatId={channel.id}
                    video={false}
                    audio={true}
                />
            )}
            {channel.type === ChannelType.VIDEO && (
                <MediaRoom
                    chatId={channel.id}
                    video={true}
                    audio={true}
                />
            )}
        </div>
     );
}
 
export default ChannelIDPage;