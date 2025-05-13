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

    // Create a new token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username as string
    });

    // Grant permissions to join room
    at.addGrant({
      room: room as string,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
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