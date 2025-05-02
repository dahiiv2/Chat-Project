import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";

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

    return ( 
        <div>Channel page</div>
     );
}
 
export default ChannelIDPage;