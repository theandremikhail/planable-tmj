import type { VercelRequest, VercelResponse } from '@vercel/node';
import { decodeOAuthState } from '../../../lib/oauth-utils.js';
import { exchangeTwitterCode, getTwitterUser } from '../../../lib/social/twitter.js';
import { exchangeLinkedInCode, getLinkedInUser } from '../../../lib/social/linkedin.js';
import { exchangeFacebookCode, getLongLivedToken, getFacebookUser, getFacebookPages } from '../../../lib/social/facebook.js';
import { exchangeInstagramCode, getLongLivedToken as getInstagramLongLivedToken, getInstagramAccounts } from '../../../lib/social/instagram.js';

// Check if database is configured
const hasDatabase = !!process.env.POSTGRES_URL;

// Parse cookies from request
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length) {
      cookies[name.trim()] = rest.join('=').trim();
    }
  });

  return cookies;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { platform } = req.query;
  const { code, state, error } = req.query;

  if (error) {
    console.error(`OAuth error for ${platform}:`, error);
    return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_denied`);
  }

  if (typeof code !== 'string' || typeof state !== 'string' || typeof platform !== 'string') {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Get OAuth state from cookie
  const cookies = parseCookies(req.headers.cookie);
  const encodedState = cookies['oauth_state'];

  if (!encodedState) {
    return res.status(400).json({ error: 'Missing OAuth state cookie. Please try again.' });
  }

  const storedState = decodeOAuthState(encodedState);

  if (!storedState || storedState.state !== state || storedState.platform !== platform) {
    return res.status(400).json({ error: 'Invalid state parameter. Please try again.' });
  }

  const { userId, codeVerifier } = storedState;

  // Clear the OAuth state cookie
  res.setHeader('Set-Cookie', 'oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');

  try {
    let accessToken: string;
    let refreshToken: string | null = null;
    let expiresIn: number | null = null;
    let platformUserId: string;
    let platformUsername: string;
    let pageId: string | null = null;
    let pageAccessToken: string | null = null;

    switch (platform) {
      case 'twitter': {
        if (!codeVerifier) {
          throw new Error('Missing code verifier for Twitter');
        }
        const tokens = await exchangeTwitterCode(code, codeVerifier);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;
        expiresIn = tokens.expires_in;

        const user = await getTwitterUser(accessToken);
        platformUserId = user.id;
        platformUsername = user.username;
        break;
      }

      case 'linkedin': {
        const tokens = await exchangeLinkedInCode(code);
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token || null;
        expiresIn = tokens.expires_in;

        const user = await getLinkedInUser(accessToken);
        platformUserId = user.id;
        platformUsername = `${user.localizedFirstName} ${user.localizedLastName}`;
        break;
      }

      case 'facebook': {
        const shortLivedTokens = await exchangeFacebookCode(code);
        const longLivedTokens = await getLongLivedToken(shortLivedTokens.access_token);
        accessToken = longLivedTokens.access_token;
        expiresIn = longLivedTokens.expires_in;

        const user = await getFacebookUser(accessToken);
        platformUserId = user.id;
        platformUsername = user.name;

        // Get pages for posting
        const pages = await getFacebookPages(accessToken);
        if (pages.length > 0) {
          // For simplicity, use the first page. In production, let user choose
          pageId = pages[0].id;
          pageAccessToken = pages[0].access_token;
        }
        break;
      }

      case 'instagram': {
        const shortLivedTokens = await exchangeInstagramCode(code);
        const longLivedTokens = await getInstagramLongLivedToken(shortLivedTokens.access_token);
        accessToken = longLivedTokens.access_token;
        expiresIn = longLivedTokens.expires_in;

        // Get Instagram business accounts
        const accounts = await getInstagramAccounts(accessToken);
        if (accounts.length === 0) {
          return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_instagram_business_account`);
        }

        // Use the first Instagram business account
        const igAccount = accounts[0];
        platformUserId = igAccount.instagramId;
        platformUsername = igAccount.instagramUsername;
        pageId = igAccount.pageId;
        pageAccessToken = igAccount.pageAccessToken;
        break;
      }

      default:
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    // Calculate token expiry
    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Save to database if available
    if (hasDatabase) {
      const { sql } = await import('../../../lib/db.js');
      await sql`
        INSERT INTO social_accounts (
          user_id, platform, platform_user_id, platform_username,
          access_token, refresh_token, token_expires_at,
          page_id, page_access_token
        ) VALUES (
          ${userId}, ${platform}, ${platformUserId}, ${platformUsername},
          ${accessToken}, ${refreshToken}, ${tokenExpiresAt},
          ${pageId}, ${pageAccessToken}
        )
        ON CONFLICT (user_id, platform, platform_user_id)
        DO UPDATE SET
          access_token = EXCLUDED.access_token,
          refresh_token = COALESCE(EXCLUDED.refresh_token, social_accounts.refresh_token),
          token_expires_at = EXCLUDED.token_expires_at,
          page_id = EXCLUDED.page_id,
          page_access_token = EXCLUDED.page_access_token,
          platform_username = EXCLUDED.platform_username,
          updated_at = CURRENT_TIMESTAMP
      `;
    } else {
      // Log success for demo/testing without database
      console.log(`[Mock Mode] Would save ${platform} account for user ${userId}:`, {
        platformUserId,
        platformUsername,
        tokenExpiresAt
      });
    }

    // Redirect back to app with success
    res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=${platform}&username=${encodeURIComponent(platformUsername)}`);
  } catch (error) {
    console.error(`OAuth callback error for ${platform}:`, error);
    res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=oauth_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
  }
}
