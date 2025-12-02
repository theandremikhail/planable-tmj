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

// Simple in-memory store for OAuth state (use Redis in production)
const oauthStateStore = new Map<string, {
  platform: string;
  codeVerifier?: string;
  userId: number;
  createdAt: number;
}>();

// Clean up expired states (older than 10 minutes)
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [key, value] of oauthStateStore.entries()) {
    if (now - value.createdAt > 10 * 60 * 1000) {
      oauthStateStore.delete(key);
    }
  }
}

export function storeOAuthState(
  state: string,
  platform: string,
  userId: number,
  codeVerifier?: string
): void {
  cleanupExpiredStates();
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
    oauthStateStore.delete(state); // One-time use
    return { platform: data.platform, codeVerifier: data.codeVerifier, userId: data.userId };
  }
  return null;
}
