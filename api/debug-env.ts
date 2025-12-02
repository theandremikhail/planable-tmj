import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID ? 'SET (starts with: ' + process.env.TWITTER_CLIENT_ID.substring(0, 5) + ')' : 'NOT SET',
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
  });
}
