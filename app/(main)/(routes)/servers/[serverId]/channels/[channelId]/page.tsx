/**
 * Channel Page Component
 * 
 * This page renders a specific channel within a server. It displays:
 * - A header with the channel name and type (text, audio, video)
 * - Messages for text channels or media rooms for audio/video channels
 * - An input area for sending messages (text channels only)
 * 
 * The component handles authentication, fetches channel and member data,
 * and renders the appropriate interface based on channel type.
 */

// Authentication and data utilities
import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";  
import { redirect } from "next/navigation";

// Chat and media components
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { ChannelType } from "@prisma/client";

// Using any type for params to avoid TypeScript issues in Next.js 15
interface ChannelIDPageProps {
    params: any;
}

/**
 * ChannelIDPage Component
 * 
 * Server-side rendered page component that displays a channel's content
 * based on the channel type (text, audio, video).
 * 
 * @param params - Contains route parameters including serverId and channelId
 */
const ChannelIDPage = async ({
    params
}: ChannelIDPageProps) => {
    // Get the current user's profile
    const profile = await currentProfile();

    // Await params before accessing properties (required in Next.js 15+)
    const { serverId, channelId } = await params;

    // Redirect to sign-in if not authenticated
    if (!profile) {
        return <RedirectToSignIn />;
    }

    // Fetch the requested channel data
    const channel = await db.channel.findUnique({
        where: {
            id: channelId
        }
    });

    // Get the current user's membership in this server
    // Include profile data for rendering user information
    const member = await db.member.findFirst({
        where: {
            serverId: serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        }
    });

    // Redirect to home if user is not a member of the server
    // or if the channel doesn't exist
    if (!member || !channel) {
        return redirect("/");
    }

    return ( 
        // Main container
        <div className="bg-white dark:bg-[#1E1F22] flex flex-col h-full">
            {/* Enhanced header with darker background and shadow - matching conversation page */}
            <div className="bg-zinc-100 dark:bg-[#2B2D31] border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4">
                    <ChatHeader
                        name={channel.name}
                        channelType={channel.type}
                        serverId={serverId}
                        type="channel"
                    />
                </div>
            </div>
            
            {/* Messages area - flex-1 to expand and take available space */}
            {/* TEXT CHANNEL LAYOUT */}
            {channel.type === ChannelType.TEXT && (
                <>
                    {/* Scrollable message container */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <ChatMessages 
                                member={member}          // Current user's server membership
                                name={channel.name}      // Channel name for display
                                chatId={channel.id}      // Unique identifier for this chat
                                type="channel"           // Type for API differentiation
                                apiUrl="/api/messages"   // Endpoint for fetching messages
                                socketUrl="/api/socket/messages" // Real-time socket endpoint
                                socketQuery={{           // Query params for socket connection
                                    channelId: channel.id,
                                    serverId: channel.serverId
                                }}
                                paramKey="channelId"      // For infinite loading
                                paramValue={channel.id}  // Value for infinite loading
                            />
                        </div>
                    </div>
                    
                    {/* Chat input fixed at the bottom */}
                    <div className="mt-auto pb-6 px-4">
                        <ChatInput 
                            name={channel.name}         // Channel name for display
                            type="channel"              // Type for API differentiation
                            apiUrl="/api/socket/messages" // Endpoint for sending messages
                            query={{                    // Query params for API requests
                                channelId: channel.id,
                                serverId: channel.serverId
                            }}
                        />
                    </div>  
                </>
            )}
            {/* AUDIO CHANNEL - MediaRoom with audio only */}
            {channel.type === ChannelType.AUDIO && (
                <MediaRoom
                    chatId={channel.id}         // Unique room identifier 
                    video={false}               // Disable video for audio channels
                    audio={true}                // Enable audio
                />
            )}
            
            {/* VIDEO CHANNEL - MediaRoom with both video and audio */}
            {channel.type === ChannelType.VIDEO && (
                <MediaRoom
                    chatId={channel.id}         // Unique room identifier
                    video={true}                // Enable video
                    audio={true}                // Enable audio
                />
            )}
        </div>
     );
}
 
export default ChannelIDPage;