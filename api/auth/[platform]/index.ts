import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateState, generateCodeVerifier, generateCodeChallenge, storeOAuthState } from '../../../lib/oauth-utils';
import { getTwitterAuthUrl } from '../../../lib/social/twitter';
import { getLinkedInAuthUrl } from '../../../lib/social/linkedin';
import { getFacebookAuthUrl } from '../../../lib/social/facebook';
import { getInstagramAuthUrl } from '../../../lib/social/instagram';

// Check if database is configured
const hasDatabase = !!process.env.POSTGRES_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform } = req.query;

  if (typeof platform !== 'string') {
    return res.status(400).json({ error: 'Invalid platform' });
  }

  try {
    // Get user ID - use mock ID if no database
    let userId = 1; // Default mock user

    if (hasDatabase) {
      const { getOrCreateUser } = await import('../../../lib/db');
      const user = await getOrCreateUser();
      userId = user.id;
    }

    const state = generateState();

    let authUrl: string;
    let codeVerifier: string | undefined;

    switch (platform) {
      case 'twitter':
        codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        authUrl = getTwitterAuthUrl(state, codeChallenge);
        break;

      case 'linkedin':
        authUrl = getLinkedInAuthUrl(state);
        break;

      case 'facebook':
        authUrl = getFacebookAuthUrl(state);
        break;

      case 'instagram':
        authUrl = getInstagramAuthUrl(state);
        break;

      default:
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    // Store state for verification in callback
    storeOAuthState(state, platform, userId, codeVerifier);

    // Redirect to OAuth provider
    res.redirect(authUrl);
  } catch (error) {
    console.error(`OAuth initiation error for ${platform}:`, error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
