import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeDatabase } from '../../lib/db';

// One-time endpoint to initialize database tables
// Call this once after setting up Vercel Postgres

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests with the correct secret
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secret } = req.body;

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await initializeDatabase();
    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
