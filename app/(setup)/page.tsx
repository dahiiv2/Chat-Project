/**
 * Setup Page Component
 * 
 * This page serves as the entry point for new users or users without servers.
 * It handles the onboarding flow by:
 * - Creating or retrieving the user's profile
 * - Checking if the user is already a member of any server
 * - Redirecting to an existing server if found, or showing the initial setup modal
 */

// Database, profile, and navigation utilities
import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";
import { redirect } from "next/navigation";

// Components
import { InitialModal } from "@/components/modals/initial-modal";

/**
 * SetupPage Component
 * 
 * Server-side rendered page that manages the initial user experience.
 * If a user is already a member of a server, they are redirected to that server.
 * Otherwise, they are shown the server creation modal to create their first server.
 */
const SetupPage = async () => {
    // Get or create the user's profile
    // This function handles user authentication and profile creation
    const profile = await initialProfile();

    // Check if the user is already a member of any server
    // If they are, we'll redirect them to that server instead of showing the setup page
    const server = await db.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id  // Look for servers where this user is a member
                }
            }
        }
    });

    // If user is already a member of a server, redirect to that server
    // This ensures users with existing servers skip the setup process
    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    // If no existing server membership is found, show the initial setup modal
    // This allows the user to create their first server
    return <InitialModal />;
}

export default SetupPage;