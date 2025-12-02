import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db.js';
import { publishToSocialMedia } from '../../lib/social/index.js';

// This endpoint is called by Vercel Cron to publish scheduled posts
// Configure in vercel.json with a cron schedule

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is called by Vercel Cron (in production)
  const authHeader = req.headers.authorization;
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find posts that are scheduled and due
    const result = await sql`
      SELECT p.*, sa.id as account_id
      FROM posts p
      JOIN social_accounts sa ON p.social_account_id = sa.id
      WHERE p.status = 'scheduled'
        AND p.scheduled_at IS NOT NULL
        AND p.scheduled_at <= NOW()
      ORDER BY p.scheduled_at ASC
      LIMIT 10
    `;

    const posts = result.rows;
    const results: Array<{
      postId: number;
      success: boolean;
      error?: string;
      platformPostId?: string;
    }> = [];

    for (const post of posts) {
      try {
        // Mark as publishing to prevent duplicate processing
        await sql`
          UPDATE posts SET status = 'publishing' WHERE id = ${post.id}
        `;

        const publishResult = await publishToSocialMedia(
          post.account_id,
          post.content,
          post.media_url
        );

        if (publishResult.success) {
          await sql`
            UPDATE posts
            SET status = 'published',
                published_at = CURRENT_TIMESTAMP,
                platform_post_id = ${publishResult.platformPostId},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${post.id}
          `;

          results.push({
            postId: post.id,
            success: true,
            platformPostId: publishResult.platformPostId
          });
        } else {
          // Revert to scheduled on failure
          await sql`
            UPDATE posts SET status = 'scheduled' WHERE id = ${post.id}
          `;

          results.push({
            postId: post.id,
            success: false,
            error: publishResult.error
          });
        }
      } catch (error) {
        // Revert to scheduled on error
        await sql`
          UPDATE posts SET status = 'scheduled' WHERE id = ${post.id}
        `;

        results.push({
          postId: post.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      processed: posts.length,
      results
    });
  } catch (error) {
    console.error('Cron job error:', error);
    res.status(500).json({ error: 'Failed to process scheduled posts' });
  }
}
