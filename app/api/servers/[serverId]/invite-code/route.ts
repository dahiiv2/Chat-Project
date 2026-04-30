/**
 * Server Invite Code API Route
 * 
 * This API endpoint handles the regeneration of server invite codes.
 * It provides a way for server owners to revoke and refresh their server's
 * invite link by generating a new unique invite code.
 */

// UUID for generating unique invite codes
import { v4 as uuidv4 } from "uuid";

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

/**
 * PATCH /api/servers/[serverId]/invite-code
 * 
 * Generates a new invite code for a server
 * Only the server owner can perform this action
 * 
 * @param req Request object
 * @param context Contains route parameters including serverId
 * @returns Updated server object with new invite code
 */
// Updated to be compatible with Next.js 15's route handler types
export async function PATCH(
    req: Request,
    context: { params: any } // Using 'any' type to bypass strict typing check
) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();

        // Await params before accessing properties (required in Next.js 15+)
        const { serverId } = await context.params;

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Verify serverId was provided in the route
        if (!serverId) {
            return new NextResponse("Server ID Missing", { status: 400})
        }

        // Update the server with a new invite code
        // The where clause ensures only the server owner can update the invite code
        // by checking that the profileId matches the current user's profile
        const server = await db.server.update({
            where: {
                id: serverId,            // Match the server ID from the route
                profileId: profile.id    // Ensure the current user owns the server
            },
            data: {
                inviteCode: uuidv4(),    // Generate a new random UUID for the invite code
            }
        })

        // Return the updated server with the new invite code
        return NextResponse.json(server);

    } catch (error) {
        // Log error and return generic 500 response
        console.log("[SERVER_INVITE_CODE_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}