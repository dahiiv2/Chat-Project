/**
 * ModalProvider Component
 * 
 * Client-side component that manages all modal components in the application:
 * - Ensures modals are only mounted after client-side hydration is complete
 * - Centrally imports and renders all modal components in a single location
 * - Avoids hydration errors by conditionally rendering when client is ready
 * - Acts as a central registry for all available modal dialogs in the application
 */
'use client';

import { useEffect, useState } from "react";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { InviteModal } from "@/components/modals/invite-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { MembersModal } from "@/components/modals/members-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import { MessageFileModal } from "@/components/modals/message-file-modal";

export const ModalProvider = () => {
    // Track if component has mounted on the client to prevent hydration issues
    const [isMounted, setIsMounted] = useState(false);

    // Set mounted state to true after initial render on the client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Prevent rendering modals during server-side rendering or before hydration
    if (!isMounted) {
        return null;
    }

    // Render all modal components that may be triggered from anywhere in the application
    return (
        <>
            <CreateServerModal />
            <InviteModal />
            <EditServerModal />
            <MembersModal />
            <CreateChannelModal />
            <LeaveServerModal />
            <EditChannelModal />
            <DeleteServerModal />
            <DeleteChannelModal />
            <MessageFileModal />
        </>
    )
}
