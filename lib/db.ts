import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
};

export const db = globalThis.prisma || new PrismaClient();

// Store the prisma instance globally in development to prevent exhausting 
// the database connection limit due to hot reloading
if (process.env.NODE_ENV !== "production") globalThis.prisma = db