
import { useEffect, useState } from "react";

type ChatScrollProps = {
    chatRef: React.RefObject<HTMLDivElement | null>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    shouldLoadMore: boolean;
    loadMore: () => void;   
    count: number;
}

// custom hook for chat scroll
export const useChatScroll = ({ chatRef, bottomRef, shouldLoadMore, loadMore, count }: ChatScrollProps) => {
    const [hasInitialized, setHasInitialized] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);

    // load more messages
    useEffect(() => {
        const topDiv = chatRef?.current;

        const handleScroll = () => {
            const scrollTop = topDiv?.scrollTop;

            if (scrollTop && shouldLoadMore) {
                loadMore();
            }
        }

        topDiv?.addEventListener("scroll", handleScroll);

        return () => {
            topDiv?.removeEventListener("scroll", handleScroll);
        }
    }, [shouldLoadMore, loadMore, chatRef])
    
    // auto scroll
    useEffect(() => {
        const bottomDiv = bottomRef?.current;
        const topDiv = chatRef?.current;
        
        const shouldAutoScroll = () => {
            if (!hasInitialized && bottomDiv) {
                setHasInitialized(true);
                return true;
            }
            return false;
        }

        if (!topDiv) {
            return;
        }

        if (shouldAutoScroll()) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({
                    behavior: "smooth"
                })
            }, 100);
        }

        const distanceFromBottom = topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;
        setIsAtBottom(distanceFromBottom < 100);

    }, [bottomRef, chatRef, count, hasInitialized]);
}