/**
 * useChatScroll Hook
 *
 * Manages chat scroll behavior with advanced functionality:
 * - Handles automatic scrolling to bottom for new messages
 * - Implements infinite scroll loading for message history
 * - Tracks scroll position to maintain proper view context
 * - Optimizes user experience in chat interface
 */
import { useEffect, useState } from "react";

/**
 * Props for the useChatScroll hook
 * @property chatRef - Reference to the main chat container element
 * @property bottomRef - Reference to the element at the bottom of the chat
 * @property shouldLoadMore - Flag indicating if more messages are available to load
 * @property loadMore - Function to trigger loading more messages
 * @property count - Number of current messages (used to detect changes)
 */
type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement | null>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    shouldLoadMore: boolean;
    loadMore: () => void;   
    count: number;
}

/**
 * Custom hook that manages scroll behavior in chat interfaces
 * Handles both automatic scrolling and infinite scroll loading
 */
export const useChatScroll = ({ chatRef, bottomRef, shouldLoadMore, loadMore, count }: ChatScrollProps) => {
    // Track if the first scroll to bottom has occurred
    const [hasInitialized, setHasInitialized] = useState(false);
    // Track if the user is currently at the bottom of the chat
    const [isAtBottom, setIsAtBottom] = useState(false);

    /**
     * Effect for handling upward scrolling to load more messages
     * Triggers loadMore when user scrolls to top of container
     */
    useEffect(() => {
        const topDiv = chatRef?.current;

        const handleScroll = () => {
            const scrollTop = topDiv?.scrollTop;

            // When scrolled to top (or near top) and more messages exist
            if (scrollTop && shouldLoadMore) {
                loadMore();
            }
        }

        // Add scroll event listener to chat container
        topDiv?.addEventListener("scroll", handleScroll);

        // Clean up event listener on unmount or dependency changes
        return () => {
            topDiv?.removeEventListener("scroll", handleScroll);
        }
    }, [shouldLoadMore, loadMore, chatRef])
    
    /**
     * Effect for automatic scrolling to bottom on initialization
     * and tracking the scroll position relative to the bottom
     */
    useEffect(() => {
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;
        
        // Determine if we should auto-scroll based on initialization state
        const shouldAutoScroll = () => {
            if (!hasInitialized && bottomDiv) {
                setHasInitialized(true);
                return true;
            }
            return false;
        }

        // Exit early if chat container isn't available
        if (!topDiv) {
            return;
        }

        // Perform auto-scroll on first load
        if (shouldAutoScroll()) {
            // Small delay to ensure content is fully rendered
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth"
                })
            }, 100);
        }

        // Calculate distance from bottom to determine if user is at bottom of chat
        const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
        setIsAtBottom(distanceFromBottom < 100); // Within 100px considered "at bottom"

    }, [bottomRef, chatRef, count, hasInitialized]);
}