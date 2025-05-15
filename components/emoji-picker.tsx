/**
 * EmojiPicker Component
 * 
 * Provides emoji selection functionality for message inputs:
 * - Uses emoji-mart library for a rich emoji picker
 * - Supports dark/light theme based on application theme
 * - Returns selected emoji through onChange callback
 * - Displayed in a popover triggered by a Smile icon
 */
"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";

/**
 * Props for the EmojiPicker component
 * @property onChange - Callback function that receives the selected emoji
 */
interface EmojiPickerProps {
    onChange: (value: string) => void;
}

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
    // Get the current theme (dark/light) for the emoji picker
    const { resolvedTheme } = useTheme();

    return (
        <Popover>
            {/* Trigger button with smile icon */}
            <PopoverTrigger asChild>
                <Smile
                    className="h-8 w-8"
                >
                    <Smile className="h-5 w-5" />
                </Smile>
            </PopoverTrigger>
            {/* Popover content with transparent background */}
            <PopoverContent 
                side="top" 
                sideOffset={2}
                className="bg-transparent border-none shadow-none drop-shadow-none mr-24"
            >
                {/* Emoji-mart picker with current theme */}
                <Picker
                    theme={resolvedTheme} // Apply current UI theme to picker
                    data={data} // Use emoji-mart data
                    onEmojiSelect={(emoji: any) => onChange(emoji.native)} // Pass selected emoji to callback
                />
            </PopoverContent>
        </Popover>
    )
}