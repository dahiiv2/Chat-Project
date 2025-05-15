/**
 * Direct Messages API Route
 * 
 * This API endpoint handles fetching direct messages between users.
 * It implements pagination using a cursor-based approach to efficiently
 * load batches of messages for conversations.
 */

import { NextResponse } from "next/server";

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { DirectMessage } from "@prisma/client";

// Number of messages to fetch in each request for pagination
const MESSAGES_BATCH = 30;

/**
 * GET /api/direct-messages
 * 
 * Fetches paginated direct messages for a specific conversation
 * 
 * @param req Request with cursor and conversationId in search params
 * @returns Paginated list of messages with next cursor for infinite loading
 */
export async function GET(req: Request) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();
        
        // Extract query parameters
        const { searchParams } = new URL(req.url);

        // Get pagination cursor and conversation ID
        const cursor = searchParams.get("cursor");
        const conversationId = searchParams.get("conversationId");

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Verify conversationId was provided
        if (!conversationId) {
            return new NextResponse("Conversation ID is missing", { status: 400 });
        }

        // Array to store fetched messages
        let messages: DirectMessage[] = [];

        // If cursor is provided, fetch messages after the cursor
        // This is used for loading older messages during pagination
        if (cursor) {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,         // Number of messages to fetch
                skip: 1,                      // Skip the cursor message itself
                cursor: { id: cursor },       // Start from this message ID
                where: {
                    conversationId,            // Only messages from this conversation
                },
                include: {
                    member: {                 // Include the sender's information
                        include: {
                            profile: true,     // Include the profile data (name, image)
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",         // Newest messages first
                },
            });
        }

        // If no cursor is provided, fetch the most recent messages
        // This is the initial load of the conversation
        if (!cursor) {
            messages = await db.directMessage.findMany({
                take: MESSAGES_BATCH,         // Number of messages to fetch
                where: {
                    conversationId,            // Only messages from this conversation
                },
                include: {
                    member: {                 // Include the sender's information
                        include: {
                            profile: true,     // Include the profile data (name, image)
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",         // Newest messages first
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
           items: messages,           // Array of message objects with sender info
           nextCursor                // Cursor for the next batch, or null if at the end
        });
    } catch (error) {
        // Log error and return generic 500 response
        console.error("[DIRECT_MESSAGES_GET_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}