/**
 * Global Type Definitions
 * 
 * This file contains application-wide TypeScript type definitions that extend:
 * - Prisma models for enhanced type safety
 * - Next.js API types for Socket.IO integration
 * - Network types for WebSocket functionality
 */

import { Server as NetServer, Socket } from "net";
import { NextApiRequest, NextApiResponse } from "next";
import { Member, Profile, Server } from "@prisma/client"
import { Server as SocketIOServer } from "socket.io"

/**
 * Extended Server type that includes member relationships with their profiles
 * Used for server listings that need to display member information
 * 
 * Combines:
 * - Server: Base server data (name, imageUrl, etc.)
 * - members: Array of server members with their profile information
 */
export type ServerWithmembersWithProfiles = Server & {
    members: (Member & { profile: Profile })[];
}

/**
 * Extended Next.js API Response type with Socket.IO integration
 * Enables WebSocket functionality in API routes for real-time features
 * 
 * This type enhances the standard NextApiResponse with:
 * - socket: Network socket with server reference
 * - server.io: Socket.IO server instance for broadcasting events
 */
export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
}