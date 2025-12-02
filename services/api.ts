// API client for backend services

const API_BASE = '/api';

// Posts API
export const postsApi = {
  async getAll(params?: { status?: string; platform?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.platform) searchParams.set('platform', params.platform);

    const response = await fetch(`${API_BASE}/posts?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  async get(id: number) {
    const response = await fetch(`${API_BASE}/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  async create(data: {
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    platform: string;
    status?: string;
    scheduledAt?: string;
    socialAccountId?: number;
  }) {
    const response = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  async update(id: number, data: Partial<{
    content: string;
    mediaUrl: string;
    mediaType: string;
    platform: string;
    status: string;
    scheduledAt: string;
    socialAccountId: number;
  }>) {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },

  async schedule(postId: number, scheduledAt: string, socialAccountId: number) {
    const response = await fetch(`${API_BASE}/posts/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, scheduledAt, socialAccountId }),
    });
    if (!response.ok) throw new Error('Failed to schedule post');
    return response.json();
  },
};

// Social Accounts API
export const socialApi = {
  async getAccounts() {
    const response = await fetch(`${API_BASE}/social/accounts`);
    if (!response.ok) throw new Error('Failed to fetch accounts');
    return response.json();
  },

  async disconnect(accountId: number) {
    const response = await fetch(`${API_BASE}/social/accounts?accountId=${accountId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to disconnect account');
    return response.json();
  },

  async publish(postId: number, accountId: number) {
    const response = await fetch(`${API_BASE}/social/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, accountId }),
    });
    if (!response.ok) throw new Error('Failed to publish post');
    return response.json();
  },

  // Get OAuth URL for connecting a platform
  getConnectUrl(platform: string) {
    return `${API_BASE}/auth/${platform}`;
  },
};

// AI Generation API
export const aiApi = {
  async generateContent(params: {
    type: 'draft' | 'improve' | 'shorten' | 'expand' | 'hashtags';
    tone?: string;
    platform?: string;
    currentText?: string;
    topic?: string;
  }) {
    const response = await fetch(`${API_BASE}/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error('Failed to generate content');
    return response.json();
  },

  async generateImage(prompt: string, aspectRatio?: string) {
    const response = await fetch(`${API_BASE}/ai/image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio }),
    });
    if (!response.ok) throw new Error('Failed to generate image');
    return response.json();
  },
};
