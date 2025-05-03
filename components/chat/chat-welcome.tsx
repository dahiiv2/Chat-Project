"use client";

import { MessageSquare, Bot } from "lucide-react";

interface ChatWelcomeProps {
    name: string;
    type: "channel" | "conversation";
    isSelfConversation?: boolean;
}

export const ChatWelcome = ({
    name,
    type,
    isSelfConversation
}: ChatWelcomeProps) => {
    return (
        <div className="space-y-2 px-4 mb-4">
            {type === "channel" && (
                <div className="h-[75px] w-[75px] rounded-full bg-zinc-200 dark:bg-amber-500/20 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-zinc-500 dark:text-amber-500" />
                </div>
            )}
            {type === "conversation" && isSelfConversation && (
                <div className="h-[75px] w-[75px] rounded-full bg-zinc-200 dark:bg-amber-500/20 flex items-center justify-center">
                    <Bot className="h-12 w-12 text-zinc-500 dark:text-amber-500" />
                </div>
            )}
            <p className="text-xl md:text-2xl font-bold">
                {type === "channel" ? `Welcome to #${name}` : `${isSelfConversation ? "Personal Notes" : `Chat with ${name}`}`}
            </p>
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