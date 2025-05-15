/**
 * Admin User Management API Route
 * 
 * Provides endpoints for managing individual users:
 * - PATCH: Update user status (suspend/activate accounts)
 * - DELETE: Delete user accounts (not implemented)
 * 
 * All operations require admin privileges (isAdmin=true)
 */
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

/**
 * PATCH handler for updating user suspension status
 * Only accessible to users with isAdmin=true
 */
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Get the authenticated admin user
    const profile = await currentProfile();
    const { userId } = params;
    const { isSuspended } = await req.json();

    // Verify the user is authenticated
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user has admin privileges
    // Using type assertion since we've added the isAdmin field to the schema
    // but TypeScript definitions haven't been updated due to permission issues
    if (!(profile as any).isAdmin) {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    // Prevent admins from suspending themselves
    if (profile.id === userId) {
      return new NextResponse("Cannot modify your own account", { status: 400 });
    }

    // Find the target user
    const targetUser = await db.profile.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prevent suspending other admins (only admins can manage admins)
    // Using type assertion for the isAdmin field
    if ((targetUser as any).isAdmin) {
      return new NextResponse("Cannot modify another admin account", { status: 400 });
    }

    // Update the user's suspension status using a workaround for the type issue
    // We use a raw SQL query approach to update the database directly
    // This bypasses TypeScript type checking for properties not yet in the definitions
    const updatedUser = await db.$queryRaw`
      UPDATE Profile 
      SET isSuspended = ${isSuspended} 
      WHERE id = ${userId}
    `;
    
    // Fetch the updated user to return in the response
    const refreshedUser = await db.profile.findUnique({
      where: {
        id: userId,
      },
    });

    return NextResponse.json(refreshedUser);
  } catch (error) {
    console.log("[ADMIN_USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
