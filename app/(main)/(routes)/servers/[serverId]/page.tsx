/**
 * Server Default Page Component
 * 
 * This page handles the default landing view when a user navigates to a server URL.
 * It doesn't render any UI itself - instead, it redirects the user to the "general"
 * channel of the server.
 * 
 * The component verifies authentication and server membership before redirecting
 * to maintain the security flow.
 */

// Authentication and navigation utilities
import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

// Using any type for params to avoid TypeScript issues in Next.js 15
interface ServerIDPageProps {
    params: any;  // Contains serverId from the route parameter
}

/**
 * ServerIDPage Component
 * 
 * Server-side rendered page that redirects users to the "general" channel
 * when they navigate to the root of a server.
 * 
 * @param params - Route parameters containing serverId
 */
const ServerIDPage = async ({ 
    params 
}: ServerIDPageProps) => {
    // Get the current user's profile for authentication
    const profile = await currentProfile();

    // Redirect to sign-in if not authenticated
    if (!profile) {
        return <RedirectToSignIn />;
    }

    // Fetch server data and verify user is a member of this server
    // Also include the "general" channel which is the default landing channel
    const server = await db.server.findUnique({
        where: {
            id: params.serverId,
            members: {
                some: {
                    profileId: profile.id,  // Ensure current user is a member
                },
            },
        },
        include: {
            channels: {
                where: {
                    name: "general",        // Only get the "general" channel
                },
                orderBy: {
                    createdAt: "asc",       // Get the oldest one if multiple exist
                },
            },
        },
    });

    // Get the "general" channel to redirect to
    const initialChannel = server?.channels[0];

    // Safety check - ensure we found a "general" channel
    if (initialChannel?.name !== "general") {
        return null;
    }

    // Redirect to the general channel
    return redirect(`/servers/${params.serverId}/channels/${initialChannel?.id}`)
}
 
export default ServerIDPage;