import { Member, Message, Profile } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Edit, Trash, Loader2 } from "lucide-react";
import { ActionTooltip } from "@/components/action-tooltip";
import axios from "axios";
import qs from "query-string";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";

type MessageWithMemberWithProfile = Message & {
    member: Member & {
        profile: Profile;
    };
};

interface ChatItemProps {
    message: MessageWithMemberWithProfile;
    currentMember: Member;
    deleted?: boolean;
    isUpdated?: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
    fileUrl?: string;
}

const formSchema = z.object({
    content: z.string().min(1),
});

// chat item component
export const ChatItem = ({ 
    message, 
    currentMember,
    deleted,
    isUpdated,
    socketUrl,
    socketQuery,
    fileUrl
}: ChatItemProps) => {
    const fileType = fileUrl?.split(".")?.pop();
    const params = useParams();
    const router = useRouter();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isCurrentUser = message.member.id === currentMember.id;
    const isAdmin = currentMember.role === "ADMIN";
    const isModerator = currentMember.role === "MODERATOR";
    
    // Check if we're in a direct message conversation
    const isDirect = socketUrl.includes("/direct-messages");
    const isOwner = currentMember.id === message.member.profileId;
    
    // Users can delete their own messages, admins and moderators can delete any message
    const canDeleteMessage = isAdmin || isModerator || isCurrentUser;
    
    const isPDF = fileType === "pdf" && fileUrl;
    const isImage = fileUrl && !isPDF && fileType && ["png", "jpg", "jpeg", "gif"].includes(fileType);
    // Only current user can edit their own messages and only if it's not a file attachment
    const canEditMessage = isCurrentUser && !deleted && !isImage && !isPDF;
    
    // Check if message content is just the file URL to prevent duplicate display
    const isMessageJustFileUrl = fileUrl && message.content === fileUrl;
    
    const onMemberClick = () => {
        router.push(`/servers/${params?.serverId}/conversations/${message.member.id}`);
    }

    const onDelete = async () => {
        try {
            setIsDeleting(true);
            
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${message.id}`,
                query: socketQuery,
            });

            await axios.delete(url);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleting(false);
        }
    }
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: message.content
        }
    });

    useEffect(() => {
        form.reset({
            content: message.content
        });
    }, [message.content]);
    
    const isLoading = form.formState.isSubmitting;
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${message.id}`,
                query: socketQuery,
            });
            
            await axios.patch(url, values);
            
            form.reset();
            setIsEditing(false);
        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isEditing) {
                setIsEditing(false);
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isEditing]);
    
    return (
        <div className={cn(
            "group flex gap-x-3 py-4 px-4 transition",
            "dark:hover:bg-zinc-700/10 hover:bg-zinc-200/10",
            "border-l-2 border-transparent hover:border-amber-500/50"
        )}>
            <div className="flex-shrink-0">
                <Avatar onClick={onMemberClick} className="cursor-pointer">
                    <AvatarImage src={message.member.profile.imageUrl} />
                    <AvatarFallback>
                        {message.member.profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex items-center gap-x-2">
                    <div className="flex items-center">
                        <p 
                            onClick={onMemberClick}
                            className={cn(
                                "font-semibold text-sm hover:underline cursor-pointer",
                                !isDirect && message.member.role === "ADMIN" ? "text-amber-600 dark:text-amber-500 glow-text-sm" : 
                                !isDirect && message.member.role === "MODERATOR" ? "text-amber-500 dark:text-amber-300" : "text-zinc-700 dark:text-zinc-200"
                            )}
                        >
                            {message.member.profile.name}
                        </p>
                        {/* Only show role badges in server channels (not in DMs) */}
                        {!isDirect && (message.member.role === "ADMIN" || message.member.role === "MODERATOR") && (
                            <span className={cn(
                                "ml-2 text-xs px-1 py-0.5 rounded-md",
                                message.member.role === "ADMIN" ? "bg-amber-500/20 text-amber-600 dark:text-amber-500" : "bg-amber-300/20 text-amber-500 dark:text-amber-300"
                            )}>
                                {message.member.role.charAt(0) + message.member.role.slice(1).toLowerCase()}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-zinc-500">
                        {format(new Date(message.createdAt), "d MMM yyyy, HH:mm")}
                        {isUpdated && !deleted && (
                            <span className="text-[10px] mx-2 text-zinc-500">
                                (edited)
                            </span>
                        )}
                    </span>
                    {canDeleteMessage && !isEditing && !deleted && (
                        <div className="hidden group-hover:flex items-center gap-x-2 ml-auto">
                            {canEditMessage && (
                                <ActionTooltip label="Edit">
                                    <Edit 
                                        onClick={() => setIsEditing(true)}
                                        className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-amber-500 transition"
                                    />
                                </ActionTooltip>
                            )}
                            <ActionTooltip label={isDeleting ? "Deleting..." : "Delete"}>
                                {isDeleting ? (
                                    <Loader2 className="animate-spin ml-auto w-4 h-4 text-zinc-500" />
                                ) : (
                                    <Trash 
                                        onClick={onDelete}
                                        className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-rose-500 transition"
                                    />
                                )}
                            </ActionTooltip>
                        </div>
                    )}
                </div>
                {!deleted ? (
                    <div className="mt-2">
                        {isEditing ? (
                            <Form {...form}>
                                <form 
                                    onSubmit={form.handleSubmit(onSubmit)}
                                    className="flex items-center w-full gap-x-2 pt-2"
                                >
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormControl>
                                                    <div className="relative w-full">
                                                        <Input
                                                            disabled={isLoading}
                                                            className="p-2 bg-zinc-100 dark:bg-zinc-800 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-700 dark:text-white"
                                                            placeholder="Edited message"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button disabled={isLoading} size="sm" variant="primary">
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
                                    </Button>
                                </form>
                                <span className="text-[10px] mt-1 text-zinc-400">
                                    Press ESC to cancel, Enter to save
                                </span>
                            </Form>
                        ) : (
                            <>
                                {(isImage || isPDF) && (
                                    <div className="mt-2">
                                        {isImage && (
                                            <a 
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative rounded-md overflow-hidden border flex items-center bg-secondary max-w-xs"
                                            >
                                                <img 
                                                    src={fileUrl} 
                                                    alt="Image" 
                                                    className="object-contain max-h-[300px] w-auto"
                                                    onLoad={(e) => {
                                                        // Ensure image is displayed with proper dimensions
                                                        const img = e.target as HTMLImageElement;
                                                        if (img.naturalWidth > img.naturalHeight * 1.5) {
                                                            // Wide image
                                                            img.className = "object-contain w-full max-h-[300px]";
                                                        } else if (img.naturalHeight > img.naturalWidth * 1.5) {
                                                            // Tall image
                                                            img.className = "object-contain max-w-full h-[300px]";
                                                        }
                                                    }}
                                                />
                                            </a>
                                        )}
                                        {isPDF && (
                                            <div className="relative flex items-center p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
                                                <a 
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-sm text-amber-600 dark:text-amber-500 hover:underline"
                                                >
                                                    PDF Document - Click to view
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {message.content && !isMessageJustFileUrl && (
                                    <p className="text-sm text-zinc-700 dark:text-zinc-200 mt-1">
                                        {message.content}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <p className="italic text-xs text-zinc-500 mt-1">
                        This message has been deleted
                    </p>
                )}
            </div>
        </div>
    );
};
