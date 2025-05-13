import { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';

// Do not cache endpoint result
export const revalidate = 0;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { room, username } = req.query;

    if (!room) {
      return res.status(400).json({ error: 'Missing "room" query parameter' });
    }
    
    if (!username) {
      return res.status(400).json({ error: 'Missing "username" query parameter' });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    // Create stable room identifiers with room prefix for easier debugging
    const roomName = `chat_${room}`;
    
    // Use more specific identity to avoid conflicts
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username as string,
      name: username as string, // Add name for better UI display
    });

    // Grant more specific permissions to ensure proper connection
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      roomCreate: true, // Allow room creation if doesn't exist
      roomAdmin: false,  // Not an admin by default
      roomList: false,   // Cannot list other rooms
    });

    // Generate JWT token
    const token = await at.toJwt();

    // Set cache control header and return response
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}