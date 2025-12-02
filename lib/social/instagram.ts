// Instagram Graph API Integration (via Facebook)
// Docs: https://developers.facebook.com/docs/instagram-api/

const FACEBOOK_API_BASE = 'https://graph.facebook.com/v18.0';
const FACEBOOK_OAUTH_BASE = 'https://www.facebook.com/v18.0/dialog/oauth';

interface InstagramConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

function getConfig(): InstagramConfig {
  return {
    appId: process.env.FACEBOOK_APP_ID!, // Instagram uses Facebook App
    appSecret: process.env.FACEBOOK_APP_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
  };
}

// Generate OAuth 2.0 authorization URL (via Facebook)
export function getInstagramAuthUrl(state: string): string {
  const config = getConfig();
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
    response_type: 'code',
    state,
  });

  return `${FACEBOOK_OAUTH_BASE}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeInstagramCode(code: string): Promise<{
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
    throw new Error(`Instagram token exchange failed: ${error}`);
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
    throw new Error(`Instagram long-lived token exchange failed: ${error}`);
  }

  return response.json();
}

// Get Instagram Business Account ID linked to Facebook Page
export async function getInstagramBusinessAccount(
  accessToken: string,
  facebookPageId: string
): Promise<{ id: string; username: string } | null> {
  const response = await fetch(
    `${FACEBOOK_API_BASE}/${facebookPageId}?fields=instagram_business_account{id,username}&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Instagram business account: ${error}`);
  }

  const data = await response.json();
  return data.instagram_business_account || null;
}

// Get all Instagram accounts connected via Facebook Pages
export async function getInstagramAccounts(accessToken: string): Promise<Array<{
  instagramId: string;
  instagramUsername: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
}>> {
  // First get all Facebook pages
  const pagesResponse = await fetch(
    `${FACEBOOK_API_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${accessToken}`
  );

  if (!pagesResponse.ok) {
    const error = await pagesResponse.text();
    throw new Error(`Failed to get Facebook pages: ${error}`);
  }

  const pagesData = await pagesResponse.json();
  const accounts: Array<{
    instagramId: string;
    instagramUsername: string;
    pageId: string;
    pageName: string;
    pageAccessToken: string;
  }> = [];

  for (const page of pagesData.data || []) {
    if (page.instagram_business_account) {
      accounts.push({
        instagramId: page.instagram_business_account.id,
        instagramUsername: page.instagram_business_account.username,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
      });
    }
  }

  return accounts;
}

// Create a media container (required before publishing)
export async function createInstagramMediaContainer(
  accessToken: string,
  instagramAccountId: string,
  imageUrl: string,
  caption?: string
): Promise<{ creation_id: string }> {
  const params = new URLSearchParams({
    image_url: imageUrl,
    access_token: accessToken,
  });

  if (caption) {
    params.append('caption', caption);
  }

  const response = await fetch(`${FACEBOOK_API_BASE}/${instagramAccountId}/media?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Instagram media container: ${error}`);
  }

  const data = await response.json();
  return { creation_id: data.id };
}

// Publish the media container
export async function publishInstagramMedia(
  accessToken: string,
  instagramAccountId: string,
  creationId: string
): Promise<{ id: string }> {
  const params = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const response = await fetch(
    `${FACEBOOK_API_BASE}/${instagramAccountId}/media_publish?${params.toString()}`,
    { method: 'POST' }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to publish Instagram media: ${error}`);
  }

  return response.json();
}

// Post to Instagram (combines container creation and publishing)
export async function postToInstagram(
  accessToken: string,
  instagramAccountId: string,
  imageUrl: string,
  caption?: string
): Promise<{ id: string }> {
  // Step 1: Create media container
  const { creation_id } = await createInstagramMediaContainer(
    accessToken,
    instagramAccountId,
    imageUrl,
    caption
  );

  // Step 2: Wait for container to be ready (Instagram processes the image)
  // In production, you should poll the container status
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Step 3: Publish the container
  return publishInstagramMedia(accessToken, instagramAccountId, creation_id);
}

// Create carousel container (for multiple images)
export async function createInstagramCarouselContainer(
  accessToken: string,
  instagramAccountId: string,
  mediaUrls: string[],
  caption?: string
): Promise<{ creation_id: string }> {
  // First, create containers for each image
  const childContainers: string[] = [];

  for (const imageUrl of mediaUrls) {
    const params = new URLSearchParams({
      image_url: imageUrl,
      is_carousel_item: 'true',
      access_token: accessToken,
    });

    const response = await fetch(`${FACEBOOK_API_BASE}/${instagramAccountId}/media?${params.toString()}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to create carousel item container');
    }

    const data = await response.json();
    childContainers.push(data.id);
  }

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Create carousel container
  const params = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childContainers.join(','),
    access_token: accessToken,
  });

  if (caption) {
    params.append('caption', caption);
  }

  const response = await fetch(`${FACEBOOK_API_BASE}/${instagramAccountId}/media?${params.toString()}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Instagram carousel container: ${error}`);
  }

  const data = await response.json();
  return { creation_id: data.id };
}
