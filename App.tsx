import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import PostComposer from './components/PostComposer';
import { Post, PostStatus } from './types';
import { INITIAL_POSTS } from './constants';
import { Filter, Search, SortAsc, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'feed' | 'calendar'>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');

  const filteredPosts = useMemo(() => {
    let sorted = [...posts].sort((a, b) => a.date.getTime() - b.date.getTime());
    if (filterStatus !== 'all') {
      sorted = sorted.filter(p => p.status === filterStatus);
    }
    return sorted;
  }, [posts, filterStatus]);

  const handleSavePost = (newPostData: Omit<Post, 'id' | 'author' | 'comments'>) => {
    if (selectedPost) {
      // Edit existing
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, ...newPostData } : p));
    } else {
      // Create new
      const newPost: Post = {
        id: Date.now().toString(),
        author: 'You',
        comments: [],
        ...newPostData
      };
      setPosts(prev => [...prev, newPost]);
    }
    setSelectedPost(null);
  };

  const openComposer = (post?: Post) => {
    setSelectedPost(post || null);
    setIsComposerOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        view={view} 
        setView={setView} 
        onNewPost={() => openComposer()} 
      />
      
      <main className="ml-64 p-8 min-h-screen">
        {/* Top Bar */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {view === 'feed' ? 'Content Feed' : 'Calendar Schedule'}
                </h1>
                <p className="text-gray-500 text-sm">Manage and schedule your social media presence.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search posts..." 
                        className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                    />
                </div>
                
                <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button 
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilterStatus('draft')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 'draft' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Drafts
                    </button>
                    <button 
                        onClick={() => setFilterStatus('scheduled')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 'scheduled' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Scheduled
                    </button>
                </div>
            </div>
        </header>

        {/* Content Area */}
        {view === 'feed' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map(post => (
                    <div key={post.id} className="h-full">
                        <PostCard post={post} onClick={() => openComposer(post)} />
                    </div>
                ))}
                
                {/* Empty State / Add New Card */}
                <button 
                    onClick={() => openComposer()}
                    className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50/50 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
                        <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="font-medium">Create New Post</span>
                </button>
             </div>
        ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[600px]">
                {/* Simplified Calendar Simulation */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                            {day}
                        </div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                        const dayPosts = filteredPosts.filter(p => {
                            // Mock distribution for visual demo - simplistic matching
                            // In real app, match actual dates
                            const d = new Date();
                            d.setDate(d.getDate() + (i - 5)); // shift days around
                            return p.date.getDate() === d.getDate() && p.date.getMonth() === d.getMonth();
                        });

                        return (
                            <div key={i} className="bg-white min-h-[120px] p-2 hover:bg-gray-50 transition-colors">
                                <div className="text-right text-xs text-gray-400 mb-2">{i + 1}</div>
                                <div className="space-y-1">
                                    {dayPosts.map(post => (
                                         <div 
                                            key={post.id} 
                                            onClick={() => openComposer(post)}
                                            className="text-[10px] p-1.5 rounded border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md cursor-pointer transition-all truncate"
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${post.status === 'scheduled' ? 'bg-blue-500' : post.status === 'approved' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                            {post.content.substring(0, 15)}...
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
      </main>

      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={handleSavePost}
        initialPost={selectedPost}
        key={selectedPost?.id || 'new'} // Force re-render on switch
      />
    </div>
  );
};

export default App;
