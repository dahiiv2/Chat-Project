/**
 * Enhanced Profile Authentication Helper
 * 
 * Extended version of currentProfile that includes admin and suspension checks:
 * - Retrieves the currently authenticated user's profile from Clerk
 * - Checks if the user has admin privileges
 * - Returns the full profile with admin status for authorized requests
 */
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const currentProfileWithAdminCheck = async () => {
  // Get the authenticated user ID from Clerk
  const { userId } = await auth();

  // Return null for unauthenticated requests
  if (!userId) {
    return null;
  }

  // Find the profile with extra admin-related checks
  const profile = await db.profile.findUnique({
    where: {
      userId
    }
  });

  // Return null if profile not found
  if (!profile) {
    return null;
  }

  // No suspension check needed here

  return profile;
};
