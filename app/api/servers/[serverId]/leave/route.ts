/**
 * Server Leave API Route
 * 
 * This API endpoint handles a user leaving a server they're a member of.
 * It removes the user's membership from the specified server while preventing
 * server owners from using this endpoint to leave their own servers.
 */

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * PATCH /api/servers/[serverId]/leave
 * 
 * Allows a user to leave a server they're a member of
 * Server owners cannot leave their own servers (they must delete or transfer ownership)
 * 
 * @param req Request object
 * @param params Contains route parameters including serverId
 * @returns The updated server object after the user has left
 */
export async function PATCH(
    req: Request,
    context: { params: any }  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();

        // Await params before accessing properties (required in Next.js 15+)
        const params = await context.params;

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Verify serverId was provided in the route
        if (!params.serverId) {
            return new NextResponse("Server ID Missing", { status: 400 })
        }

        // Update the server by removing the user's membership
        // The where clause has three important conditions:
        // 1. Match the server ID from the route parameters
        // 2. Ensure the current user is NOT the server owner (profileId not equal to current user)
        // 3. Verify the user is actually a member of this server
        const server = await db.server.update({
            where: {
                id: params.serverId,        // Match the server ID from the route
                profileId: {
                    not: profile.id,         // User must NOT be the server owner
                },
                members: {
                    some: {
                        profileId: profile.id, // User must be a member of the server
                    }
                }
            },
            data: {
                members: {
                    deleteMany: {
                        profileId: profile.id, // Remove the user's membership
                    }
                }
            }
        })

        // Return the updated server after the user has left
        return NextResponse.json(server);
    } catch (error) {
        // Log error and return generic 500 response
        console.log("[SERVER_ID_LEAVE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
