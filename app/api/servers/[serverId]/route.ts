/**
 * Server ID API Route
 * 
 * This API endpoint handles server-specific operations including:
 * - PATCH: Updating a server's name and image
 * - DELETE: Removing an entire server and all its data
 * 
 * Both operations enforce ownership checks to ensure only the server owner
 * can modify or delete the server.
 */

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * PATCH /api/servers/[serverId]
 * 
 * Updates a server's details (name and image)
 * Only the server owner can perform this action
 * 
 * @param req Request with name and imageUrl in body
 * @param context Contains route parameters including serverId
 * @returns The updated server object
 */
export async function PATCH(
    req: Request,
    context: { params: any }  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract serverId from route parameters
        const { serverId } = context.params;
        
        // Extract server update data from request body
        const { name, imageUrl } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Update the server details
        // The where clause ensures only the server owner can update it
        // by checking that the profileId matches the current user's profile
        const server = await db.server.update({
            where: {
                id: serverId,             // Match the server ID from the route
                profileId: profile.id,    // Ensure current user is the server owner
            },
            data: {
                name,                     // Update server name
                imageUrl,                 // Update server image
            }
        });

        // Return the updated server data
        return NextResponse.json(server);
    } catch (error) {
        // Log error and return generic 500 response
        console.log("[SERVER_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}

/**
 * DELETE /api/servers/[serverId]
 * 
 * Permanently deletes a server and all associated data
 * (channels, messages, member relationships)
 * Only the server owner can perform this action
 * 
 * @param req Request object
 * @param context Contains route parameters including serverId
 * @returns The deleted server object
 */
export async function DELETE(
    req: Request,
    context: { params: any }  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract serverId from route parameters
        const { serverId } = context.params;

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Delete the server
        // The where clause ensures only the server owner can delete it
        // by checking that the profileId matches the current user's profile
        // This will cascade delete all related channels, messages, and members
        const server = await db.server.delete({
            where: {
                id: serverId,             // Match the server ID from the route
                profileId: profile.id,    // Ensure current user is the server owner
            },
        });

        // Return the deleted server data
        return NextResponse.json(server);
    } catch (error) {
        // Log error and return generic 500 response
        console.log("[SERVER_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}