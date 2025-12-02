// Twitter/X API v2 Integration
// Docs: https://developer.twitter.com/en/docs/twitter-api

const TWITTER_API_BASE = 'https://api.twitter.com/2';
const TWITTER_OAUTH_BASE = 'https://twitter.com/i/oauth2';

interface TwitterConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function getConfig(): TwitterConfig {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, ''); // Remove trailing slash
  return {
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    redirectUri: `${appUrl}/api/auth/twitter/callback`,
  };
}

// Generate OAuth 2.0 authorization URL with PKCE
export function getTwitterAuthUrl(state: string, codeChallenge: string): string {
  const config = getConfig();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${TWITTER_OAUTH_BASE}/authorize?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeTwitterCode(code: string, codeVerifier: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const config = getConfig();

  const response = await fetch(`${TWITTER_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter token exchange failed: ${error}`);
  }

  return response.json();
}

// Refresh access token
export async function refreshTwitterToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const config = getConfig();

  const response = await fetch(`${TWITTER_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twitter token refresh failed: ${error}`);
  }

  return response.json();
}

// Get authenticated user info
export async function getTwitterUser(accessToken: string): Promise<{
  id: string;
  username: string;
  name: string;
}> {
  const response = await fetch(`${TWITTER_API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Twitter user: ${error}`);
  }

  const data = await response.json();
  return data.data;
}

// Post a tweet
export async function postTweet(accessToken: string, text: string, mediaId?: string): Promise<{
  id: string;
  text: string;
}> {
  const body: any = { text };

  if (mediaId) {
    body.media = { media_ids: [mediaId] };
  }

  const response = await fetch(`${TWITTER_API_BASE}/tweets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post tweet: ${error}`);
  }

  const data = await response.json();
  return data.data;
}

// Upload media (uses v1.1 API as v2 doesn't support media upload yet)
export async function uploadTwitterMedia(accessToken: string, mediaData: Buffer, mimeType: string): Promise<string> {
  // Twitter media upload requires v1.1 API with OAuth 1.0a
  // For simplicity, we'll use the chunked upload endpoint
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';

  // INIT
  const initResponse = await fetch(`${uploadUrl}?command=INIT&total_bytes=${mediaData.length}&media_type=${encodeURIComponent(mimeType)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!initResponse.ok) {
    throw new Error('Failed to initialize media upload');
  }

  const { media_id_string } = await initResponse.json();

  // APPEND
  const formData = new FormData();
  formData.append('command', 'APPEND');
  formData.append('media_id', media_id_string);
  formData.append('segment_index', '0');
  formData.append('media', new Blob([mediaData], { type: mimeType }));

  const appendResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!appendResponse.ok) {
    throw new Error('Failed to append media data');
  }

  // FINALIZE
  const finalizeResponse = await fetch(`${uploadUrl}?command=FINALIZE&media_id=${media_id_string}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!finalizeResponse.ok) {
    throw new Error('Failed to finalize media upload');
  }

  return media_id_string;
}
