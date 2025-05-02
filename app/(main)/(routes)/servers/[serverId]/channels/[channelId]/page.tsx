import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";  
import { redirect } from "next/navigation";
import { ChatHeader } from "@/components/chat/chat-header";

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
        <div className="bg-white dark:bg-[#1E1F22] h-full flex flex-col">
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
            
            {/* Content area */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 relative">
                    <div className="p-4">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Welcome to the beginning of the #{channel.name} channel
                        </p>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default ChannelIDPage;