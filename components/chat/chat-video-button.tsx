/**
 * ChatVideoButton Component
 * 
 * Provides a toggle button for initiating or ending video calls in channels
 * or direct message conversations. The component uses URL query parameters
 * to track the video call state, allowing users to join existing calls
 * when they navigate to a URL with the video parameter set.
 */
"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Video, VideoOff } from "lucide-react";
import { ActionTooltip } from "../action-tooltip";

/**
 * Renders a video call toggle button with appropriate icon and tooltip
 * based on the current video call state
 */
export const ChatVideoButton = () => {
    // Access Next.js navigation utilities
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    
    // Check if video call is active based on URL query parameter
    const isVideo = searchParams?.get("video");

    /**
     * Toggles the video call state by updating the URL query parameters
     * - If video is active: removes the video parameter to end the call
     * - If video is inactive: adds video=true parameter to start a call
     */
    const onClick = () => {
        // Build URL with updated query parameters
        const url = qs.stringifyUrl({
            url: pathname || "",
            query: {
                video: isVideo ? undefined : true, // Toggle video parameter
            }
        }, {
            skipNull: true, // Remove undefined parameters from URL
        });

        // Navigate to the new URL which reflects the video call state
        router.push(url);
    };

    // Dynamically choose icon based on current video state
    const Icon = isVideo ? VideoOff : Video;
    // Set appropriate tooltip label based on video state
    const tooltipLabel = isVideo ? "End video call" : "Start video call";
    
    return (
        <ActionTooltip side="bottom" label={tooltipLabel}>
            <button 
                onClick={onClick} 
                className="hover:opacity-75 transition mr-4"
                aria-label={tooltipLabel}
            >
                <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
            </button>       
        </ActionTooltip>
    );
}