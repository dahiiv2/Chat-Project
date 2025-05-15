/**
 * UploadThing Integration Module
 * 
 * Configures and exports file upload components:
 * - Implements UploadThing for secure, managed file uploads
 * - Provides typesafe upload components tied to backend configuration
 * - Requires both UPLOADTHING_SECRET and UPLOADTHING_TOKEN environment variables
 * - Supports various upload endpoints defined in the file router
 */
import {
    generateUploadButton,
    generateUploadDropzone,
  } from "@uploadthing/react";
  
  import type { OurFileRouter } from "@/app/api/uploadthing/core";
  
  /**
   * Typesafe upload button component
   * Generated with the application's file router configuration
   * Used for simple button-triggered file uploads
   */
  export const UploadButton = generateUploadButton<OurFileRouter>();

  /**
   * Typesafe upload dropzone component
   * Generated with the application's file router configuration
   * Used for drag-and-drop file upload experiences
   */
  export const UploadDropzone = generateUploadDropzone<OurFileRouter>();