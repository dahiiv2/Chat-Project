/**
 * Individual Message API Route
 * 
 * Handles operations on specific messages:
 * - Updates message content (PATCH)
 * - Soft-deletes messages (DELETE)
 * - Enforces permission checks based on user roles
 * - Broadcasts changes via Socket.IO in real-time
 */
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

/**
 * API handler for updating or deleting individual messages
 * Implements role-based permissions and real-time updates
 * 
 * @param req - Next.js API request with message ID and update data
 * @param res - Extended Next.js API response with Socket.IO server
 * @returns The updated message object or error response
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    // Only allow PATCH (update) and DELETE methods
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Get the authenticated user's profile
        const profile = await currentProfilePages(req);
        // Extract IDs from URL parameters
        const { messageId, serverId, channelId } = req.query;
        // Extract updated content from request body (for PATCH)
        const { content } = req.body;

        // Ensure user is authenticated
        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Validate required parameters
        if (!serverId) {
            return res.status(400).json({ error: "Server ID missing" });
        }

        if (!channelId) {
            return res.status(400).json({ error: "Channel ID missing" });
        }

        // Find the server and verify the user is a member
        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id // Ensure user is a member of this server
                    }
                }
            },
            include: {
                members: true // Include members for role verification
            }
        });

        // Return error if server not found or user is not a member
        if (!server) {
            return res.status(404).json({ error: "Server not found" });
        }

        // Verify the channel exists and belongs to the specified server
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string, // Ensure channel belongs to the correct server
            },
        });

        // Return error if channel not found
        if (!channel) {
            return res.status(404).json({ error: "Channel not found" });
        }

        // Find the member record for the current user in this server
        const member = server.members.find(
            (member) => member.profileId === profile.id
        );

        // Double-check member exists
        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        // Find the target message with related member and profile data
        let message = await db.message.findFirst({
            where: {
                id: messageId as string,
                channelId: channelId as string, // Ensure message is in the specified channel
            },
            include: {
                member: {
                    include: {
                        profile: true // Include profile for complete user info
                    }
                }
            }
        });

        // Return error if message not found or already deleted
        if (!message || message.deleted) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Determine user permissions for this message
        const isMessageOwner = message.member.id === member.id; // User owns the message
        const isAdmin = member.role === MemberRole.ADMIN;        // User is server admin
        const isModerator = member.role === MemberRole.MODERATOR; // User is server moderator
        const canModifyMessage = isAdmin || isModerator || isMessageOwner;
        
        // Enforce permission check for any modification
        if (!canModifyMessage) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        // Handle message deletion (soft delete)
        if (req.method === "DELETE") {
            // Update message to mark as deleted
            message = await db.message.update({
                where: {
                    id: messageId as string,
                },
                data: {
                    fileUrl: null,                           // Remove file attachment
                    content: "This message has been deleted", // Replace with deletion notice
                    deleted: true,                           // Mark as deleted
                },
                include: {
                    member: {
                        include: {
                            profile: true // Include profile data in response
                        }
                    }
                }
            });
        }

        // Handle message content updates
        if (req.method === "PATCH") {
            // Only message owners can edit message content
            // Admins/moderators can delete but not edit others' messages
            if (!isMessageOwner) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            
            // Update message content
            message = await db.message.update({
                where: {
                    id: messageId as string,
                },
                data: {
                    content, // Update with new content from request
                },
                include: {
                    member: {
                        include: {
                            profile: true // Include profile data in response
                        }
                    }
                }
            });
        }

        // Create Socket.IO event channel key for message updates
        const UPDATE_KEY = `chat:${channelId}:messages:update`;
        
        // Broadcast the updated message to all connected clients
        res?.socket?.server?.io?.emit(UPDATE_KEY, {
            message
        });

        // Return the updated message to the requester
        return res.status(200).json(message);
        

    } catch (error) {
        // Log errors for debugging while preserving user privacy
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}