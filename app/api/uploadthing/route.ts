/**
 * UploadThing API Routes
 * 
 * This file creates the necessary API routes for file uploading functionality
 * using UploadThing. It handles both GET and POST requests that UploadThing
 * client components need to communicate with the UploadThing service.
 * 
 * Environment Requirements:
 * - UPLOADTHING_SECRET: For server-side API authentication
 * - UPLOADTHING_APP_ID: For identifying your application with the service
 * 
 * This works with Next.js 15 App Router to expose endpoints at:
 * - GET /api/uploadthing - For presigned URL generation and configuration
 * - POST /api/uploadthing - For handling upload callbacks and metadata
 */

// UploadThing route handler creator for Next.js
import { createRouteHandler } from "uploadthing/next";

// Import our custom file router from core.ts that defines upload configurations
import { ourFileRouter } from "./core";

// Export routes for Next App Router
// This creates GET and POST handlers needed by the UploadThing client
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,  // Use the router we defined in core.ts
});
