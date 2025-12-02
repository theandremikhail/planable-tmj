import { createHash, randomBytes } from 'crypto';

// Generate a random state parameter for OAuth
export function generateState(): string {
  return randomBytes(32).toString('hex');
}

// Generate PKCE code verifier (for Twitter)
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url');
}

// Generate PKCE code challenge from verifier
export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

// Encode OAuth state data for cookie storage
export function encodeOAuthState(data: {
  state: string;
  platform: string;
  userId: number;
  codeVerifier?: string;
}): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

// Decode OAuth state data from cookie
export function decodeOAuthState(encoded: string): {
  state: string;
  platform: string;
  userId: number;
  codeVerifier?: string;
} | null {
  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Legacy functions kept for compatibility but now use cookies
// These are no longer needed but kept to avoid breaking imports
const oauthStateStore = new Map<string, {
  platform: string;
  codeVerifier?: string;
  userId: number;
  createdAt: number;
}>();

export function storeOAuthState(
  state: string,
  platform: string,
  userId: number,
  codeVerifier?: string
): void {
  // Store in memory as backup (won't work across serverless invocations)
  oauthStateStore.set(state, {
    platform,
    codeVerifier,
    userId,
    createdAt: Date.now()
  });
}

export function getOAuthState(state: string): {
  platform: string;
  codeVerifier?: string;
  userId: number;
} | null {
  const data = oauthStateStore.get(state);
  if (data) {
    oauthStateStore.delete(state);
    return { platform: data.platform, codeVerifier: data.codeVerifier, userId: data.userId };
  }
  return null;
}
