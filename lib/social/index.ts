// Export all social platform integrations
export * as twitter from './twitter.js';
export * as linkedin from './linkedin.js';
export * as facebook from './facebook.js';
export * as instagram from './instagram.js';

import { postTweet, refreshTwitterToken } from './twitter.js';
import { postToLinkedIn, getLinkedInUrn, refreshLinkedInToken } from './linkedin.js';
import { postToFacebookPage } from './facebook.js';
import { postToInstagram } from './instagram.js';
import { sql } from '../db.js';

export type Platform = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

interface SocialAccount {
  id: number;
  platform: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: Date | null;
  platform_user_id: string;
  page_id: string | null;
  page_access_token: string | null;
}

// Refresh token if needed
async function ensureValidToken(account: SocialAccount): Promise<string> {
  const now = new Date();

  // Check if token is expired or about to expire (within 5 minutes)
  if (account.token_expires_at && new Date(account.token_expires_at) <= new Date(now.getTime() + 5 * 60 * 1000)) {
    if (!account.refresh_token) {
      throw new Error(`Token expired and no refresh token available for ${account.platform}`);
    }

    let newTokens;

    switch (account.platform) {
      case 'twitter':
        newTokens = await refreshTwitterToken(account.refresh_token);
        break;
      case 'linkedin':
        newTokens = await refreshLinkedInToken(account.refresh_token);
        break;
      // Facebook and Instagram long-lived tokens last ~60 days
      // They need to be refreshed before expiry using the same endpoint
      default:
        throw new Error(`Token refresh not implemented for ${account.platform}`);
    }

    // Update tokens in database
    const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000);
    await sql`
      UPDATE social_accounts
      SET access_token = ${newTokens.access_token},
          refresh_token = ${newTokens.refresh_token || account.refresh_token},
          token_expires_at = ${expiresAt.toISOString()},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${account.id}
    `;

    return newTokens.access_token;
  }

  return account.access_token;
}

// Universal publish function
export async function publishToSocialMedia(
  accountId: number,
  content: string,
  mediaUrl?: string
): Promise<{ success: boolean; platformPostId?: string; error?: string }> {
  try {
    // Get account details
    const result = await sql`
      SELECT * FROM social_accounts WHERE id = ${accountId}
    `;

    if (result.rows.length === 0) {
      return { success: false, error: 'Social account not found' };
    }

    const account = result.rows[0] as SocialAccount;
    const accessToken = await ensureValidToken(account);

    let platformPostId: string;

    switch (account.platform) {
      case 'twitter':
        const tweet = await postTweet(accessToken, content);
        platformPostId = tweet.id;
        break;

      case 'linkedin':
        const urn = `urn:li:person:${account.platform_user_id}`;
        const linkedInPost = await postToLinkedIn(accessToken, urn, content);
        platformPostId = linkedInPost.id;
        break;

      case 'facebook':
        if (!account.page_id || !account.page_access_token) {
          return { success: false, error: 'Facebook Page not configured' };
        }
        const fbPost = await postToFacebookPage(
          account.page_access_token,
          account.page_id,
          content,
          mediaUrl
        );
        platformPostId = fbPost.id;
        break;

      case 'instagram':
        if (!mediaUrl) {
          return { success: false, error: 'Instagram requires an image' };
        }
        if (!account.page_access_token) {
          return { success: false, error: 'Instagram account not properly configured' };
        }
        const igPost = await postToInstagram(
          account.page_access_token,
          account.platform_user_id,
          mediaUrl,
          content
        );
        platformPostId = igPost.id;
        break;

      default:
        return { success: false, error: `Unknown platform: ${account.platform}` };
    }

    return { success: true, platformPostId };
  } catch (error) {
    console.error('Error publishing to social media:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
