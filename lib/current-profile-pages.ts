/**
 * Current User Profile Module (Pages Router)
 * 
 * Provides authentication-based access to the current user's profile for API routes:
 * - Uses Clerk's getAuth for Pages Router API routes
 * - Retrieves the linked user profile from the database
 * - Compatible with Next.js Pages Router and API Routes
 * - Serves as the authentication method for API endpoints
 */
import { getAuth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { NextApiRequest } from "next";

/**
 * Retrieves the current authenticated user's profile from the database
 * for API routes using the Pages Router
 * 
 * This function is used in API routes to:
 * - Authenticate incoming requests
 * - Access the current user's profile data
 * - Check permissions before processing requests
 * 
 * @param req - The Next.js API request object
 * @returns The user's profile object from the database, or null if not authenticated
 */
export const currentProfilePages = async (req: NextApiRequest) => {
    // Get the authenticated user ID from the request using Clerk
    const { userId } = getAuth(req);

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

    // Return the complete profile object
    return profile;
}