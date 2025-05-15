/**
 * SocketIndicator Component
 *
 * Displays the current WebSocket connection status:
 * - Shows online/offline state visually with colored badges
 * - Uses socket connection state from SocketProvider
 * - Provides immediate visual feedback about real-time functionality
 */
"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { Badge } from "./ui/badge";

/**
 * SocketIndicator displays the current WebSocket connection status
 * as a colored badge (green for online, amber for offline)
 */
export const SocketIndicator = () => {
    // Get connection status from socket context
    const { isConnected } = useSocket();

    // Show offline indicator when disconnected
    if (!isConnected) {
        return (
            <Badge variant="outline" className="bg-amber-500 text-white">
                Offline
            </Badge>
        );
    }

    // Show online indicator when connected
    return (
        <Badge variant="default" className="bg-green-500 text-white">
            Online
        </Badge>
    );
};