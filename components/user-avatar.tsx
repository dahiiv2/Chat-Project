/**
 * UserAvatar Component
 *
 * Displays user profile images consistently throughout the application:
 * - Wraps the UI Avatar component with custom styling
 * - Provides consistent sizing and border effects
 * - Accepts custom className for flexible usage in different contexts
 */
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Props for the UserAvatar component
 * @property src - URL of the user's avatar image (optional)
 * @property className - Additional CSS classes to apply to the avatar (optional)
 */
interface UserAvatarProps {
    src?: string;
    className?: string;
}

/**
 * UserAvatar renders a consistent user profile image
 */
export const UserAvatar = ({
    src,
    className
}: UserAvatarProps) => {
    return (
        <Avatar className={cn(
            // Default sizing and styling with theme-appropriate borders
            "h-10 w-10 border-2 border-amber-300 dark:border-amber-600/50", 
            // Apply any custom classes passed as props
            className
        )}>
            {/* Display the user's avatar image */}
            <AvatarImage src={src} alt="User avatar" />
        </Avatar>
    )
}