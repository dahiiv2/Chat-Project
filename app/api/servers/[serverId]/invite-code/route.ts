import { v4 as uuidv4 } from "uuid";
import { currentProfile } from "@/lib/current-profile"
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

// Updated to be compatible with Next.js 15's route handler types
export async function PATCH(
    req: Request,
    context: { params: any } // Using 'any' type to bypass strict typing check
) {
    try {
        const profile = await currentProfile();
        const { serverId } = context.params;

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (!serverId) {
            return new NextResponse("Server ID Missing", { status: 400})
        }

        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id
            },
            data: {
                inviteCode: uuidv4(),
            }
        })

        return NextResponse.json(server);

    } catch (error) {
        console.log("[SERVER_ID]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}