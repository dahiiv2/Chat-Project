"use client";

import { useSocket } from "@/components/providers/socket-provider";
import { Badge } from "./ui/badge";

export const SocketIndicator = () => {
    const { isConnected } = useSocket();

    if (!isConnected) {
        return (
            <Badge variant="outline" className="bg-amber-500 text-white">
                Offline
            </Badge>
        );
    }

    return (
        <Badge variant="default" className="bg-green-500 text-white">
            Online
        </Badge>
    );
};