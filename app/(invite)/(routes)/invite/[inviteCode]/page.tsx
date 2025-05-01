import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Workaround for Next.js 15 typing issues - export a default function that gets params
export default async function InviteCodePage({ 
  params 
}: {
  params: any  // Use any type to bypass the strict typing check
}) {
    const profile = await currentProfile();
    const { inviteCode } = params;

    //Fetch profile
    if (!profile) {
        return <RedirectToSignIn />;
    }

    if (!inviteCode) {
        return redirect("/");
    }

    const existingServer = await db.server.findFirst({
        where: {
            inviteCode,
            members: {
                some: {
                    profileId: profile.id,
                }
            }
        }
    });

    if (existingServer) {
        return redirect(`/servers/${existingServer.id}`)
    }

    const server = await db.server.update({
        where: {
            inviteCode,
        },
        data: {
            members: {
                create: [
                    {
                        profileId: profile.id,
                    }
                ]
            }
        }
    });

    if (server) {
        return redirect(`/servers/${server.id}`)
    }

    return null;
}