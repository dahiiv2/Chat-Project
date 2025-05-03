"use client";

import { useRef, ElementRef } from "react";
import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";
import { Loader2, ServerCrash } from "lucide-react";
import { Fragment } from "react";
import { Message, Member, Profile } from "@prisma/client";
import { ChatItem } from "./chat-item";

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    };
};

interface ChatMessagesProps {
    name: string;
    member: any;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";
}

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
    const chatRef = useRef<ElementRef<"div">>(null);
    const bottomRef = useRef<ElementRef<"div">>(null);

    const queryKey = `chat:${chatId}`;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useChatQuery({
        queryKey,
        apiUrl,
        paramKey,
        paramValue,
    });

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
    const isSelfConversation = type === "conversation" && name === "Personal Notes";

    return (
        <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
            {/* Welcome component at the top of the chat */}
            <div className="flex-1">
                <ChatWelcome 
                    name={name}
                    type={type}
                    isSelfConversation={isSelfConversation}
                />
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
                
                {/* Messages will be rendered here in the future */}
            </div>
            <div ref={bottomRef} />
        </div>
    );
}