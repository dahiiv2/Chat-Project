/**
 * Main Layout Component
 * 
 * This layout wraps the entire application's main content area, providing:
 * - The navigation sidebar with server selection
 * - The base layout structure for all server and channel pages
 * 
 * This layout applies to all authenticated routes after setup is complete.
 */

import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

/**
 * MainLayout Component
 * 
 * Provides the base layout structure for the application with a fixed
 * navigation sidebar and responsive main content area.
 * 
 * @param children - The page content to render inside this layout
 */
const MainLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return ( 
        // Main container that takes full height of viewport
        <div className="h-full">
            {/* Navigation sidebar - hidden on mobile, fixed position on desktop */}
            <div className="hidden md:flex h-full w-[72px] z-30 flex-col fixed inset-y-0">
                <NavigationSidebar />
            </div>
            
            {/* Main content area - pushed to the right on desktop to make room for navigation */}
            <main className="md:pl-[72px] h-full">
                {children}
            </main>
        </div>
    );
}

export default MainLayout;