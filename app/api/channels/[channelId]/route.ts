/**
 * Channel ID API Route
 * 
 * This API endpoint handles channel-specific operations including:
 * - DELETE: Removing a channel from a server
 * - PATCH: Updating a channel's name or type
 * 
 * Both operations enforce permission checks to ensure only admins
 * and moderators can modify channels, and the "general" channel
 * is protected from modifications.
 */

import { NextResponse } from "next/server";
import { MemberRole, ChannelType } from "@prisma/client";

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

/**
 * DELETE /api/channels/[channelId]
 * 
 * Deletes a channel from a server if the user has appropriate permissions
 * Prevents deletion of the "general" channel
 * 
 * @param req Request with serverId in search params
 * @param params Contains route parameters including channelId
 * @returns The deleted channel object
 */
export async function DELETE(
    req: Request,
    { params }: any  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract query parameters
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify serverId was provided in query parameters
        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        // Verify channelId was provided in route parameters
        if (!params.channelId) {
            return new NextResponse("Channel ID missing", { status: 400 });
        }

        // Find the server and verify user has admin or moderator permissions
        // This checks both that the server exists AND that the current user
        // has the necessary permissions to delete a channel
        const server = await db.server.findFirst({
            where: {
                id: serverId,                  // Match server ID
                members: {
                    some: {
                        profileId: profile.id,  // Current user is a member
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]  // With appropriate role
                        }
                    }
                }
            },
            include: {
                members: true                  // Include member data
            }
        });

        // Return 404 if server not found or user doesn't have permissions
        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        // Find the specific channel being targeted for deletion
        const channel = await db.channel.findFirst({
            where: {
                id: params.channelId,         // Match channel ID from route
                serverId: serverId,           // Verify channel belongs to the correct server
            }
        });

        // Return 404 if channel not found
        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        // Prevent deletion of the special "general" channel
        // Every server must maintain its general channel
        if (channel.name === "general") {
            return new NextResponse("Cannot delete the general channel", { status: 403 });
        }

        // Delete the channel after all checks have passed
        const deletedChannel = await db.channel.delete({
            where: {
                id: params.channelId,        // Target specific channel
                serverId: serverId           // Additional safety check for server match
            }
        });

        // Return the deleted channel data
        return NextResponse.json(deletedChannel);
    } catch (error) {
        // Log error and return generic 500 response
        console.log("[CHANNEL_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * PATCH /api/channels/[channelId]
 * 
 * Updates a channel's name or type in a server
 * Requires admin or moderator permissions
 * Prevents modifications to the "general" channel
 * 
 * @param req Request with channel data in body and serverId in search params
 * @param params Contains route parameters including channelId
 * @returns The updated channel object
 */
export async function PATCH(
    req: Request,
    { params }: any  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract channel update data from request body
        const body = await req.json();
        const { name, type } = body;
        
        // Extract query parameters
        const { searchParams } = new URL(req.url);

        // Debug log for the update operation
        console.log("PATCH request data:", { body, name, type, channelId: params.channelId });

        const serverId = searchParams.get("serverId");

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify serverId was provided in query parameters
        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        // Verify channelId was provided in route parameters
        if (!params.channelId) {
            return new NextResponse("Channel ID is missing", { status: 400 });
        }

        // Prevent other channels from being renamed to "general"
        // This avoids confusion with the default general channel
        if (name === "general") {
            return new NextResponse("General channel name is not allowed", { status: 400 });
        }

        // Find the server and verify user has admin or moderator permissions
        // This checks both that the server exists AND that the current user
        // has the necessary permissions to update a channel
        const server = await db.server.findFirst({
            where: {
                id: serverId,                  // Match server ID
                members: {
                    some: {
                        profileId: profile.id,  // Current user is a member
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]  // With appropriate role
                        }
                    }
                }
            }
        });

        // Return 404 if server not found or user doesn't have permissions
        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        // Find the specific channel being targeted for update
        const channel = await db.channel.findFirst({
            where: {
                id: params.channelId,         // Match channel ID from route
                serverId: serverId,           // Verify channel belongs to the correct server
            }
        });

        // Return 404 if channel not found
        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        // Prevent modification of the special "general" channel
        if (channel.name === "general") {
            return new NextResponse("Cannot edit general channel", { status: 400 });
        }

        // Validate and sanitize the channel type
        // This ensures that only valid ChannelType enum values are used
        let channelType = type;
        if (!Object.values(ChannelType).includes(channelType)) {
            console.log("Invalid channel type received:", channelType);
            // Default to TEXT if invalid type received
            channelType = ChannelType.TEXT;
        }

        // Update the channel after all checks have passed
        const updatedChannel = await db.channel.update({
            where: {
                id: params.channelId,        // Target specific channel
                serverId: serverId,          // Additional safety check for server match
            },
            data: {
                name,                       // Update the channel name
                type: channelType,          // Update the channel type (text, audio, video)
            }
        });

        // Return the updated channel data
        return NextResponse.json(updatedChannel);
    } catch (error) {
        // Log error and return generic 500 response
        console.log("[CHANNEL_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}