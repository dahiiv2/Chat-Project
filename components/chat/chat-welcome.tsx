/**
 * ChatWelcome Component
 * 
 * Renders a welcome banner at the top of a chat when there are no previous messages
 * or when all messages have been loaded. Displays different content based on chat type:
 * - Channels: Shows channel name with message square icon
 * - Conversations: Shows user name
 * - Personal Notes: Shows special bot icon and personalized message
 */
"use client";

import { MessageSquare, Bot } from "lucide-react";

/**
 * Props for the ChatWelcome component
 */
interface ChatWelcomeProps {
    name: string;                       // Name of the channel or conversation partner
    type: "channel" | "conversation";   // Whether this is a server channel or direct message
    isSelfConversation?: boolean;      // Whether this is a conversation with self (Personal Notes)
}

/**
 * Renders a welcome banner with appropriate icon and message
 * based on the chat type and context
 */
export const ChatWelcome = ({
    name,
    type,
    isSelfConversation
}: ChatWelcomeProps) => {
    return (
        <div className="space-y-2 px-4 mb-4">
            {/* For channels, display message square icon */}
            {type === "channel" && (
                <div className="h-[75px] w-[75px] rounded-full bg-zinc-200 dark:bg-amber-500/20 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-zinc-500 dark:text-amber-500" />
                </div>
            )}
            {/* For Personal Notes, display bot icon */}
            {type === "conversation" && isSelfConversation && (
                <div className="h-[75px] w-[75px] rounded-full bg-zinc-200 dark:bg-amber-500/20 flex items-center justify-center">
                    <Bot className="h-12 w-12 text-zinc-500 dark:text-amber-500" />
                </div>
            )}
            {/* Dynamic welcome heading based on chat type */}
            <p className="text-xl md:text-2xl font-bold">
                {type === "channel" ? `Welcome to #${name}` : `${isSelfConversation ? "Personal Notes" : `Chat with ${name}`}`}
            </p>
            {/* Contextual description text for each chat type */}
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                {type === "channel" 
                    ? `This is the start of the #${name} channel.` 
                    : isSelfConversation 
                        ? "This is your personal notes, write down whatever you want!"
                        : `This is the beginning of your conversation with ${name}.`
                }
            </p>
        </div>
    );
}