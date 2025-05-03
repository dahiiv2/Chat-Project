import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { getOrCreateConversation } from "@/lib/conversation";

// Using any type for params to avoid TypeScript issues in Next.js 15
interface MemberIDPageProps {
    params: any;
}

const MemberIDPage = async ({ 
    params 
}: MemberIDPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return <RedirectToSignIn />;
    }

    const currentMember = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        }
    });

    if (!currentMember) {
        return redirect("/");
    }

    const conversation = await getOrCreateConversation(currentMember.id, params.memberId);

    if (!conversation) {
        return redirect("/");
    }

    const { memberOne, memberTwo } = conversation;
    
    // Check if the user is messaging themselves
    const otherMember = memberOne.profileId === profile.id 
        ? memberTwo 
        : memberOne;
    
    const isSelfConversation = profile.id === otherMember.profileId;
    
    // Display name - use "Personal Notes" for self-conversations
    const displayName = isSelfConversation 
        ? "Personal Notes" 
        : otherMember.profile.name;

    return ( 
        <div className="bg-white dark:bg-[#1E1F22] h-full flex flex-col">
            {/* Enhanced header with darker background and shadow */}
            <div className="bg-zinc-100 dark:bg-[#2B2D31] border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="p-4">
                    <ChatHeader
                        imageUrl={isSelfConversation 
                            ? profile.imageUrl 
                            : otherMember.profile.imageUrl}
                        name={displayName}
                        serverId={params.serverId}
                        type="conversation"
                    />
                </div>
            </div>
            
            {/* Content area */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    <ChatMessages 
                        member={currentMember}
                        name={displayName}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/messages"
                        socketUrl="/api/socket/messages"
                        socketQuery={{
                            conversationId: conversation.id,
                            serverId: params.serverId
                        }}
                        paramKey="conversationId"
                        paramValue={conversation.id}
                    />
                </div>
            </div>
        </div>
     );
}
 
export default MemberIDPage;