/**
 * Utility Functions Module
 * 
 * Contains core utility functions used throughout the application:
 * - Class name handling for Tailwind CSS
 * - Safely combines and deduplicates CSS classes
 * - Properly handles Tailwind's specificity and conflicts
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges CSS class names safely with Tailwind
 * 
 * @param inputs - Any number of class name arguments (strings, objects, arrays, etc.)
 * @returns A merged, deduplicated string of CSS class names
 * 
 * This function uses clsx to handle conditional class names and
 * tailwind-merge to properly handle Tailwind CSS specificity and conflicts.
 * 
 * Example usage:
 * cn('text-red-500', isActive && 'bg-blue-500', ['px-2', 'py-1'])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
