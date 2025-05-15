/**
 * Root Layout Component
 * 
 * This is the application's top-level layout that wraps all pages.
 * It provides essential context providers and global styling:
 * - Authentication via Clerk
 * - Theme support with dark mode preference
 * - WebSocket connection for real-time features
 * - Global modal system
 * - React Query for data fetching
 */

// Authentication provider
import { ClerkProvider } from '@clerk/nextjs'

// Global styles
import './globals.css'
import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import { cn } from '@/lib/utils'

// Application providers
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ModalProvider } from '@/components/providers/modal-provider'
import { SocketProvider } from '@/components/providers/socket-provider'
import { QueryProvider } from '@/components/providers/query-provider'

// UI components
import { SocketIndicator } from '@/components/socket-indicator'

// Primary font for the application - Space Grotesk gives a modern look
const font = Space_Grotesk({ subsets: ['latin'] })

// Metadata for SEO and browser tab information
export const metadata: Metadata = {
  title: 'Team Chat Application',
  description: 'Real-time chat platform with text, audio, and video communication',
}

/**
 * RootLayout Component
 * 
 * The main layout wrapper for the entire application.
 * Sets up all the necessary providers and global UI elements that
 * should be present on every page of the application.
 * 
 * @param children - The page content to render inside this layout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Clerk authentication wrapper - handles user sessions and auth state
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        {/* Apply font and background colors */}
        <body className={cn(
          font.className,
          "bg-white dark:bg-[#313338]"
        )} suppressHydrationWarning>
          {/* Theme provider - manages dark/light mode with preference for dark */}
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"      // Start in dark mode by default
            enableSystem={false}    // Don't use system preference
            storageKey="discord-theme"  // Storage key for theme preference
          >
            {/* Socket provider - manages real-time WebSocket connections */}
            <SocketProvider>
              {/* Modal provider - handles all application modals */}
              <ModalProvider />
              
              {/* Query provider - React Query for data fetching and caching */}
              <QueryProvider>
                {children}
              </QueryProvider>
              
              {/* Connection status indicator in bottom right corner */}
              <div className="fixed bottom-1.5 right-4 z-50">
                <SocketIndicator />
              </div>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
