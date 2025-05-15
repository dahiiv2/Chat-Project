/**
 * ActionTooltip Component
 * 
 * Reusable tooltip component for interactive elements throughout the application:
 * - Provides contextual information on hover
 * - Customizable position and alignment
 * - Consistent styling with small delay for better UX
 * - Wraps children elements to add tooltip functionality
 */
"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

/**
 * Props for the ActionTooltip component
 * @property label - Text to display in the tooltip
 * @property children - Element that triggers the tooltip on hover
 * @property side - Position of the tooltip relative to the trigger (defaults to bottom)
 * @property align - Alignment of the tooltip relative to the trigger (defaults to center)
 */
interface ActionTooltipProps {
    label: string;
    children: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}

export const ActionTooltip = ({
    label,
    children,
    side,
    align
}: ActionTooltipProps) => {
    return (
        // Wrap in provider for tooltip context
        <TooltipProvider>
            {/* Set short delay for better UX */}
            <Tooltip delayDuration={50}>
                {/* Use asChild to preserve children's original properties */}
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                {/* Tooltip content with position customization */}
                <TooltipContent side={side} align={align}>
                    {/* Display label in a consistent format */}
                    <p className="font-semibold text-sm capitalize">
                        {label.toLowerCase()}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}