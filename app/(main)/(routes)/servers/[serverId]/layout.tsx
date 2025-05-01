import { redirect } from "next/navigation";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

// Using the same workaround with 'any' type to bypass Next.js 15's strict typing
export default async function ServerIdLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: any // Use any type to bypass the strict typing check
}) {
    const profile = await currentProfile();
    const { serverId } = params;

    if (!profile) {
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    });

    if (!server) {
        return redirect("/");
    }

    return (
        <div className="h-full">
            <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
                <ServerSidebar serverId={serverId} />
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
    );
}