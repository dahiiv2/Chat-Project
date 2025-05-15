/**
 * Servers API Route
 * 
 * This API endpoint handles server creation operations.
 * It creates a new server with:
 * - Basic server details (name, image)
 * - A unique invite code for member invitations
 * - Initial "general" channel
 * - Creator as the admin
 */

// UUID for generating unique invite codes
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server"

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client";

/**
 * POST /api/servers
 * 
 * Creates a new server for the authenticated user
 * 
 * @param req Request containing server name and image URL
 * @returns The newly created server object or error response
 */
export async function POST(req: Request) {
    try {
        // Extract server details from request body
        const { name, imageUrl } = await req.json();

        // Get current authenticated user's profile
        const profile = await currentProfile();

        // Return unauthorized if no valid user
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Create the server with related entities in a single transaction
        const server = await db.server.create({
            data: {
                profileId: profile.id,     // Set server owner
                name,                      // Server name from request
                imageUrl,                  // Server image from request
                inviteCode: uuidv4(),      // Generate unique invite code
                channels: {
                    create: [
                       { name: "general", profileId: profile.id }  // Create default general channel
                    ]
                },
                members: {
                    create: [
                        { profileId: profile.id, role: MemberRole.ADMIN }  // Add creator as admin
                    ]
                }
            }
        });

        // Return the created server as JSON
        return NextResponse.json(server);

    } catch (e) {
        // Log error and return generic 500 response
        console.log("[SERVERS_POST]", e)
        return new NextResponse("Internal Error", { status: 500 })
    }
}