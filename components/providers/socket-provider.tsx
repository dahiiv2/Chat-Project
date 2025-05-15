/**
 * SocketProvider Component
 * 
 * Client-side component that provides real-time socket functionality to the application:
 * - Establishes and manages WebSocket connections using Socket.IO
 * - Exposes connection status and socket instance via context
 * - Handles socket lifecycle (connect, disconnect, cleanup)
 * - Provides a custom hook for components to access socket functionality
 */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

/**
 * Type definition for the socket context value
 * @property socket - The Socket.IO client instance or null if not connected
 * @property isConnected - Boolean indicating if the socket is currently connected
 */
type SocketContextType = {
    socket: any | null;
    isConnected: boolean;
}

// Create context with default values
const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

/**
 * Custom hook that provides access to the socket context
 * @returns SocketContextType containing socket instance and connection status
 */
export const useSocket = () => {
    return useContext(SocketContext);
};

/**
 * Provider component that makes socket instance available to any child component
 * @param children - Child components that will have access to socket functionality
 */
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    // Track socket instance state
    const [socket, setSocket] = useState(null);
    // Track connection status state
    const [isConnected, setIsConnected] = useState(false);

    // Initialize socket connection when component mounts
    useEffect(() => {
        // Create a new Socket.IO client instance
        const socketInstance = new (ClientIO as any)(process.env.NEXT_PUBLIC_API_URL!, {
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        // Set up connect event handler
        socketInstance.on("connect", () => {
            setIsConnected(true);
        });

        // Set up disconnect event handler
        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        // Store socket instance in state
        setSocket(socketInstance);

        // Cleanup: disconnect socket when component unmounts
        return () => {
            socketInstance.disconnect();
        }
    }, []);

    // Provide socket context to children components
    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
