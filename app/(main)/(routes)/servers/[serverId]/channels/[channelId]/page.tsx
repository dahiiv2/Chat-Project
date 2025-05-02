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
        },
    });

    const member = await db.member.findFirst({
        where: {
            serverId: params.serverId,
            profileId: profile.id,
        }
    });

    if (!member || !channel) {
        return redirect("/");
    }

    return ( 
        <div className="bg-white dark:bg-[#1E1F22] h-full flex flex-col">
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Content area */}
                <div className="flex-1 relative">
                    {/* Main content */}
                    <div className="p-4">
                        <ChatHeader 
                            name={channel.name}
                            channelType={channel.type}
                            serverId={params.serverId}
                            type="channel"
                        />
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default ChannelIDPage;