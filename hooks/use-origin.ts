/**
 * useOrigin Hook
 *
 * Provides safe access to window.location.origin:
 * - Handles server-side rendering (SSR) environments
 * - Ensures origin is only accessed after component mount
 * - Returns empty string during SSR to prevent errors
 * - Used for generating absolute URLs in the application
 */
import { useEffect, useState } from "react";

/**
 * Custom hook that safely retrieves the current origin (protocol + hostname + port)
 * Works in both client and server environments
 * @returns The current origin URL string, or empty string if not available
 */
export const useOrigin = () => {
    // Track if the component has mounted on the client
    const [mounted, setMounted] = useState(false);

    // Set mounted state to true after initial render
    useEffect(() => {
        setMounted(true);
    }, [])

    // Get the origin safely, checking for window object existence first
    // Returns empty string if accessed during SSR
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin  : ""

    // Return empty string during SSR or before mount
    if (!mounted) {
        return "";
    }

    // Return the actual origin after component has mounted
    return origin
}