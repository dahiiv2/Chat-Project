/**
 * MediaRoom Component
 *
 * Provides real-time audio/video conferencing functionality:
 * - Integrates with LiveKit for WebRTC communication
 * - Supports both audio and video channels
 * - Handles token generation and authentication
 * - Displays loading state while connecting
 */
"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { Channel } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";


/**
 * Props for the MediaRoom component
 * @property chatId - Unique identifier for the chat/channel (used as LiveKit room identifier)
 * @property video - Whether video functionality is enabled for this room
 * @property audio - Whether audio functionality is enabled for this room
 */
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
    // Get current user information from Clerk
    const { user } = useUser();
    // Store LiveKit authentication token
    const [token, setToken] = useState("");

    // Fetch LiveKit token when component mounts or dependencies change
    useEffect(() => {
        if (!user) return;

        // Determine display name from user profile information
        const displayName = user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

        // Immediately invoked async function to fetch token
        (async () => {
            try {
                // Request token from API with room and username parameters
                const resp = await fetch(`/api/livekit?room=${chatId}&username=${displayName}`);
                const data = await resp.json();
                setToken(data.token);
                console.log("Token received:", !!data.token); // Debug log
            } catch (e) {
                console.error("Error fetching token:", e);
            }
        })()
        
    }, [user?.firstName, user?.lastName, chatId]); // Re-run when user or chatId changes

    // Display loading indicator while waiting for token
    if (token === "") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7animate-spin my-4" />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )
    }

    // Render LiveKit room with video conference interface
    return (
        <LiveKitRoom
            data-lk-theme="default" // Use default LiveKit theme
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} // Connect to configured LiveKit server
            token={token} // Authenticate with generated token
            video={video} // Enable/disable video based on prop
            audio={audio} // Enable/disable audio based on prop
        >
            {/* VideoConference component provides UI for participants, controls, etc. */}
            <VideoConference />
        </LiveKitRoom>
    )
}