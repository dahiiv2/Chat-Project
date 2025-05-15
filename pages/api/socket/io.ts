/**
 * Socket.IO Server Implementation
 * 
 * Establishes real-time WebSocket communication:
 * - Creates and attaches Socket.IO server to the Next.js server
 * - Ensures only one Socket.IO instance exists per server
 * - Handles WebSocket connections for real-time messaging
 * - Enables event-based communication throughout the application
 */
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

import { NextApiResponseServerIo } from "@/types";

/**
 * API route configuration
 * Disables body parsing since WebSocket connections don't require it
 * This improves performance for Socket.IO connections
 */
export const config = {
    api: {
        bodyParser: false,
    }
}

/**
 * Socket.IO server handler
 * Initializes the Socket.IO server if it doesn't exist yet
 * 
 * @param req - Next.js API request
 * @param res - Extended Next.js API response with Socket.IO server
 */
const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    // Check if Socket.IO server is already initialized
    if (!res.socket.server.io) {
        // Define the WebSocket endpoint path
        const path = "/api/socket/io";
        // Get the underlying HTTP server
        const httpServer = res.socket.server as any;
        // Create new Socket.IO server attached to the HTTP server
        const io = new ServerIO(httpServer, {
            path,
            addTrailingSlash: false, // Conform to Next.js routing
        });
        
        // Save the Socket.IO server instance for reuse
        res.socket.server.io = io;
    }
    
    // End the API request since WebSocket connection is established
    res.end();
}

/**
 * Export the Socket.IO handler as the default API route handler
 * This enables WebSocket connections at /api/socket/io
 */
export default ioHandler;