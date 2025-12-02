// Facebook Graph API Integration
// Docs: https://developers.facebook.com/docs/graph-api/

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v18.0';
const FACEBOOK_OAUTH_BASE = 'https://www.facebook.com/v18.0/dialog/oauth';

interface FacebookConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

function getConfig(): FacebookConfig {
  return {
    appId: process.env.FACEBOOK_APP_ID!,
    appSecret: process.env.FACEBOOK_APP_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
  };
}

// Generate OAuth 2.0 authorization URL
export function getFacebookAuthUrl(state: string): string {
  const config = getConfig();
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,publish_to_groups',
    response_type: 'code',
    state,
  });

  return `${FACEBOOK_OAUTH_BASE}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeFacebookCode(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const config = getConfig();

  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const response = await fetch(`${FACEBOOK_API_BASE}/oauth/access_token?${params.toString()}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Facebook token exchange failed: ${error}`);
  }

  return response.json();
}

// Exchange short-lived token for long-lived token
export async function getLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const config = getConfig();

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const response = await fetch(`${FACEBOOK_API_BASE}/oauth/access_token?${params.toString()}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Facebook long-lived token exchange failed: ${error}`);
  }

  return response.json();
}

// Get authenticated user info
export async function getFacebookUser(accessToken: string): Promise<{
  id: string;
  name: string;
}> {
  const response = await fetch(`${FACEBOOK_API_BASE}/me?fields=id,name&access_token=${accessToken}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Facebook user: ${error}`);
  }

  return response.json();
}

// Get user's pages (for posting to pages)
export async function getFacebookPages(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  access_token: string;
}>> {
  const response = await fetch(
    `${FACEBOOK_API_BASE}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Facebook pages: ${error}`);
  }

  const data = await response.json();
  return data.data || [];
}

// Post to a Facebook Page
export async function postToFacebookPage(
  pageAccessToken: string,
  pageId: string,
  message: string,
  imageUrl?: string
): Promise<{ id: string }> {
  let endpoint = `${FACEBOOK_API_BASE}/${pageId}/feed`;
  const body: any = { message, access_token: pageAccessToken };

  if (imageUrl) {
    endpoint = `${FACEBOOK_API_BASE}/${pageId}/photos`;
    body.url = imageUrl;
    body.caption = message;
    delete body.message;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post to Facebook: ${error}`);
  }

  return response.json();
}

// Upload photo to Facebook Page
export async function uploadFacebookPhoto(
  pageAccessToken: string,
  pageId: string,
  imageData: Buffer,
  caption?: string
): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append('source', new Blob([imageData], { type: 'image/jpeg' }));
  formData.append('access_token', pageAccessToken);
  if (caption) {
    formData.append('caption', caption);
  }

  const response = await fetch(`${FACEBOOK_API_BASE}/${pageId}/photos`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload photo to Facebook: ${error}`);
  }

  return response.json();
}
