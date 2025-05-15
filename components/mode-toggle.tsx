/**
 * ModeToggle Component
 *
 * Provides theme switching functionality in the application:
 * - Toggles between light and dark mode
 * - Uses next-themes for theme management
 * - Animated sun/moon icons for visual feedback
 * - Dropdown menu for explicit theme selection
 */
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * ModeToggle provides UI controls for switching between light and dark themes
 */
export function ModeToggle() {
  // Access theme control from next-themes
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      {/* Button that shows sun/moon based on current theme */}
      <DropdownMenuTrigger asChild>
        <Button className="bg-transparent border-0"variant="outline" size="icon">
          {/* Sun icon visible in light mode, animated out in dark mode */}
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Moon icon visible in dark mode, animated out in light mode */}
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/* Screen reader text for accessibility */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      {/* Theme selection menu */}
      <DropdownMenuContent align="end">
        {/* Light theme option */}
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        {/* Dark theme option */}
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
