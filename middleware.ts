/**
 * Authentication Middleware
 * 
 * Implements Clerk authentication for the application:
 * - Protects all routes except specifically defined public routes
 * - Ensures users are authenticated before accessing protected content
 * - Configures path matching for which routes should be processed
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Defines which routes should be accessible without authentication
 * - Authentication pages (sign-in, sign-up)
 * - File upload API endpoints
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/api/uploadthing(.*)'
])

/**
 * Clerk middleware function that checks authentication status
 * If the route is not public, it enforces authentication
 */
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect() // Redirects to sign-in if user is not authenticated
  }
})

/**
 * Middleware configuration that defines which paths should be processed
 * - First pattern matches all routes except static assets and specific file types
 * - Second pattern matches all API routes
 */
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}