/**
 * UploadThing Core Configuration
 * 
 * This file defines the file upload routes and configurations using UploadThing.
 * It specifies what file types are allowed, size limits, and authentication
 * requirements for different upload scenarios in the application.
 */

// Authentication utilities
import { auth } from "@clerk/nextjs/server";

// UploadThing configuration utilities
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

// Initialize the UploadThing factory
const f = createUploadthing();

/**
 * Authentication middleware for file uploads
 * 
 * Verifies that the user is authenticated before allowing uploads.
 * This is used as middleware for all upload routes.
 * 
 * @returns Object containing the authenticated user's ID
 * @throws UploadThingError if user is not authenticated
 */
const handleAuth = async () => {
  // Get the current user's ID from Clerk authentication
  const { userId } = await auth();
  
  // If no user ID, throw an authentication error
  if (!userId) {
    throw new UploadThingError("Unauthorized");
  }
  
  // Return the user ID to be used in the upload context
  return { userId: userId };
};

/**
 * File upload route configuration
 * 
 * Defines the available file upload routes and their configurations:
 * - serverImage: For server profile images with size and count limits
 * - messageFile: For attachments in messages supporting images and PDFs
 */
export const ourFileRouter = {
  // Server profile image upload route
  // Restricted to a single image file up to 4MB
  serverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(() => handleAuth())     // Apply authentication check
    .onUploadComplete(() => {}),        // No additional actions needed after upload

  // Message attachment upload route
  // Supports both images and PDF files
  messageFile: f(["image", "pdf"])
    .middleware(() => handleAuth())     // Apply authentication check
    .onUploadComplete(() => {}),        // No additional actions needed after upload
} satisfies FileRouter;

// Export the type of our file router for type safety in client components
export type OurFileRouter = typeof ourFileRouter;
