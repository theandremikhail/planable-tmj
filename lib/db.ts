import { sql } from '@vercel/postgres';

// Initialize database tables
export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS social_accounts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      platform VARCHAR(50) NOT NULL,
      platform_user_id VARCHAR(255) NOT NULL,
      platform_username VARCHAR(255),
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TIMESTAMP,
      page_id VARCHAR(255),
      page_access_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, platform, platform_user_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      media_url TEXT,
      media_type VARCHAR(50),
      platform VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      scheduled_at TIMESTAMP,
      published_at TIMESTAMP,
      platform_post_id VARCHAR(255),
      social_account_id INTEGER REFERENCES social_accounts(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      author VARCHAR(255) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create index for scheduled posts lookup
  await sql`
    CREATE INDEX IF NOT EXISTS idx_posts_scheduled
    ON posts(scheduled_at)
    WHERE status = 'scheduled' AND scheduled_at IS NOT NULL
  `;
}

// Helper to get or create a default user (simplified for demo)
export async function getOrCreateUser(email: string = 'demo@example.com') {
  const existing = await sql`SELECT * FROM users WHERE email = ${email}`;

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await sql`
    INSERT INTO users (email, name)
    VALUES (${email}, 'Demo User')
    RETURNING *
  `;

  return result.rows[0];
}

export { sql };
