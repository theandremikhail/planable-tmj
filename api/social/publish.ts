import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getOrCreateUser } from '../../lib/db.js';
import { publishToSocialMedia } from '../../lib/social/index.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getOrCreateUser();
  const { postId, accountId } = req.body;

  if (!postId || !accountId) {
    return res.status(400).json({ error: 'Missing postId or accountId' });
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

    // Verify account belongs to user
    const accountResult = await sql`
      SELECT * FROM social_accounts WHERE id = ${accountId} AND user_id = ${user.id}
    `;

    if (accountResult.rows.length === 0) {
      return res.status(404).json({ error: 'Social account not found' });
    }

    // Publish to social media
    const result = await publishToSocialMedia(accountId, post.content, post.media_url);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Update post status
    await sql`
      UPDATE posts
      SET status = 'published',
          published_at = CURRENT_TIMESTAMP,
          platform_post_id = ${result.platformPostId},
          social_account_id = ${accountId},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${postId}
    `;

    res.json({
      success: true,
      platformPostId: result.platformPostId,
      message: 'Post published successfully'
    });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ error: 'Failed to publish post' });
  }
}
