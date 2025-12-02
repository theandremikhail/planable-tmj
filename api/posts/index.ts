import type { VercelRequest, VercelResponse } from '@vercel/node';

// Check if we're in mock mode (no database configured)
const isMockMode = !process.env.POSTGRES_URL;

// In-memory mock data for local development
let mockPosts = [
  {
    id: 1,
    user_id: 1,
    content: '🚀 Excited to announce our new feature launch! #ProductLaunch #TechNews',
    media_url: 'https://picsum.photos/800/400',
    platform: 'twitter',
    status: 'draft',
    scheduled_at: null,
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  },
  {
    id: 2,
    user_id: 1,
    content: 'Behind the scenes at our annual team retreat! 🌲 #TeamBuilding',
    media_url: 'https://picsum.photos/600/600',
    platform: 'instagram',
    status: 'scheduled',
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    published_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  },
  {
    id: 3,
    user_id: 1,
    content: 'Market trends for 2024 show a significant shift towards AI-driven productivity tools. Here are 5 takeaways for business leaders.',
    media_url: 'https://picsum.photos/800/800',
    platform: 'linkedin',
    status: 'published',
    scheduled_at: null,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    comments: []
  }
];
let nextId = 4;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (isMockMode) {
    console.log('[Mock Mode] No POSTGRES_URL configured, using in-memory data');
    return handleMockMode(req, res);
  }

  // Real database mode
  const { sql, getOrCreateUser } = await import('../../lib/db.js');
  const user = await getOrCreateUser();

  switch (req.method) {
    case 'GET':
      return getPosts(sql, user.id, req, res);
    case 'POST':
      return createPost(sql, user.id, req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Mock handlers for local development without database
function handleMockMode(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      return res.json({ posts: mockPosts, mock: true });
    case 'POST':
      const newPost = {
        id: nextId++,
        user_id: 1,
        content: req.body.content,
        media_url: req.body.mediaUrl || null,
        platform: req.body.platform,
        status: req.body.status || 'draft',
        scheduled_at: req.body.scheduledAt || null,
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments: []
      };
      mockPosts.push(newPost);
      return res.status(201).json({ post: newPost, mock: true });
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPosts(sql: any, userId: number, req: VercelRequest, res: VercelResponse) {
  try {
    const { limit = '50', offset = '0' } = req.query;

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
      WHERE p.user_id = ${userId}
      GROUP BY p.id, sa.platform_username
      ORDER BY COALESCE(p.scheduled_at, p.created_at) DESC
      LIMIT ${parseInt(limit as string)}
      OFFSET ${parseInt(offset as string)}
    `;

    res.json({ posts: result.rows });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

async function createPost(sql: any, userId: number, req: VercelRequest, res: VercelResponse) {
  try {
    const { content, mediaUrl, mediaType, platform, status, scheduledAt, socialAccountId } = req.body;

    if (!content || !platform) {
      return res.status(400).json({ error: 'Missing required fields: content, platform' });
    }

    const result = await sql`
      INSERT INTO posts (
        user_id, content, media_url, media_type, platform,
        status, scheduled_at, social_account_id
      ) VALUES (
        ${userId}, ${content}, ${mediaUrl || null}, ${mediaType || null},
        ${platform}, ${status || 'draft'},
        ${scheduledAt ? new Date(scheduledAt).toISOString() : null},
        ${socialAccountId || null}
      )
      RETURNING *
    `;

    res.status(201).json({ post: result.rows[0] });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}
