import { currentProfile } from "@/lib/current-profile"; 
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const profile = await currentProfile();
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId) {
            return new NextResponse("Server ID is missing", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse("General channel name is not allowed", { status: 400 });
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
            }
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        const channel = await db.channel.create({
            data: {
                profileId: profile.id,
                name,
                type,
                serverId
            }
        });

        return NextResponse.json(channel);
    } catch (error) {
        console.log(error);    return new NextResponse("Internal Error", { status: 500 });
    }
}