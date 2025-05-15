/**
 * Upload API Route
 * 
 * This API endpoint handles file uploads using the UploadThing service.
 * It receives files via FormData, uploads them to UploadThing's storage,
 * and returns the URL of the uploaded file.
 */

// Authentication and response utilities
import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";

// UploadThing API for server-side file uploads
import { UTApi } from "uploadthing/server";

// Initialize UploadThing API instance
const utapi = new UTApi();

/**
 * POST /api/upload
 * 
 * Handles file uploads from authenticated users
 * 
 * @param req Request with file in FormData
 * @returns JSON response with the URL of the uploaded file
 */
export async function POST(req: Request) {
    try {
        // Get current authenticated user's profile
        const profile = await currentProfile();

        // Verify user is authenticated
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Extract file from the request's FormData
        const formData = await req.formData();
        const file = formData.get("file") as File;

        // Verify file was included in the request
        if (!file) {
            return new NextResponse("No file provided", { status: 400 });
        }

        // Upload the file to UploadThing
        // Returns an array of results, but we're only uploading one file
        const [result] = await utapi.uploadFiles([file]);
        
        // Verify upload was successful and data is available
        if (!result?.data) {
            return new NextResponse("Upload failed", { status: 500 });
        }

        // Return the URL of the uploaded file
        return NextResponse.json({ url: result.data.url });
    } catch (error) {
        // Log error and return generic 500 response
        console.error("[UPLOAD_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
