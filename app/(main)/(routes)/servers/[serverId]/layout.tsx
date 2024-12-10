import { redirect } from "next/navigation";
import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export default async function ServerIdLayout({
    children,
    params,
}: {
    children: React.ReactNode,
    params: Promise<{ serverId: string }>
}) {
    const resolvedParams = await params;
    const profile = await currentProfile();

    if (!profile) {
        return redirect("/");
    }

    const server = await db.server.findUnique({
        where: {
            id: resolvedParams.serverId,
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
                <ServerSidebar serverId={resolvedParams.serverId}/>
            </div>
            <main className="h-full md:pl-60">
                {children}
            </main>
        </div>
     );
}