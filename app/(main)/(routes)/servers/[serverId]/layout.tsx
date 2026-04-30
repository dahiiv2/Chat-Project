/**
 * Server Layout Component
 * 
 * This layout wraps all pages within a specific server, providing:
 * - A fixed sidebar with server navigation (channels, members, etc.)
 * - Authentication and authorization checks for server access
 * 
 * This layout component is applied to all routes under /servers/[serverId]/*
 */

// Navigation and authentication utilities
import { redirect } from "next/navigation";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

/**
 * ServerIdLayout Component
 * 
 * Provides the layout structure for all pages within a specific server.
 * Includes the sidebar and ensures the user has access
 * to the requested server before rendering content.
 * 
 * @param children - The page content to render inside this layout
 * @param params - Route parameters containing serverId
 */
// Using the same workaround with 'any' type to bypass Next.js 15's strict typing
export default async function ServerIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: any // Use any type to bypass the strict typing check
}) {
    // Get the current user's profile for authentication
    const profile = await currentProfile();

    // Await params before accessing properties (required in Next.js 15+)
    const { serverId } = await params;

    // Redirect to home if user is not authenticated
    if (!profile) {
        return redirect("/");
    }

    // Fetch server data and verify user is a member of this server
    // The query checks both the server ID and that the current user
    // is in the members list of the server
    // Using findFirst instead of findUnique because relation filters (members: { some: ... })
    // are not supported by findUnique without relationMode = "prisma"
    const server = await db.server.findFirst({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    // Redirect to home if server doesn't exist or user is not a member
    if (!server) {
        return redirect("/");
    }

    return (
        // Main container that takes full height
        <div className="h-full">
            {/* Server sidebar - hidden on mobile, fixed position on desktop */}
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={serverId} />
            </div>
            
            {/* Main content area - pushed to the right on desktop to make room for sidebar */}
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    );
}