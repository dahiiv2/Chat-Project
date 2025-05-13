"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Channel } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";


interface MediaRoomProps {
    chatId: string;
    video: boolean;
    audio: boolean;
};

export const MediaRoom = ({
    chatId,
    video,
    audio
}: MediaRoomProps) => {
    const { user } = useUser();
    const [token, setToken] = useState("");

    useEffect(() => {
        if (!user?.firstName || !user?.lastName) return;

        const name = `${user.firstName} ${user.lastName}`;

        (async () => {
            try {
                // Using the updated API endpoint path that matches our Pages Router implementation
                const resp = await fetch(`/api/livekit?room=${chatId}&username=${name}`);
                const data = await resp.json();
                setToken(data.token);
                console.log("Token received:", !!data.token); // Debug log
            } catch (e) {
                console.error("Error fetching token:", e);
            }
        })()
        
    }, [user?.firstName, user?.lastName, chatId]);

    if (token === "") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7animate-spin my-4" />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )
    }

    return (
        <LiveKitRoom
            data-lk-theme="default"
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            token={token}
            video={video}
            audio={audio}
        >
            <VideoConference />
        </LiveKitRoom>
    )
}