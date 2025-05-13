import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";

// props for the chat query
interface ChatQueryProps {
    queryKey: string;
    apiUrl: string;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
}

// custom hook for chat query
export const useChatQuery = ({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
}: ChatQueryProps) => {
    const { isConnected } = useSocket();

    // fetch messages from the api
    const fetchMessages = async ({ pageParam = undefined}) => {
        const url = qs.stringifyUrl({
            url: apiUrl,
            query: {
                cursor: pageParam,
                [paramKey]: paramValue,
            },
        }, { skipNull: true });

        const res = await fetch(url);
        return res.json();
    };

    // infinite query for messages
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: [queryKey],
        queryFn: fetchMessages,
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        // refetch every second if the user is connected
        refetchInterval: isConnected ? 1000 : false,
    });

    return {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    }
}
