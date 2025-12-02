import type { VercelRequest, VercelResponse } from '@vercel/node';

// Check if we're in mock mode (no database configured)
const isMockMode = !process.env.POSTGRES_URL;

// Mock accounts for local development
let mockAccounts: any[] = [
  {
    id: 1,
    platform: 'twitter',
    platform_username: 'demo_twitter',
    platform_user_id: '123456',
    page_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    token_expired: false
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (isMockMode) {
    console.log('[Mock Mode] No POSTGRES_URL configured, using in-memory data');
    return handleMockMode(req, res);
  }

  // Real database mode
  const { sql, getOrCreateUser } = await import('../../lib/db');
  const user = await getOrCreateUser();

  switch (req.method) {
    case 'GET':
      return getAccounts(sql, user.id, res);
    case 'DELETE':
      return disconnectAccount(sql, user.id, req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Mock handlers for local development
function handleMockMode(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      return res.json({ accounts: mockAccounts, mock: true });
    case 'DELETE':
      const { accountId } = req.query;
      const id = parseInt(accountId as string);
      mockAccounts = mockAccounts.filter(a => a.id !== id);
      return res.json({ success: true, deletedId: id, mock: true });
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getAccounts(sql: any, userId: number, res: VercelResponse) {
  try {
    const result = await sql`
      SELECT
        id, platform, platform_username, platform_user_id,
        page_id, created_at, updated_at,
        CASE WHEN token_expires_at IS NOT NULL AND token_expires_at < NOW()
             THEN true ELSE false END as token_expired
      FROM social_accounts
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json({ accounts: result.rows });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    res.status(500).json({ error: 'Failed to fetch social accounts' });
  }
}

async function disconnectAccount(sql: any, userId: number, req: VercelRequest, res: VercelResponse) {
  const { accountId } = req.query;

  if (typeof accountId !== 'string') {
    return res.status(400).json({ error: 'Missing accountId' });
  }

  try {
    const result = await sql`
      DELETE FROM social_accounts
      WHERE id = ${parseInt(accountId)} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ success: true, deletedId: result.rows[0].id });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
}
