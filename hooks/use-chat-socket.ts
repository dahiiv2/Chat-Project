/**
 * useChatSocket Hook
 *
 * Manages real-time chat functionality via WebSockets:
 * - Integrates Socket.IO with React Query for state management
 * - Handles message updates and additions in real-time
 * - Maintains chat cache consistency across socket events
 * - Updates React Query cache without requiring refetches
 */
import { useSocket } from "@/components/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Message, Member, Profile } from "@prisma/client";

/**
 * Props for the useChatSocket hook
 * @property addKey - Socket event name for message additions
 * @property updateKey - Socket event name for message updates
 * @property queryKey - React Query key for the chat query to update
 */
type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
}

/**
 * Extended Message type that includes related member and profile data
 * Used for displaying complete message information including sender details
 */
type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    }
}

/**
 * Custom hook that integrates Socket.IO events with React Query state
 * to provide real-time updates to chat messages
 */
export const useChatSocket = ({ addKey, updateKey, queryKey }: ChatSocketProps) => {
    // Get socket instance from context
    const { socket } = useSocket();
    // Access React Query client for cache manipulation
    const queryClient = useQueryClient();

    // Setup socket event listeners and cleanup on unmount or dependency changes
    useEffect(() => {
        // Exit early if socket is not available
        if (!socket) return;

        /**
         * Socket event handler for message updates (edits, reactions, etc.)
         * Updates the existing message in the React Query cache
         */
        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData(
                [queryKey],
                (oldData: any) => {
                    // Skip update if there's no existing data
                    if (!oldData || !oldData.pages || oldData.pages.length === 0) return;

                    // Map through all pages and update the specific message
                    const newData = oldData.pages.map((page: any) => {
                        return {
                            ...page,
                            items: page.items.map((item: MessageWithMemberWithProfile) => {
                                // Replace the matching message with updated version
                                if (item.id === message.id) {
                                    return message;
                                }
                                return item;
                            })
                        }
                    });

                    // Return updated query data structure
                    return {
                        ...oldData,
                        pages: newData
                    };
                }
            )
        });

        /**
         * Socket event handler for new messages
         * Adds the message to the beginning of the first page in the React Query cache
         */
        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            queryClient.setQueryData(
                [queryKey],
                (oldData: any) => {
                    // Create new data structure if there's no existing data
                    if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                        return {
                            pages: [{
                                items: [message],
                            }]
                        };
                    };

                    // Create a copy of the existing pages
                    const newData = [...oldData.pages]

                    // Add new message to the beginning of the first page
                    newData[0] = {
                        ...newData[0],
                        items: [message, ...newData[0].items]
                    };

                    // Return updated query data structure
                    return {
                        ...oldData,
                        pages: newData
                    };
                }
            );
        });

        // Clean up event listeners when component unmounts or dependencies change
        return () => {
            socket.off(addKey);
            socket.off(updateKey);
        }

    }, [queryClient, addKey, queryKey, socket, updateKey]);
}