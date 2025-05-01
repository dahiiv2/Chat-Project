import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    className?: string;
}

export const UserAvatar = ({
    src,
    className
}: UserAvatarProps) => {
    return (
        <Avatar className={cn(
            "h-10 w-10 border-2 border-amber-300 dark:border-amber-600/50", 
            className
        )}>
            <AvatarImage src={src} alt="User avatar" />
        </Avatar>
    )
}