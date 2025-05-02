import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";

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

    return ( 
        <div>Conversation page</div>
     );
}
 
export default MemberIDPage;