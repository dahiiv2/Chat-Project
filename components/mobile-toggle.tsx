import { Menu } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";
import { ServerSidebar } from "@/components/server/server-sidebar";

export const MobileToggle = ({
    serverId
}: {
    serverId: string;
}) => {
    return (
        <div style={{ position: 'absolute', top: '-8px', left: '-12px' }}>
            <Sheet>
                <SheetTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition relative"
                        style={{ height: '35px', width: '35px', padding: 0, margin: 0 }}
                    >
                        <Menu 
                            className="text-zinc-600 dark:text-zinc-300"
                            style={{ height: '29px', width: '29px' }} 
                            strokeWidth={2.5}
                        />
                        <span className="absolute inset-0 rounded-md border border-amber-400/50 dark:border-amber-500/50 opacity-0 hover:opacity-100 transition-opacity duration-300 shadow-[0_0_4px_0_rgba(251,191,36,0.3)] dark:shadow-[0_0_4px_0_rgba(245,158,11,0.3)]"></span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 flex gap-0">
                    <div className="w-[72px]">
                        <NavigationSidebar />
                    </div>
                    <ServerSidebar serverId={serverId}/>
                </SheetContent>
            </Sheet>
        </div>
    );
}