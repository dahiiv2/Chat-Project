/**
 * Initial Profile Creation Module
 * 
 * Handles user profile initialization and creation:
 * - Checks for existing user profiles in the database
 * - Creates new profiles for first-time users
 * - Ensures all authenticated users have a profile record
 * - Used during the authentication flow for new users
 */
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db"

/**
 * Gets or creates a user profile for the authenticated user
 * 
 * This function handles the critical first-time user experience by:
 * - Redirecting unauthenticated users to sign in
 * - Finding existing profiles for returning users
 * - Creating new profiles for first-time users
 * - Syncing Clerk user data with the application's database
 * 
 * @returns The user's profile object from the database
 * @throws Redirects to sign-in page if no user is authenticated
 */
export const initialProfile = async () => {
    // Get the current authenticated user from Clerk
    const user = await currentUser();

    // Redirect to sign-in if no user is authenticated
    if (!user) {
        redirect("/sign-in");
    }

    // Check if the user already has a profile in the database
    const profile = await db.profile.findUnique({
        where: {
            userId: user.id
        }
    })

    // Return existing profile if found
    if (profile) {
        return profile;
    }

    // Create a new profile for first-time users
    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            // Use username if available, otherwise combine first and last name
            name: user.username || `${user.firstName} ${user.lastName}`,
            // Copy profile image from Clerk
            imageUrl: user.imageUrl,
            // Use primary email address
            email: user.emailAddresses[0].emailAddress
        }
    });

    // Return the newly created profile
    return newProfile;
}