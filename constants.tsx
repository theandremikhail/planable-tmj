import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Platform, Post } from './types';
import React from 'react';

export const PLATFORMS: { id: Platform; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} />, color: 'text-pink-600' },
  { id: 'twitter', name: 'X / Twitter', icon: <Twitter size={18} />, color: 'text-gray-900' },
  { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin size={18} />, color: 'text-blue-700' },
  { id: 'facebook', name: 'Facebook', icon: <Facebook size={18} />, color: 'text-blue-600' },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    content: '🚀 Excited to announce our new feature launch! We have been working hard on this for months. Check out the link in bio for more details. #ProductLaunch #TechNews',
    platform: 'twitter',
    date: new Date(Date.now() + 86400000), // Tomorrow
    status: 'approved',
    author: 'Alex Design',
    comments: [],
    mediaUrl: 'https://picsum.photos/800/400',
  },
  {
    id: '2',
    content: 'Behind the scenes at our annual team retreat! 🌲 We believe in work-life balance and recharging in nature.',
    platform: 'instagram',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    status: 'draft',
    author: 'Sarah Social',
    comments: [
      { id: 'c1', author: 'Mike Manager', text: 'Can we add a call to action?', createdAt: new Date() }
    ],
    mediaUrl: 'https://picsum.photos/600/600',
  },
  {
    id: '3',
    content: 'Market trends for 2024 show a significant shift towards AI-driven productivity tools. Here are 5 takeaways for business leaders.',
    platform: 'linkedin',
    date: new Date(Date.now() - 86400000), // Yesterday
    status: 'published',
    author: 'David CEO',
    comments: [],
    mediaUrl: 'https://picsum.photos/800/800',
  },
];
