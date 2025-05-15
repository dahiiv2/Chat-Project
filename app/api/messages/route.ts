/**
 * Messages API Route
 * 
 * This API endpoint handles fetching channel messages with pagination.
 * It implements cursor-based pagination to efficiently load message batches
 * and supports infinite scrolling in the UI.
 */

import { NextResponse } from "next/server";

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { Message } from "@prisma/client";

// Number of messages to fetch in each request for pagination
const MESSAGES_BATCH = 30;

/**
 * GET /api/messages
 * 
 * Fetches paginated messages for a specific channel
 * 
 * @param req Request with cursor and channelId in search params
 * @returns Paginated list of messages with next cursor for infinite scrolling
 */
export async function GET(req: Request) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract query parameters
        const { searchParams } = new URL(req.url);

        // Get pagination cursor and channel ID
        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify channelId was provided
        if (!channelId) {
            return new NextResponse("Channel ID is missing", { status: 400 });
        }

        // Array to store fetched messages
        let messages: Message[] = [];

        // If cursor is provided, fetch messages after the cursor
        // This is used for loading older messages when scrolling up
        if (cursor) {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,         // Number of messages to fetch
                skip: 1,                      // Skip the cursor message itself
                cursor: { id: cursor },       // Start from this message ID
                where: {
                    channelId,                 // Only messages from this channel
                },
                include: {
                    member: {                  // Include the sender's information
                        include: {
                            profile: true,      // Include the profile data (name, image)
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",          // Newest messages first
                },
            });
        }

        // If no cursor is provided, fetch the most recent messages
        // This is the initial load of the channel
        if (!cursor) {
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,         // Number of messages to fetch
                where: {
                    channelId,                 // Only messages from this channel
                },
                include: {
                    member: {                  // Include the sender's information
                        include: {
                            profile: true,      // Include the profile data (name, image)
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",          // Newest messages first
                },
            });
        }

        // Determine if there are more messages to load
        let nextCursor = null;

        // If we got a full batch, there might be more messages
        // Set the cursor to the ID of the last message for the next request
        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }

        // Return the messages and next cursor for pagination
        return NextResponse.json({
           items: messages,          // Array of message objects with sender info
           nextCursor               // Cursor for the next batch, or null if at the end
        });
    } catch (error) {
        // Log error and return generic 500 response
        console.error("[MESSAGES_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}