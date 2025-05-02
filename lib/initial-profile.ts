import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db"

export const initialProfile = async () => {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: user.id
        }
    })

    if (profile) {
        return profile;
    }

    // Use the Clerk username field which appears on the dashboard
    const newProfile = await db.profile.create({
        data: {
            userId: user.id,
            // Directly access the username property - if not available fall back to name
            name: user.username || `${user.firstName} ${user.lastName}`,
            imageUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress
        }
    });

    return newProfile;
}