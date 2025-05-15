/**
 * Individual Direct Message API Route
 * 
 * Handles operations on specific direct messages:
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
 * API handler for updating or deleting individual direct messages
 * Implements role-based permissions and real-time updates
 * 
 * @param req - Next.js API request with message ID and update data
 * @param res - Extended Next.js API response with Socket.IO server
 * @returns The updated direct message object or error response
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
        // Extract direct message ID from URL parameters
        const { directMessageId } = req.query;
        // Extract updated content from request body (for PATCH)
        const { content } = req.body;

        // Ensure user is authenticated
        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Validate required parameters
        if (!directMessageId) {
            return res.status(400).json({ error: "Direct message ID missing" });
        }

        // Find the target direct message with related data
        const directMessage = await db.directMessage.findUnique({
            where: {
                id: directMessageId as string,
            },
            include: {
                conversation: true,           // Include conversation for access checks
                member: {
                    include: {
                        profile: true         // Include profile for user info
                    }
                }
            }
        });
        
        // Return error if message not found or already deleted
        if (!directMessage || directMessage.deleted) {
            return res.status(404).json({ error: "Direct message not found" });
        }
        
        // Get the full conversation details to verify user access rights
        const conversation = await db.conversation.findUnique({
            where: {
                id: directMessage.conversationId,
            },
            include: {
                memberOne: {
                    include: {
                        profile: true         // Include first member's profile
                    }
                },
                memberTwo: {
                    include: {
                        profile: true         // Include second member's profile
                    }
                }
            }
        })

        // Return error if conversation no longer exists
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Determine which member record corresponds to the current user
        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        // Ensure user is actually part of this conversation
        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        // Determine user permissions for this message
        const isMessageOwner = directMessage.member.id === member.id;  // User owns the message
        const isAdmin = member.role === MemberRole.ADMIN;             // User is server admin
        const isModerator = member.role === MemberRole.MODERATOR;     // User is server moderator
        const canModifyMessage = isAdmin || isModerator || isMessageOwner;
        
        // Enforce permission check for any modification
        if (!canModifyMessage) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        let updatedDirectMessage;

        // Handle message deletion (soft delete)
        if (req.method === "DELETE") {
            updatedDirectMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string,
                },
                data: {
                    fileUrl: null,                           // Remove file attachment
                    content: "This message has been deleted", // Replace with deletion notice
                    deleted: true,                           // Mark as deleted
                },
                include: {
                    member: {
                        include: {
                            profile: true                     // Include profile data in response
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
            updatedDirectMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string,
                },
                data: {
                    content,                               // Update with new content from request
                },
                include: {
                    member: {
                        include: {
                            profile: true                 // Include profile data in response
                        }
                    }
                }
            });
        }

        // Create Socket.IO event channel key for message updates in this conversation
        const UPDATE_KEY = `chat:${conversation.id}:messages:update`;
        
        // Broadcast the updated message to both participants in the conversation
        res?.socket?.server?.io?.emit(UPDATE_KEY, {
            message: updatedDirectMessage
        });

        // Return the updated message to the requester
        return res.status(200).json(updatedDirectMessage);
        

    } catch (error) {
        // Log errors for debugging while preserving user privacy
        console.log("[DIRECT_MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}