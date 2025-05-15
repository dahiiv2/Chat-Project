/**
 * QueryProvider Component
 * 
 * Client-side component that provides React Query functionality to the application:
 * - Sets up and maintains a QueryClient instance for the application
 * - Wraps the application with QueryClientProvider for data fetching capabilities
 * - Enables caching, background fetching, and optimistic updates
 * - Allows components to use React Query hooks throughout the application
 */
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Props for the QueryProvider component
 * @property children - Child components that will have access to React Query functionality
 */
interface QueryProviderProps {
    children: React.ReactNode;
}

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    // Initialize and memoize a new QueryClient instance
    // Using useState factory pattern ensures the client is only created once
    const [queryClient] = useState(() => new QueryClient());

    return (
        // Provide the query client to all child components
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};