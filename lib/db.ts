/**
 * Database Client Module
 * 
 * Prisma client singleton implementation that:
 * - Prevents multiple database connections during development
 * - Implements best practices for Next.js environments
 * - Provides a consistent database interface throughout the application
 * - Handles hot reloading concerns in development mode
 */
import { PrismaClient } from "@prisma/client";

/**
 * Create a global type to store Prisma instance in the global scope
 * This prevents multiple connections during Next.js hot reloads
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Export a singleton Prisma client instance
 * Reuse existing instance if available or create a new one
 */
export const db = globalForPrisma.prisma || new PrismaClient();

/**
 * Store the instance in development to prevent multiple connections
 * During hot reloads in development, this ensures we reuse the same client
 */
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
