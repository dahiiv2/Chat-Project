/**
 * ChatMessages Component
 * 
 * Core component for displaying the message history in both channel and direct message chats.
 * Features include:
 * - Real-time message updates via WebSockets
 * - Infinite scrolling with cursor-based pagination
 * - Automatic scrolling to new messages
 * - Loading and error states
 * - Welcome message for empty channels
 */
"use client";

import { useRef, ElementRef } from "react";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment } from "react";
import { Message, Member, Profile } from "@prisma/client";
import { ChatItem } from "./chat-item";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { useChatScroll } from "@/hooks/use-chat-scroll";

/**
 * Extended type for messages that includes the member who sent it
 * and their profile information for displaying avatars and names
 */
type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    };
};

/**
 * Props for the ChatMessages component
 */
interface ChatMessagesProps {
    name: string;                         // Name of channel or conversation partner
    member: any;                          // Current user's member object (using any for Next.js 15 compatibility)
    chatId: string;                       // Unique identifier for the chat
    apiUrl: string;                       // API endpoint for fetching messages
    socketUrl: string;                    // WebSocket endpoint for real-time updates
    socketQuery: Record<string, string>;   // Query parameters for socket connection
    paramKey: "channelId" | "conversationId"; // Parameter key based on chat type
    paramValue: string;                   // ID value for the channel or conversation
    type: "channel" | "conversation";      // Whether this is a server channel or direct message
}

/**
 * Renders the message list with pagination, real-time updates, and scroll management
 */
export const ChatMessages = ({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type,
}: ChatMessagesProps) => {
    // References for scroll management
    const chatRef = useRef<HTMLDivElement>(null);   // Reference to the chat container
    const bottomRef = useRef<HTMLDivElement>(null);  // Reference to the bottom of chat for scrolling

    // Cache keys for react-query and socket events
    const queryKey = `chat:${chatId}`;               // Main query cache key
    const addKey = `chat:${chatId}:messages`;        // Socket event for new messages
    const updateKey = `chat:${chatId}:messages:update`; // Socket event for updated messages

    /**
     * Custom hooks for chat functionality:
     * 1. useChatQuery - Fetches messages with pagination
     * 2. useChatSocket - Handles real-time message updates
     * 3. useChatScroll - Manages scroll position and infinite loading
     */
    const {
        data,                // Paginated message data
        fetchNextPage,       // Function to load more messages
        hasNextPage,         // Whether more messages exist
        isFetchingNextPage,  // Loading state for pagination
        status,              // Overall query status
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue,
    });
    
    // Setup WebSocket connection for real-time updates
    useChatSocket({queryKey, addKey, updateKey})
    
    // Configure scrolling behavior and infinite loading
    useChatScroll({
        chatRef,
        bottomRef,
        shouldLoadMore: !!hasNextPage && !isFetchingNextPage,
        loadMore: fetchNextPage,
        count: data?.pages.length || 0,
    })

    /**
     * Loading state - displays a centered loading spinner with gold/amber accent
     */
    if (status === "pending") {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 absolute inset-0">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
                <p className="text-base text-zinc-400 animate-pulse">
                    <span className="font-semibold text-amber-500/90 glow-text-sm">Loading messages</span>
                </p>
            </div>
        );
    }

    /**
     * Error state - displays a centered error message with red accent
     */
    if (status === "error") {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 absolute inset-0">
                <ServerCrash className="h-10 w-10 text-rose-500" />
                <p className="text-base text-zinc-400">
                    <span className="font-semibold text-rose-500">Something went wrong!</span> Unable to load messages.
                </p>
            </div>
        );
    }

    // Detect if this is a self-conversation (for Personal Notes feature)
    // This enables special styling and messaging for the personal notes functionality
    const isSelfConversation = type === "conversation" && name === "Personal Notes";

    return (
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            {/* Show welcome component when we've loaded all messages (reached the beginning) */}
            {!hasNextPage && (
                <div className="flex-1">
                    <ChatWelcome
                        name={name}
                        type={type}
                        isSelfConversation={isSelfConversation}
                    />
                </div>
            )}
            {/* Load previous messages */}
            {hasNextPage && (
                <div className="flex justify-center">
                    {isFetchingNextPage ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        // Load previous messages button, calls fetchNextPage
                        <button
                            onClick={() => fetchNextPage()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-zinc-500/10 transition-colors"
                        >
                            Load previous messages
                        </button>
                    )}
                </div>
            )}
            
            {/* Messages */}
            <div className="flex flex-col-reverse mt-auto">
                {data?.pages?.map((group, i) => (
                    <Fragment key={i}>
                        {group.items.map((message: MessageWithMemberWithProfile) => (
                            <ChatItem 
                                key={message.id}
                                message={message} 
                                currentMember={member}
                                deleted={message.deleted}
                                isUpdated={message.updatedAt !== message.createdAt}
                                socketUrl={socketUrl}
                                socketQuery={socketQuery}
                                fileUrl={message.fileUrl || undefined}
                            />
                        ))}
                    </Fragment>
                ))}
            </div>
            {/* Scroll to bottom */}
            <div ref={bottomRef} />
        </div>
    );
}