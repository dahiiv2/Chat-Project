/**
 * Channel Messages API Route
 * 
 * Handles creation of new messages in channels:
 * - Validates user permissions and input data
 * - Creates message records in the database
 * - Broadcasts new messages via Socket.IO in real-time
 * - Supports both text content and file attachments
 */
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";

/**
 * API handler for creating new channel messages
 * Uses Socket.IO to broadcast the message to all clients in real-time
 * 
 * @param req - Next.js API request with message content and channel/server IDs
 * @param res - Extended Next.js API response with Socket.IO server
 * @returns The created message object or error response
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
    // Extract server and channel IDs from the query parameters
    const { serverId, channelId } = req.query;

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

    if (!content) {
      return res.status(400).json({ error: "Content missing" });
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
        members: true // Include members for permission checks
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
      }
    });

    // Return error if channel not found
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Find the member record for the current user in this server
    const member = server.members.find(
      (member) => member.profileId === profile.id
    );

    // Double-check member exists (additional security layer)
    if (!member) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Create the message in the database
    const message = await db.message.create({
      data: {
        content,               // Message text content
        fileUrl,               // Optional attachment URL
        channelId: channelId as string,  // Link to channel
        memberId: member.id    // Link to the sender's member record
      },
      // Include related data for immediate use without additional queries
      include: {
        member: {
          include: {
            profile: true // Include user profile for display info
          }
        }
      }
    });

    // Create Socket.IO event channel key for this specific channel
    const channelKey = `chat:${channelId}:messages`;

    // Broadcast the new message to all connected clients in this channel
    res?.socket?.server?.io?.emit(channelKey, message);

    // Return the created message to the requester
    return res.status(200).json(message);

  } catch (error) {
    // Log errors for debugging while preserving user privacy
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}