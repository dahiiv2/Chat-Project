import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "@/types";
import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo
) {
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const profile = await currentProfilePages(req);
        const { directMessageId } = req.query;
        const { content } = req.body;

        if (!profile) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!directMessageId) {
            return res.status(400).json({ error: "Direct message ID missing" });
        }

        // First find the direct message by its ID
        const directMessage = await db.directMessage.findUnique({
            where: {
                id: directMessageId as string,
            },
            include: {
                conversation: true,
                member: {
                    include: {
                        profile: true
                    }
                }
            }
        });
        
        if (!directMessage || directMessage.deleted) {
            return res.status(404).json({ error: "Direct message not found" });
        }
        
        // Now get the conversation using the conversation ID from the direct message
        const conversation = await db.conversation.findUnique({
            where: {
                id: directMessage.conversationId,
            },
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
        })

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Verify the current user is part of this conversation
        const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;

        if (!member) {
            return res.status(404).json({ error: "Member not found" });
        }

        const isMessageOwner = directMessage.member.id === member.id;
        const isAdmin = member.role === MemberRole.ADMIN;
        const isModerator = member.role === MemberRole.MODERATOR;
        const canModifyMessage = isAdmin || isModerator || isMessageOwner;
        
        if (!canModifyMessage) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        
        let updatedDirectMessage;

        if (req.method === "DELETE") {
            updatedDirectMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string,
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            });
        }

        if (req.method === "PATCH") {
            if (!isMessageOwner) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            updatedDirectMessage = await db.directMessage.update({
                where: {
                    id: directMessageId as string,
                },
                data: {
                    content,
                },
                include: {
                    member: {
                        include: {
                            profile: true
                        }
                    }
                }
            });
        }

        const UPDATE_KEY = `chat:${conversation.id}:messages:update`;
        res?.socket?.server?.io?.emit(UPDATE_KEY, {
            message: updatedDirectMessage
        });

        return res.status(200).json(updatedDirectMessage);
        

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}