/**
 * LiveKit Token Generation API Route
 * 
 * Provides secure access tokens for audio/video communications:
 * - Creates JWT tokens for LiveKit WebRTC service
 * - Secures room access with proper permissions
 * - Validates required parameters before token creation
 * - Handles authentication for audio/video channels
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';

// Prevent caching to ensure tokens are always fresh
export const revalidate = 0;

/**
 * API handler for generating LiveKit tokens
 * 
 * @param req - Next.js API request containing room and username parameters
 * @param res - Next.js API response object
 * @returns JSON response with token or error message
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enforce GET method for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract required parameters from query string
    const { room, username } = req.query;

    // Validate room parameter (channel/conversation ID)
    if (!room) {
      return res.status(400).json({ error: 'Missing "room" query parameter' });
    }
    
    // Validate username parameter (used as identity in token)
    if (!username) {
      return res.status(400).json({ error: 'Missing "username" query parameter' });
    }

    // Get LiveKit configuration from environment variables
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    // Ensure all required configuration is present
    if (!apiKey || !apiSecret || !wsUrl) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // Create stable room name with prefix for organization and debugging
    const roomName = `chat_${room}`;
    
    // Initialize access token with user identity information
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username as string, // Unique identifier for the user
      name: username as string,     // Display name in the LiveKit UI
    });

    // Add specific permissions to the token
    at.addGrant({
      room: roomName,       // The room this token grants access to
      roomJoin: true,       // Allow joining the room
      canPublish: true,     // Allow publishing audio/video
      canSubscribe: true,   // Allow subscribing to others' streams
      roomCreate: true,     // Create room if it doesn't exist yet
      roomAdmin: false,     // Regular user, not an admin
      roomList: false,      // Cannot list all available rooms
    });

    // Generate JWT token with the specified permissions
    const token = await at.toJwt();

    // Explicitly prevent caching to ensure fresh tokens
    res.setHeader('Cache-Control', 'no-store');
    // Return the token to the client
    return res.status(200).json({ token });
  } catch (error) {
    // Handle any unexpected errors during token generation
    console.error('LiveKit token generation error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}