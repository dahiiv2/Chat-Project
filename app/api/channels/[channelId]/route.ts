import { NextResponse } from "next/server";
import { MemberRole, ChannelType } from "@prisma/client";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: any
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        
        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID missing", { status: 400 });
        }

        const server = await db.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            },
            include: {
                members: true
            }
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        const channel = await db.channel.findFirst({
            where: {
                id: params.channelId,
                serverId: serverId,
            }
        });

        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        // Don't allow deletion of the general channel
        if (channel.name === "general") {
            return new NextResponse("Cannot delete the general channel", { status: 403 });
        }

        // Delete the channel
        const deletedChannel = await db.channel.delete({
            where: {
                id: params.channelId,
                serverId: serverId
            }
        });

        return NextResponse.json(deletedChannel);
    } catch (error) {
        console.log("[CHANNEL_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: any
) {
    try {
        const profile = await currentProfile();
        const body = await req.json();
        const { name, type } = body;
        const { searchParams } = new URL(req.url);

        console.log("PATCH request data:", { body, name, type, channelId: params.channelId });

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        if (!params.channelId) {
            return new NextResponse("Channel ID is missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("General channel name is not allowed", { status: 400 });
        }

        // Check if the user has permission to update channels in this server
        const server = await db.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR]
                        }
                    }
                }
            }
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        // Find the channel to make sure it's not "general"
        const channel = await db.channel.findFirst({
            where: {
                id: params.channelId,
                serverId: serverId,
            }
        });

        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        if (channel.name === "general") {
            return new NextResponse("Cannot edit general channel", { status: 400 });
        }

        // Make sure the type is a valid ChannelType
        let channelType = type;
        if (!Object.values(ChannelType).includes(channelType)) {
            console.log("Invalid channel type received:", channelType);
            // Default to TEXT if invalid type received
            channelType = ChannelType.TEXT;
        }

        // Update the channel directly
        const updatedChannel = await db.channel.update({
            where: {
                id: params.channelId,
                serverId: serverId,
            },
            data: {
                name,
                type: channelType,
            }
        });

        return NextResponse.json(updatedChannel);
    } catch (error) {
        console.log("[CHANNEL_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}