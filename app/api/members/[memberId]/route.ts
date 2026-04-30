/**
 * Member ID API Route
 * 
 * This API endpoint handles server member operations including:
 * - DELETE: Removing a member from a server (kick)
 * - PATCH: Updating a member's role (promote/demote)
 * 
 * Both operations enforce permission checks to ensure only the server owner
 * can perform these actions, and prevent self-modification.
 */

// Authentication and database utilities
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * DELETE /api/members/[memberId]
 * 
 * Removes a member from a server (kick functionality)
 * Only the server owner can perform this action
 * Server owners cannot kick themselves
 * 
 * @param req Request with serverId in search params
 * @param params Contains route parameters including memberId
 * @returns The updated server object with members list
 */
export async function DELETE(
    req: Request,
    context: { params: any }  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // get the current user's profile
        const profile = await currentProfile();

        // Await params before accessing properties (required in Next.js 15+)
        const params = await context.params;

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
        // Delete the member (kick from server)
        // The where clause ensures only the server owner can perform this operation
        // The nested conditions in deleteMany ensure the owner can't kick themselves
        const server = await db.server.update({
            where: {
                id: serverId,                 // Match the server ID
                profileId: profile.id,        // Ensure current user is the server owner
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,      // Target the specific member
                        profileId: {
                            not: profile.id        // Prevent owner from removing themselves
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true           // Include member profile data
                    },
                    orderBy: {
                        role: "asc"             // Sort members by role
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

/**
 * PATCH /api/members/[memberId]
 * 
 * Updates a member's role in the server (promote/demote)
 * Only the server owner can perform this action
 * Server owners cannot modify their own role
 * 
 * @param req Request with role in body and serverId in search params
 * @param params Contains route parameters including memberId
 * @returns The updated server object with members list
 */
export async function PATCH(
    req: Request,
    context: { params: any }  // Using 'any' type to bypass strict typing in Next.js 15
) {
    try {
        // get the current user's profile
        const profile = await currentProfile();

        // Await params before accessing properties (required in Next.js 15+)
        const params = await context.params;

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
        // Update the member's role (promote/demote)
        // The where clause ensures only the server owner can perform this operation
        // The nested conditions in update.where ensure owners can't modify their own role
        const server = await db.server.update({
            where: {
                id: serverId,                 // Match the server ID
                profileId: profile.id,        // Ensure current user is the server owner
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: params.memberId,    // Target the specific member
                            profileId: {
                                not: profile.id      // Prevent owner from changing their own role
                            }
                        },
                        data: {
                            role,                   // Update to the new role value
                        }
                    }
                }
            },
            include: {
                members: {
                    include: {
                        profile: true             // Include member profile data
                    },
                    orderBy: {
                       role: "asc"               // Sort members by role
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