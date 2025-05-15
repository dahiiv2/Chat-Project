/**
 * Admin User Messages API Route
 * 
 * Provides detailed message history for a specific user:
 * - Fetches both channel messages and direct messages
 * - Includes contextual information about message location
 * - Protected by admin authentication check
 */
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

/**
 * GET handler for retrieving all messages sent by a specific user
 * Only accessible to users with isAdmin=true
 */
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Get the authenticated admin user
    const profile = await currentProfile();
    const { userId } = params;

    // Verify the user is authenticated
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user has admin privileges
    // Using type assertion since we've added the isAdmin field to the schema
    // but TypeScript definitions haven't been updated due to permission issues
    if (!(profile as any).isAdmin) {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    // Find the target user's profile
    const targetProfile = await db.profile.findUnique({
      where: {
        id: userId,
      },
    });

    if (!targetProfile) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get all members associated with this profile
    const members = await db.member.findMany({
      where: {
        profileId: userId,
      },
      include: {
        server: true,
      },
    });

    const memberIds = members.map(member => member.id);

    // Fetch channel messages
    const channelMessages = await db.message.findMany({
      where: {
        memberId: {
          in: memberIds,
        },
      },
      include: {
        channel: {
          select: {
            name: true,
            server: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent messages for performance
    });

    // Fetch direct messages
    const directMessages = await db.directMessage.findMany({
      where: {
        memberId: {
          in: memberIds,
        },
      },
      include: {
        conversation: {
          include: {
            memberOne: {
              include: {
                profile: true,
              },
            },
            memberTwo: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent direct messages
    });

    // Format channel messages for the frontend
    const formattedChannelMessages = channelMessages.map(message => {
      return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        channelName: message.channel.name,
        serverName: message.channel.server.name,
        type: "channel",
      };
    });

    // Format direct messages for the frontend
    const formattedDirectMessages = directMessages.map(message => {
      // Determine the recipient name (the person they were talking to)
      const isRecipientMemberOne = message.conversation.memberOne.profileId !== userId;
      const recipientProfile = isRecipientMemberOne 
        ? message.conversation.memberOne.profile
        : message.conversation.memberTwo.profile;

      return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        recipientName: recipientProfile.name,
        type: "direct",
      };
    });

    // Combine and sort all messages by date
    const allMessages = [...formattedChannelMessages, ...formattedDirectMessages]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50); // Take only the 50 most recent messages overall

    return NextResponse.json(allMessages);
  } catch (error) {
    console.log("[ADMIN_USER_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
