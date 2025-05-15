/**
 * Conversation Management Module
 * 
 * Provides utilities for direct message conversations:
 * - Handles finding or creating conversations between two members
 * - Ensures unique conversations between any pair of members
 * - Includes helper functions for database operations
 * - Used for the direct messaging system
 */
import { db } from "@/lib/db";

/**
 * Finds or creates a direct message conversation between two members
 * 
 * This function ensures that only one conversation exists between any two members by:
 * - Checking for an existing conversation in both directions
 * - Creating a new conversation only if none exists
 * - Including profile data for both members
 * 
 * @param memberOneId - ID of the first member in the conversation
 * @param memberTwoId - ID of the second member in the conversation
 * @returns The conversation object with both member profiles included
 */
export const getOrCreateConversation = async (memberOneId: string, memberTwoId: string) => {
    // Try to find an existing conversation between the members (in either direction)
    let conversation = await findConversation(memberOneId, memberTwoId) || await findConversation(memberTwoId, memberOneId);

    // Create a new conversation if none exists
    if (!conversation) {
        conversation = await createNewConversation(memberOneId, memberTwoId);
    }
    return conversation;
};

/**
 * Helper function to find an existing conversation between two members
 * 
 * @param memberOneId - ID of the first member to check
 * @param memberTwoId - ID of the second member to check
 * @returns The conversation if found, or null if not found or on error
 * @private - Internal helper function
 */
const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        // Query for a conversation with the exact member order
        return await db.conversation.findFirst({
            where: {
                AND: [
                    { memberOneId: memberOneId },
                    { memberTwoId: memberTwoId }
            ]
        },
        // Include related member and profile data for complete information
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
    } catch (error) {
        // Return null on any database errors
        return null;
    }
};

/**
 * Helper function to create a new conversation between two members
 * 
 * @param memberOneId - ID of the first member in the conversation
 * @param memberTwoId - ID of the second member in the conversation
 * @returns The newly created conversation with member profiles, or null on error
 * @private - Internal helper function
 */
const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        // Create a new conversation with the specified members
        return await db.conversation.create({
            data: {
                memberOneId,
                memberTwoId,
            },
            // Include related member and profile data in the response
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
    } catch (error) {
        // Return null on any database errors
        return null;
    }
};