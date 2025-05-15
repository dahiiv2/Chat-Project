/**
 * MobileToggle Component
 *
 * Provides responsive navigation for mobile devices:
 * - Creates a slide-out sheet for the navigation and server sidebars
 * - Appears only on mobile viewports (hidden on md+ screens)
 * - Ensures consistent navigation experience across device sizes
 * - Preserves access to both navigation and server content
 */
import { Menu } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

/**
 * MobileToggle component displays a menu button on mobile devices
 * that opens a slide-out navigation panel
 * 
 * @param serverId - The current server ID to pass to the ServerSidebar
 */
export const MobileToggle = ({
    serverId
}: {
    serverId: string;
}) => {
    return (
        <div style={{ position: 'absolute', top: '-8px', left: '-12px' }}>
            {/* Sheet component for slide-out drawer */}
            <Sheet>
                {/* Trigger button that only appears on mobile */}
                <SheetTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition relative"
                        style={{ height: '35px', width: '35px', padding: 0, margin: 0 }}
                    >
                        {/* Menu hamburger icon */}
                        <Menu 
                            className="text-zinc-600 dark:text-zinc-300"
                            style={{ height: '29px', width: '29px' }} 
                            strokeWidth={2.5}
                        />
                        {/* Hover effect highlight */}
                        <span className="absolute inset-0 rounded-md border opacity-0 hover:opacity-100 transition-opacity duration-300"></span>
                    </Button>
                </SheetTrigger>
                {/* Sheet content with navigation components */}
                <SheetContent side="left" className="p-0 flex gap-0">
                    {/* Fixed-width container for NavigationSidebar */}
                    <div className="w-[72px]">
                        <NavigationSidebar />
                    </div>
                    {/* Server-specific sidebar */}
                    <ServerSidebar serverId={serverId}/>
                </SheetContent>
            </Sheet>
        </div>
    );
}