/**
 * Modal Store Hook
 *
 * Provides application-wide modal state management:
 * - Centralizes modal visibility control
 * - Manages modal type and associated data
 * - Enables consistent modal activation across components
 * - Built with Zustand for efficient state management
 */
import { Server, Channel, ChannelType } from '@prisma/client';
import { create } from 'zustand';

/**
 * Defines all possible modal types in the application
 * Used to specify which modal should be displayed
 */
export type ModalType = "createServer" | "invite" | "editServer" | "members" | "createChannel" | "leaveServer" |
"deleteServer" | "deleteChannel" | "editChannel" | "messageFile";

/**
 * Data structure for information passed to modals
 * @property server - Server data for server-related modals
 * @property channel - Channel data or minimal channel info for channel-related modals
 * @property channelType - Type of channel (TEXT, AUDIO, VIDEO) for channel creation/editing
 * @property apiUrl - API endpoint URL for modal operations
 * @property query - Additional query parameters for API requests
 */
interface ModalData {
    server?: Server;
    channel?: Channel | {
        id: string;
        name: string;
    };
    channelType?: ChannelType;
    apiUrl?: string;
    query?: Record<string, any>;
}

/**
 * Modal store state and actions interface
 * @property type - Current active modal type or null if no modal is open
 * @property data - Data associated with the current modal
 * @property isOpen - Whether any modal is currently open
 * @property onOpen - Action to open a modal with specified type and data
 * @property onClose - Action to close the currently open modal
 */
interface ModalStore {
    type: ModalType | null;
    data: ModalData;
    isOpen: boolean;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void;
}

/**
 * Zustand store hook for modal state management across the application
 * Provides a centralized way to control modal visibility and content
 */
export const useModal = create<ModalStore>((set) => ({
    // Initial state with no modal open
    type: null,         // No active modal type initially
    data: {},           // Empty data object initially
    isOpen: false,      // No modal open initially
    
    // Action to open a modal with specified type and data
    onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
    
    // Action to close the current modal and reset state
    onClose: () => set({ type: null, isOpen: false }),
}));
