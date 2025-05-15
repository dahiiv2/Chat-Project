/**
 * NavigationSidebar Component
 * 
 * Primary navigation component that renders the left sidebar of the application:
 * - Fetches and displays servers the current user belongs to
 * - Renders the NavigationAction button for creating new servers
 * - Includes server navigation, theme toggle, and user profile buttons
 * - Displays admin navigation option for users with admin privileges
 * - Handles authentication state and redirects unauthenticated users
 * - Server-side rendered component with database integration
 */
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

import { NavigationAction } from "./navigation-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import Link from "next/link";
import { ActionTooltip } from "@/components/action-tooltip";

export const NavigationSidebar = async () => {
    console.log("NavigationSidebar rendering");
    
    // Fetch the current user's profile from authentication context
    const profile = await currentProfile();

    // Security check - redirect unauthenticated users to the homepage
    if (!profile) {
        console.log("No profile, redirecting");
        return redirect("/");
    }

    console.log("Profile found, fetching servers");

    // Query database for all servers where the current user is a member
    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })

    console.log("Servers found:", servers.length);

    return(
        // Main sidebar container with responsive styling and shadow effect
        <div className="space-y-4 flex flex-col items-center h-full text-primary 
        w-full bg-[#f2f2f2] dark:bg-[#1b1b1b] py-3 shadow-[2px_0_4px_rgba(0,0,0,0.2)]">
            {/* Button for creating new servers */}
            <NavigationAction />
            {/* Visual separator between create button and server list */}
            <Separator 
                className="h-[2px] bg-zinc-300 dark:bg-zinc-700
                rounded-md w-10 mx-auto"
            />
            {/* Scrollable area containing server list */}
            <ScrollArea className="flex-1 w-full">
                {/* Map through user's servers and render NavigationItem for each */}
                {servers.map((server) => (
                    <div key={server.id} className="mb-4">
                        <NavigationItem
                            id={server.id}
                            name={server.name}
                            imageUrl={server.imageUrl}
                        />
                    </div>
                ))}
            </ScrollArea>
            {/* Admin button for users with admin privileges */}
            {/* Using type assertion since we've added isAdmin to the schema but TypeScript definitions haven't been updated */}
            {(profile as any).isAdmin && (
                <div className="pb-0">
                    <ActionTooltip
                        side="right"
                        align="center"
                        label="Admin Dashboard"
                    >
                        <Link href="/admin">
                            <button className="group flex mx-3 h-[48px] w-[48px] rounded-[24px] items-center justify-center bg-amber-500/10 dark:bg-amber-600/20 hover:bg-amber-500/20 dark:hover:bg-amber-500/30 transition-all overflow-hidden relative">
                                <Shield className="group-hover:text-amber-500 dark:group-hover:text-amber-400 text-amber-600 dark:text-amber-500 h-5 w-5 transition" />
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-amber-500/10 to-transparent transition-opacity"></span>
                            </button>
                        </Link>
                    </ActionTooltip>
                </div>
            )}

            {/* Footer section containing theme toggle and user profile */}
            <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                {/* Toggle button for switching between light/dark modes */}
                <ModeToggle />
                {/* User profile button with sign out functionality */}
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "h-[48px] w-[48px]"
                        }
                    }}
                />
            </div>
        </div>
    )
}