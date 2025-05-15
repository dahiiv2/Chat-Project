/**
 * Admin Users API Route
 * 
 * Provides global administration capabilities for user management:
 * - Lists all users with their profile data and activity statistics
 * - Restricted to users with the isAdmin flag set to true
 * - Aggregates message counts and server memberships
 */
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

/**
 * GET handler for retrieving all users with activity data
 * Only accessible to users with isAdmin=true
 */
export async function GET(req: Request) {
  try {
    // Verify the current user is authenticated
    const profile = await currentProfile();

    // Check if the user exists
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user has admin privileges
    // Using type assertion since we've added the isAdmin field to the schema
    // but TypeScript definitions haven't been updated due to permission issues
    if (!(profile as any).isAdmin) {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    // Fetch all user profiles
    const profiles = await db.profile.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // For each profile, fetch their message count and server count
    const profilesWithActivity = await Promise.all(
      profiles.map(async (profile) => {
        // Count total messages (both channel messages and direct messages)
        const members = await db.member.findMany({
          where: {
            profileId: profile.id,
          },
        });

        const memberIds = members.map((member) => member.id);

        // Count messages in channels
        const messageCount = await db.message.count({
          where: {
            memberId: {
              in: memberIds,
            },
          },
        });

        // Count direct messages
        const directMessageCount = await db.directMessage.count({
          where: {
            memberId: {
              in: memberIds,
            },
          },
        });

        // Count servers they own
        const serverCount = await db.server.count({
          where: {
            profileId: profile.id,
          },
        });

        // Return enhanced profile with activity data
        return {
          ...profile,
          messageCount: messageCount + directMessageCount,
          serverCount,
        };
      })
    );

    return NextResponse.json(profilesWithActivity);
  } catch (error) {
    console.log("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
