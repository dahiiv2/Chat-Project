/**
 * NavigationSidebar Component
 * 
 * Primary navigation component that renders the left sidebar of the application:
 * - Fetches and displays servers the current user belongs to
 * - Renders the NavigationAction button for creating new servers
 * - Includes server navigation, theme toggle, and user profile buttons
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