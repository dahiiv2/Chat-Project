import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

// Returns the current profile through clerk auth
export const currentProfile = async () => {
    //Since it's an asyncronous function, we await
    const { userId } = await auth();

    //If there's no user, we return null
    if (!userId) {
        return null;
    }

    // Find the user's profile
    const profile = await db.profile.findUnique({
        where: {
            userId
        }
    });

    //We return the profile
    return profile;
}