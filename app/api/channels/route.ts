/**
 * Channels API Route
 * 
 * This API endpoint handles the creation of new channels within a server.
 * It enforces permissions (only admins and moderators can create channels)
 * and validates channel names (prevents duplicate "general" channels).
 */

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile"; 
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

import { NextResponse } from "next/server";

/**
 * POST /api/channels
 * 
 * Creates a new channel in a server if the user has appropriate permissions
 * 
 * @param req Request containing channel name, type, and serverId
 * @returns The newly created channel or error response
 */
export async function POST(req: Request) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract channel details from request body
        const { name, type } = await req.json();
        
        // Get serverId from query parameters
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify serverId was provided
        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        // Prevent creation of additional "general" channels
        // The general channel is automatically created when a server is created
        if (name === "general") {
            return new NextResponse("General channel name is not allowed", { status: 400 });
        }

        // Find the server and verify the user has admin or moderator permissions
        // This checks that the server exists AND that the current user is an admin or moderator
        const server = await db.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]  // Only admins and moderators can create channels
                        }
                    }
                }
            }
        });

        // Return 404 if server not found or user doesn't have permissions
        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        // Create new channel with the provided details
        const channel = await db.channel.create({
            data: {
                profileId: profile.id,  // Track who created the channel
                name,                   // Channel name from request
                type,                   // Channel type (TEXT, AUDIO, VIDEO) from request
                serverId                // Server ID from query params
            }
        });

        // Return the created channel as JSON
        return NextResponse.json(channel);
    } catch (error) {
        // Log error and return generic 500 response
        console.log("[CHANNELS_POST]", error);    
        return new NextResponse("Internal Error", { status: 500 });
    }
}