import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        // get the current user's profile
        const profile = await currentProfile();
        
        // extract the server id from the url query parameters
        const { searchParams } = new URL(req.url);
        
        const serverId = searchParams.get("serverId");

        // verify authentication
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // validate required parameters
        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 })
        }

        if (!params.memberId) {
            return new NextResponse("Member ID missing", { status: 400 })
        }

        // delete the member
        // important: we check profileId to ensure only server owner can delete members
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                        role: "asc"
                    }
                }
            }
        });

        return NextResponse.json(server);

    } catch (error) {
        console.log("[MEMBERS_ID_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: {
        memberId: string } }
) {
    try {
        // get the current user's profile
        const profile = await currentProfile();
        
        // extract the server id from the url query parameters
        const { searchParams } = new URL(req.url);
        
        // extract the new role from the request body
        const { role } = await req.json();

        const serverId = searchParams.get("serverId");

        // verify authentication
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // validate required parameters
        if (!serverId) {
            return new NextResponse("Server ID missing", { status: 400 })
        }

        if (!params.memberId) {
            return new NextResponse("Member ID missing", { status: 400 })
        }

        // update the member's role
        // important: we check profileId to ensure only server owner can update roles
        const server = await db.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: params.memberId,
                            profileId: {
                                not: profile.id
                            }
                        },
                        data: {
                            role,
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true
                    },
                    orderBy: {
                       role: "asc"
                    }
                }
            }
        });

        // return the updated server data
        return NextResponse.json(server);

    } catch (error) {
        // log any errors that occur during execution
        console.log("[MEMBERS_ID_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}