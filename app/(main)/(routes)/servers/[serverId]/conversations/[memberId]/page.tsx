import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";

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

    const conversation = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            id: params.memberId,
        },
        include: {
            profile: true,
        }
    });

    if (!currentMember || !conversation) {
        return redirect("/");
    }

    // Check if the user is messaging themselves
    const isSelfConversation = currentMember.profileId === conversation.profileId;
    
    // Display name - use "Personal Notes" for self-conversations
    const displayName = isSelfConversation ? "Personal Notes" : conversation.profile.name;

    return ( 
        <div className="bg-white dark:bg-[#1E1F22] h-full flex flex-col">
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 relative">
                    <div className="p-4">
                        <ChatHeader 
                            name={displayName}
                            serverId={params.serverId}
                            type="conversation"
                            imageUrl={conversation.profile.imageUrl}
                        />
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {isSelfConversation ? 
                                "This is your personal notepad. Jot down ideas, reminders, or anything you want to remember." :
                                `This is the beginning of your conversation with ${conversation.profile.name}`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default MemberIDPage;