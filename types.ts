import { Member, Profile, Server } from "@prisma/client"

export type ServerWithmembersWithProfiles = Server & {
    members: (Member & { profile: Profile })[];
}