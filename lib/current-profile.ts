/**
 * Current User Profile Module (App Router)
 * 
 * Provides authentication-based access to the current user's profile:
 * - Uses Clerk for authentication and user management
 * - Retrieves the linked user profile from the database
 * - Designed for use with the Next.js App Router
 * - Serves as the primary method for accessing user context
 */
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

/**
 * Retrieves the current authenticated user's profile from the database
 * 
 * This function is used throughout the application to:
 * - Get the current user's information for display and permissions
 * - Link Clerk authentication with the application's user data
 * - Verify user identity for protected operations
 * 
 * @returns The user's profile object from the database, or null if not authenticated
 */
export const currentProfile = async () => {
    // Get the authenticated user ID from Clerk
    const { userId } = await auth();

    // Return null for unauthenticated requests
    if (!userId) {
        return null;
    }

    // Query the database for the user profile matching the Clerk user ID
    const profile = await db.profile.findUnique({
        where: {
            userId
        }
    });

    // Return the complete profile object or null if not found
    return profile;
}