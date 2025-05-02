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
    const router = useRouter();
    const params = useParams();


    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);

        return () => {
            document.removeEventListener("keydown", down);
        };
    }, []);

    const onClick = ({ id, type }: { id: string; type: "channel" | "member" }) => {
        setOpen(false);
        if (!params || !params.serverId) return;
        
        if (type === "channel") {
            router.push(`/servers/${params.serverId}/channels/${id}`);
        } else {
            router.push(`/servers/${params.serverId}/conversations/${id}`);
        }
    };

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