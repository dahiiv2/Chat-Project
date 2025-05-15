/**
 * Direct Messages API Route
 * 
 * Handles creation of new direct messages between users:
 * - Validates user permissions and input data
 * - Creates direct message records in the database
 * - Broadcasts new messages via Socket.IO in real-time
 * - Supports both text content and file attachments
 */
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

/**
 * API handler for creating new direct messages between users
 * Uses Socket.IO to broadcast the message to relevant clients in real-time
 * 
 * @param req - Next.js API request with message content and conversation ID
 * @param res - Extended Next.js API response with Socket.IO server
 * @returns The created direct message object or error response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  // Only allow POST requests for message creation
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the authenticated user's profile
    const profile = await currentProfilePages(req);
    // Extract message content and optional file URL from request body
    const { content, fileUrl } = req.body;
    // Extract conversation ID from the query parameters
    const { conversationId } = req.query;

    // Ensure user is authenticated
    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required parameters
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content missing" });
    }

    // Find the conversation and verify the user is a participant
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              profileId: profile.id  // User is the first member of the conversation
            }
          },
          {
            memberTwo: {
              profileId: profile.id  // User is the second member of the conversation
            }
          }
        ]
      },
      // Include both conversation members with their profiles
      include: {
        memberOne: {
          include: {
            profile: true
          }
        },
        memberTwo: {
          include: {
            profile: true
          }
        }
      }
    });

    // Return error if conversation not found or user is not a participant
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Determine which member record corresponds to the current user
    const member = conversation?.memberOne.profileId === profile.id ? conversation.memberOne : conversation?.memberTwo;

    // Double-check member exists
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Create the direct message in the database
    const message = await db.directMessage.create({
      data: {
        content,                           // Message text content
        fileUrl,                           // Optional attachment URL
        conversationId: conversationId as string,  // Link to conversation
        memberId: member.id                // Link to the sender's member record
      },
      // Include related data for immediate use without additional queries
      include: {
        member: {
          include: {
            profile: true  // Include user profile for display info
          }
        }
      }
    });

    // Create Socket.IO event channel key for this specific conversation
    const channelKey = `chat:${conversationId}:messages`;

    // Broadcast the new message to all connected clients in this conversation
    res?.socket?.server?.io?.emit(channelKey, message);

    // Return the created message to the requester
    return res.status(200).json(message);

  } catch (error) {
    // Log errors for debugging while preserving user privacy
    console.log("[DIRECT_MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}