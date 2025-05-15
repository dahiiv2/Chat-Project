/**
 * useChatQuery Hook
 *
 * Custom hook for fetching and paginating chat messages:
 * - Uses React Query's infinite query capabilities for efficient pagination
 * - Integrates with socket connection for real-time updates
 * - Supports both channel and direct message conversations
 * - Handles cursor-based pagination with automatic refetching
 */
import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";

/**
 * Props for the useChatQuery hook
 * @property queryKey - Unique key for React Query cache identification
 * @property apiUrl - API endpoint URL for fetching messages
 * @property paramKey - Parameter key to use in API request (channelId or conversationId)
 * @property paramValue - ID of the channel or conversation to fetch messages for
 */
interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

/**
 * Custom hook for fetching and managing chat messages with pagination
 * @returns React Query result object with data and pagination controls
 */
export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
}: ChatQueryProps) => {
    // Get socket connection status for dynamic refetch interval
    const { isConnected } = useSocket();

    /**
     * Query function to fetch messages from the API
     * @param pageParam - Cursor for pagination (undefined for first page)
     * @returns Parsed JSON response with messages and next cursor
     */
    const fetchMessages = async ({ pageParam = undefined}) => {
        // Build URL with query parameters including pagination cursor
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam,
                [paramKey]: paramValue, // Dynamic parameter (channelId or conversationId)
            },
        }, { skipNull: true }); // Skip null/undefined values

        // Fetch messages from API
        const res = await fetch(url);
        return res.json();
    };

    // Set up infinite query for paginated message loading
    const {
        data,                // Contains all fetched pages of messages
        fetchNextPage,       // Function to load the next page of messages
        hasNextPage,         // Boolean indicating if more messages exist
        isFetchingNextPage,  // Loading state for pagination requests
        status,              // Overall query status (loading, error, success)
    } = useInfiniteQuery({
        queryKey: [queryKey],  // Unique identifier for this query in cache
        queryFn: fetchMessages, // Function that fetches the data
        initialPageParam: undefined, // Start with no cursor (first page)
        getNextPageParam: (lastPage) => lastPage?.nextCursor, // Extract cursor for next page
        // Enable real-time updates when socket is connected
        refetchInterval: isConnected ? 1000 : false, // Poll every second when connected
    });

    // Return query data and control functions to the component
    return {
        data,                // All pages of messages
        fetchNextPage,       // Function to trigger loading more messages
        hasNextPage,         // Whether more messages can be loaded
        isFetchingNextPage,  // Loading state for pagination
        status,              // Overall query status
    }
}
