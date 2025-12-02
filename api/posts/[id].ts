import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, getOrCreateUser } from '../../lib/db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await getOrCreateUser();
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const postId = parseInt(id);

  switch (req.method) {
    case 'GET':
      return getPost(user.id, postId, res);
    case 'PUT':
      return updatePost(user.id, postId, req, res);
    case 'DELETE':
      return deletePost(user.id, postId, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPost(userId: number, postId: number, res: VercelResponse) {
  try {
    const result = await sql`
      SELECT p.*,
             sa.platform_username as account_username,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', c.id,
                   'author', c.author,
                   'text', c.text,
                   'created_at', c.created_at
                 )
               ) FILTER (WHERE c.id IS NOT NULL),
               '[]'
             ) as comments
      FROM posts p
      LEFT JOIN social_accounts sa ON p.social_account_id = sa.id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.id = ${postId} AND p.user_id = ${userId}
      GROUP BY p.id, sa.platform_username
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
}

async function updatePost(userId: number, postId: number, req: VercelRequest, res: VercelResponse) {
  try {
    const { content, mediaUrl, mediaType, platform, status, scheduledAt, socialAccountId } = req.body;

    // First verify the post belongs to user and isn't published
    const existing = await sql`
      SELECT * FROM posts WHERE id = ${postId} AND user_id = ${userId}
    `;

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.rows[0].status === 'published') {
      return res.status(400).json({ error: 'Cannot edit published posts' });
    }

    const result = await sql`
      UPDATE posts
      SET content = COALESCE(${content}, content),
          media_url = COALESCE(${mediaUrl}, media_url),
          media_type = COALESCE(${mediaType}, media_type),
          platform = COALESCE(${platform}, platform),
          status = COALESCE(${status}, status),
          scheduled_at = ${scheduledAt ? new Date(scheduledAt).toISOString() : existing.rows[0].scheduled_at},
          social_account_id = COALESCE(${socialAccountId}, social_account_id),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${postId} AND user_id = ${userId}
      RETURNING *
    `;

    res.json({ post: result.rows[0] });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
}

async function deletePost(userId: number, postId: number, res: VercelResponse) {
  try {
    const result = await sql`
      DELETE FROM posts
      WHERE id = ${postId} AND user_id = ${userId}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, deletedId: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
}
