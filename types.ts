export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'facebook';

export type PostStatus = 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';

export interface Post {
  id: string;
  content: string;
  mediaUrl?: string; // URL for preview (blob or base64)
  platform: Platform;
  date: Date;
  status: PostStatus;
  author: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
}

export interface AIRequestOptions {
  type: 'draft' | 'improve' | 'shorten' | 'expand' | 'hashtags';
  tone?: string;
  platform?: Platform;
  currentText?: string;
  topic?: string;
}
