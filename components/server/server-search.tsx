"use client";

import { Search } from "lucide-react";

import { useState } from "react";

import { CommandDialog } from "@/components/ui/command";
import { CommandInput } from "@/components/ui/command";
import { CommandList } from "@/components/ui/command";
import { CommandEmpty } from "@/components/ui/command";
import { CommandGroup } from "@/components/ui/command";
import { CommandItem } from "@/components/ui/command";

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
    const [open, setOpen] = useState(false);
    return (
        <>
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
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search channels and members" />
                <CommandList>
                    <CommandEmpty>
                        No results.
                    </CommandEmpty>
                    {data.map(({label, type, data}) => {
                        if (!data?.length) return null;
                        
                        return (
                            <CommandGroup key={label} heading={label}>
                                {data?.map(({ id, icon, name}) => {
                                    return (
                                        <CommandItem key={id}>
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
            <div className="space-y-2">
                {data.map((item) => (
                    <div key={item.label}>
                        <p className="text-xs font-semibold px-3 py-2">{item.label}</p>
                        <div className="space-y-1">
                            {item.data?.map((data) => (
                                <div key={data.id} className="flex items-center gap-x-2 px-3 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer">
                                    {data.icon}
                                    <p className="font-semibold text-sm">{data.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}