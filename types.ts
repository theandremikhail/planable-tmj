
export type Platform = 'instagram' | 'twitter' | 'linkedin' | 'facebook';

export type PostStatus = 'draft' | 'pending' | 'approved' | 'scheduled' | 'published';

export type View = 'feed' | 'calendar' | 'media' | 'analytics' | 'team' | 'settings' | 'inspiration';

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

export interface AppSettings {
  workspaceName: string;
  connections: {
    instagram: boolean;
    linkedin: boolean;
    twitter: boolean;
    facebook: boolean;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  status: 'Active' | 'Pending';
}

export interface SearchResult {
  title: string;
  content: string;
  url?: string;
  source?: string;
}
