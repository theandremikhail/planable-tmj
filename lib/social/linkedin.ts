// LinkedIn API Integration
// Docs: https://learn.microsoft.com/en-us/linkedin/marketing/

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';
const LINKEDIN_OAUTH_BASE = 'https://www.linkedin.com/oauth/v2';

interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function getConfig(): LinkedInConfig {
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
  };
}

// Generate OAuth 2.0 authorization URL
export function getLinkedInAuthUrl(state: string): string {
  const config = getConfig();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: 'openid profile email w_member_social',
    state,
  });

  return `${LINKEDIN_OAUTH_BASE}/authorization?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeLinkedInCode(code: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}> {
  const config = getConfig();

  const response = await fetch(`${LINKEDIN_OAUTH_BASE}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token exchange failed: ${error}`);
  }

  return response.json();
}

// Refresh access token
export async function refreshLinkedInToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}> {
  const config = getConfig();

  const response = await fetch(`${LINKEDIN_OAUTH_BASE}/accessToken`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LinkedIn token refresh failed: ${error}`);
  }

  return response.json();
}

// Get authenticated user info
export async function getLinkedInUser(accessToken: string): Promise<{
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
}> {
  const response = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get LinkedIn user: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.sub,
    localizedFirstName: data.given_name,
    localizedLastName: data.family_name,
  };
}

// Get user's LinkedIn URN (needed for posting)
export async function getLinkedInUrn(accessToken: string): Promise<string> {
  const user = await getLinkedInUser(accessToken);
  return `urn:li:person:${user.id}`;
}

// Create a text post on LinkedIn
export async function postToLinkedIn(
  accessToken: string,
  authorUrn: string,
  text: string,
  mediaUrn?: string
): Promise<{ id: string }> {
  const body: any = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text,
        },
        shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  if (mediaUrn) {
    body.specificContent['com.linkedin.ugc.ShareContent'].media = [
      {
        status: 'READY',
        media: mediaUrn,
      },
    ];
  }

  const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post to LinkedIn: ${error}`);
  }

  const postId = response.headers.get('x-restli-id') || '';
  return { id: postId };
}

// Register image upload
export async function registerLinkedInImageUpload(
  accessToken: string,
  authorUrn: string
): Promise<{ uploadUrl: string; asset: string }> {
  const response = await fetch(`${LINKEDIN_API_BASE}/assets?action=registerUpload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: authorUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to register LinkedIn image upload: ${error}`);
  }

  const data = await response.json();
  return {
    uploadUrl: data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl,
    asset: data.value.asset,
  };
}

// Upload image to LinkedIn
export async function uploadLinkedInImage(
  accessToken: string,
  authorUrn: string,
  imageData: Buffer
): Promise<string> {
  const { uploadUrl, asset } = await registerLinkedInImageUpload(accessToken, authorUrn);

  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    },
    body: imageData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to LinkedIn');
  }

  return asset;
}
