/**
 * ServerSearch Component
 * 
 * Provides search functionality within a server context:
 * - Implements a keyboard shortcut (Ctrl+K) for quick access
 * - Displays a command dialog for searching channels and members
 * - Handles navigation to selected channels or conversations
 * - Groups search results by type (channel or member)
 * - Supports dynamic rendering of search data
 */
"use client";

import { Search } from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { CommandDialog } from "@/components/ui/command";
import { CommandInput } from "@/components/ui/command";
import { CommandList } from "@/components/ui/command";
import { CommandEmpty } from "@/components/ui/command";
import { CommandGroup } from "@/components/ui/command";
import { CommandItem } from "@/components/ui/command";

/**
 * Props for the ServerSearch component
 * @property data - Array of search data groups with label, type, and items
 * Each group contains:
 * - label: Section heading (e.g., "Text Channels", "Members")
 * - type: Whether items are channels or members
 * - data: Array of items with icon, name, and id
 */
interface ServerSearchProps {
    data: {
        label: string;
        type: "channel" | "member";
        data: {
            icon: React.ReactNode;
            name: string;
            id: string;
        }[] | undefined;
    }[];
}

export const ServerSearch = ({data}: ServerSearchProps) => {
    // Control the open state of the command dialog
    const [open, setOpen] = useState(false);
    // Access Next.js router for navigation
    const router = useRouter();
    // Get current route parameters
    const params = useParams();


    // Set up keyboard shortcut (Ctrl+K) to toggle the search dialog
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        // Add event listener for keyboard shortcut
        document.addEventListener("keydown", down);

        // Clean up event listener on component unmount
        return () => {
            document.removeEventListener("keydown", down);
        };
    }, []);

    // Handle click on a search result item
    const onClick = ({ id, type }: { id: string; type: "channel" | "member" }) => {
        // Close the dialog after selection
        setOpen(false);
        // Ensure we have the server ID parameter
        if (!params || !params.serverId) return;
        
        // Navigate to the appropriate route based on item type
        if (type === "channel") {
            router.push(`/servers/${params.serverId}/channels/${id}`);
        } else {
            router.push(`/servers/${params.serverId}/conversations/${id}`);
        }
    };

    return (
        <>
            {/* Button to open the search dialog */}
            <button
                onClick={() => setOpen(true)}
                className="px-3 py-2 text-xs flex items-center gap-x-2"
            >
                <Search className="h-4 w-4" />
                <p
                    className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                > 
                    Search
                </p>
            </button>
            {/* Command dialog for searching channels and members */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                {/* Search input field */}
                <CommandInput placeholder="Search channels and members" />
                <CommandList>
                    {/* Shown when no search results are found */}
                    <CommandEmpty>
                        No results.
                    </CommandEmpty>
                    {/* Map through and display each group of search results */}
                    {data.map(({label, type, data}) => {
                        // Skip rendering empty groups
                        if (!data?.length) return null;
                        
                        return (
                            // Group of search results with heading
                            <CommandGroup key={label} heading={label}>
                                {/* Map through individual items in each group */}
                                {data?.map(({ id, icon, name}) => {
                                    return (
                                        // Selectable item that navigates on click
                                        <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                                            {icon}
                                            <span>{name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )
                    })}
                </CommandList>
            </CommandDialog>
        </>
    )
}