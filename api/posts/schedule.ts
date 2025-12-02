import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getOrCreateUser } from '../../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getOrCreateUser();
  const { postId, scheduledAt, socialAccountId } = req.body;

  if (!postId || !scheduledAt || !socialAccountId) {
    return res.status(400).json({ error: 'Missing required fields: postId, scheduledAt, socialAccountId' });
  }

  try {
    // Verify post belongs to user
    const postResult = await sql`
      SELECT * FROM posts WHERE id = ${postId} AND user_id = ${user.id}
    `;

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    if (post.status === 'published') {
      return res.status(400).json({ error: 'Cannot schedule an already published post' });
    }

    // Verify account belongs to user and matches platform
    const accountResult = await sql`
      SELECT * FROM social_accounts
      WHERE id = ${socialAccountId} AND user_id = ${user.id}
    `;

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Social account not found' });
    }

    const account = accountResult.rows[0];

    if (account.platform !== post.platform) {
      return res.status(400).json({
        error: `Account platform (${account.platform}) does not match post platform (${post.platform})`
      });
    }

    // Schedule the post
    const scheduledDate = new Date(scheduledAt);

    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const result = await sql`
      UPDATE posts
      SET status = 'scheduled',
          scheduled_at = ${scheduledDate.toISOString()},
          social_account_id = ${socialAccountId},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${postId} AND user_id = ${user.id}
      RETURNING *
    `;

    res.json({
      success: true,
      post: result.rows[0],
      message: `Post scheduled for ${scheduledDate.toISOString()}`
    });
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ error: 'Failed to schedule post' });
  }
}
