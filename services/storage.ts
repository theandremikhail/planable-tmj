
import { Post, AppSettings, TeamMember } from '../types';
import { INITIAL_POSTS, INITIAL_TEAM } from '../constants';

const KEYS = {
  POSTS: 'planai_posts',
  SETTINGS: 'planai_settings',
  TEAM: 'planai_team',
};

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Posts ---
export const getPosts = async (): Promise<Post[]> => {
  await delay(300); // Simulate network
  const data = localStorage.getItem(KEYS.POSTS);
  if (!data) {
    // Seed data
    localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    return INITIAL_POSTS;
  }
  // Parse dates back to Date objects
  const posts = JSON.parse(data, (key, value) => {
    if (key === 'date' || key === 'createdAt') return new Date(value);
    return value;
  });
  return posts;
};

export const savePost = async (post: Post): Promise<Post> => {
  await delay(300);
  const posts = await getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  
  let newPosts;
  if (index >= 0) {
    newPosts = [...posts];
    newPosts[index] = post;
  } else {
    newPosts = [post, ...posts];
  }
  
  localStorage.setItem(KEYS.POSTS, JSON.stringify(newPosts));
  return post;
};

// --- Settings ---
const DEFAULT_SETTINGS: AppSettings = {
  workspaceName: 'Acme Corp',
  connections: { instagram: false, linkedin: false, twitter: false, facebook: false }
};

export const getSettings = async (): Promise<AppSettings> => {
  await delay(200);
  const data = localStorage.getItem(KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveSettings = async (settings: AppSettings): Promise<AppSettings> => {
  await delay(400);
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  return settings;
};

// --- Team ---
export const getTeam = async (): Promise<TeamMember[]> => {
  await delay(200);
  const data = localStorage.getItem(KEYS.TEAM);
  if (!data) {
    localStorage.setItem(KEYS.TEAM, JSON.stringify(INITIAL_TEAM));
    return INITIAL_TEAM;
  }
  return JSON.parse(data);
};

export const addTeamMember = async (member: TeamMember): Promise<TeamMember[]> => {
    await delay(300);
    const team = await getTeam();
    const newTeam = [...team, member];
    localStorage.setItem(KEYS.TEAM, JSON.stringify(newTeam));
    return newTeam;
}
