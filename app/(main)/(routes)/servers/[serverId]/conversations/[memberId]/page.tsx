/**
 * Conversation Page Component
 * 
 * This page renders a direct message conversation between two server members.
 * It supports:
 * - Regular text messaging
 * - Video/audio calls via LiveKit integration
 * - Special "Personal Notes" mode when messaging yourself
 * 
 * The component handles authentication, creates or retrieves conversation data,
 * and toggles between chat and video interfaces based on URL parameters.
 */

// Authentication and data utilities
import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

// UI components and conversation helper
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { getOrCreateConversation } from "@/lib/conversation";
import { MediaRoom } from "@/components/media-room";

// Using any type for params to avoid TypeScript issues in Next.js 15
interface MemberIDPageProps {
    params: any;            // URL parameters (serverId, memberId)
    searchParams: any;      // Query parameters (video flag for call mode)
}

/**
 * MemberIDPage Component
 * 
 * Server-side rendered page component that displays a direct message conversation
 * between the current user and another server member. Supports both text chat and
 * audio/video calls
 * 
 * @param params - Route parameters containing serverId and memberId
 * @param searchParams - Query parameters including video flag for call mode
 */
const MemberIDPage = async ({
    params,
    searchParams
}: MemberIDPageProps) => {
    // Get the current user's profile
    const profile = await currentProfile();

    // Await params before accessing properties (required in Next.js 15+)
    const { serverId, memberId } = await params;

    // Redirect to sign-in if not authenticated
    if (!profile) {
        return <RedirectToSignIn />;
    }

    // Fetch current user's membership in this server
    // Include profile data for user information display
    const currentMember = await db.member.findFirst({
        where: {
            serverId: serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        }
    });

    // Redirect to home if user is not a member of this server
    if (!currentMember) {
        return redirect("/");
    }

    // Get existing conversation or create a new one between the two members
    const conversation = await getOrCreateConversation(currentMember.id, memberId);

    // Redirect if conversation couldn't be created or retrieved
    if (!conversation) {
        return redirect("/");
    }

    // Extract both members from the conversation
    const { memberOne, memberTwo } = conversation;
    
    // Determine which member is the other person in the conversation
    // If memberOne is the current user, then memberTwo is the other member (and vice versa)
    const otherMember = memberOne.profileId === profile.id 
        ? memberTwo 
        : memberOne;
    
    // Check if this is a self-conversation (user messaging themselves)
    const isSelfConversation = profile.id === otherMember.profileId;
    
    // For self-conversations, show "Personal Notes" instead of the user's name
    const displayName = isSelfConversation 
        ? "Personal Notes" 
        : otherMember.profile.name;

    return (        
        // Main container
        <div className="bg-white dark:bg-[#1E1F22] h-full flex flex-col">
            {/* Enhanced header with darker background and shadow */}
            <div className="bg-zinc-100 dark:bg-[#2B2D31] border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4">
                    <ChatHeader
                        imageUrl={isSelfConversation 
                            ? profile.imageUrl         // Show own image for Personal Notes
                            : otherMember.profile.imageUrl} // Show other user's image
                        name={displayName}            // Personal Notes or user name
                        serverId={serverId}            // Current server ID
                        type="conversation"          // Header type affects icon and actions
                    />
                </div>
            </div>
            
            {/* Main content - conditionally show video call or text chat interface */}
            {(await searchParams).video ? (
                // VIDEO CALL MODE - shown when URL has ?video=true parameter
                // Added by the ChatVideoButton component in the header
                <div className="flex-1">
                    <MediaRoom
                        chatId={conversation.id}     // Use conversation ID as room identifier
                        video={true}                // Enable video
                        audio={true}                // Enable audio
                    />
                </div>
            ) : (   
                // TEXT CHAT MODE - default view for conversations
                <>
                    {/* Scrollable message container */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            <ChatMessages 
                                member={currentMember}       // Current user's server membership
                                name={displayName}           // Personal Notes or user name
                                chatId={conversation.id}      // Unique identifier for this chat
                                type="conversation"          // Type for API differentiation
                                apiUrl="/api/direct-messages" // Endpoint for fetching messages
                                socketUrl="/api/socket/direct-messages" // Real-time socket endpoint
                                socketQuery={{               // Query params for socket connection
                                    conversationId: conversation.id
                                }}
                                paramKey="conversationId"     // For infinite loading
                                paramValue={conversation.id}  // Value for infinite loading
                            />
                        </div>
                    </div>
                    
                    {/* Chat input fixed at the bottom */}
                    <div className="mt-auto pb-6 px-4">
                        <ChatInput 
                            name={otherMember.profile.name}  // Recipient's name for display
                            type="conversation"             // Type for API differentiation 
                            apiUrl="/api/socket/direct-messages" // Endpoint for sending messages
                            query={{                        // Query params for API requests
                                conversationId: conversation.id
                            }}
                        />
                    </div>
                </>
            )}
        </div>
     );
}
 
export default MemberIDPage;