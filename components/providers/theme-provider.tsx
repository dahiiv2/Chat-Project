/**
 * ThemeProvider Component
 * 
 * Client-side component that provides theme functionality to the application:
 * - Wraps the next-themes provider to enable light/dark mode support
 * - Handles theme persistence across sessions
 * - Enables automatic detection of system preferences
 * - Provides a consistent API for theme management throughout the application
 */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * ThemeProvider component that wraps NextThemesProvider
 * @param children - Child components that will have access to theme functionality
 * @param props - Additional props passed to the underlying NextThemesProvider
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Pass all props to the NextThemesProvider and render children within it
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
