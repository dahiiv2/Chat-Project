import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server"

import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db"
import { MemberRole } from "@prisma/client";

//POST
export async function POST(req: Request) {
    try {
        //Get name and image
        const { name, imageUrl } = await req.json();

        //Get user
        const profile = await currentProfile();


        //If there isn't a profile
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const server = await db.server.create({
            data: {
                profileId: profile.id,
                name,
                imageUrl,
                inviteCode: uuidv4(),
                channels: {
                    create: [
                       { name: "general", profileId: profile.id }
                    ]
                },
                members: {
                    create: [
                        { profileId: profile.id, role: MemberRole.ADMIN }
                    ]
                }
            }
        });

        return NextResponse.json(server);

    } catch (e) {
        console.log("[SERVERS_POST]", e)
        return new NextResponse("Internal Error", { status: 500 })
    }
}