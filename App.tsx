
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PostCard from './components/PostCard';
import PostComposer from './components/PostComposer';
import MediaLibrary from './components/MediaLibrary';
import Analytics from './components/Analytics';
import TeamPeople from './components/TeamPeople';
import Settings from './components/Settings';
import Inspiration from './components/Inspiration';
import { Post, PostStatus, View } from './types';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { getPosts, savePost } from './services/storage';

const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'all'>('all');

  // Load posts on mount
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const fetchedPosts = await getPosts();
            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  const filteredPosts = useMemo(() => {
    let sorted = [...posts].sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first
    if (filterStatus !== 'all') {
      sorted = sorted.filter(p => p.status === filterStatus);
    }
    return sorted;
  }, [posts, filterStatus]);

  const handleSavePost = async (newPostData: Omit<Post, 'id' | 'author' | 'comments'>, newComment?: string) => {
    
    let updatedComments = selectedPost ? [...selectedPost.comments] : [];
    if (newComment) {
        updatedComments.push({
            id: Date.now().toString(),
            author: 'You',
            text: newComment,
            createdAt: new Date()
        });
    }

    const postToSave: Post = selectedPost 
        ? { ...selectedPost, ...newPostData, comments: updatedComments }
        : {
            id: Date.now().toString(),
            author: 'Acme Corp',
            comments: updatedComments,
            ...newPostData
          };

    // Optimistic UI Update
    setPosts(prev => {
        if (selectedPost) {
            return prev.map(p => p.id === postToSave.id ? postToSave : p);
        } else {
            return [postToSave, ...prev];
        }
    });

    // Save to Backend
    await savePost(postToSave);
    
    setSelectedPost(null);
  };

  const openComposer = (post?: Post) => {
    setSelectedPost(post || null);
    setIsComposerOpen(true);
  };

  // Used when creating a post from Inspiration view
  const handleDraftFromInspiration = (content: string) => {
      setSelectedPost({
          id: '',
          content: content,
          platform: 'linkedin', // Default
          date: new Date(),
          status: 'draft',
          author: 'Acme Corp',
          comments: []
      } as Post);
      setIsComposerOpen(true);
  };

  const renderContent = () => {
      if (isLoading && view === 'feed') {
          return (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Loader2 className="animate-spin mb-3" size={32} />
                  <p>Loading your workspace...</p>
              </div>
          );
      }

      switch (view) {
          case 'inspiration':
              return <Inspiration onDraftPost={handleDraftFromInspiration} />;
          case 'media':
              return <MediaLibrary />;
          case 'analytics':
              return <Analytics />;
          case 'team':
              return <TeamPeople />;
          case 'settings':
              return <Settings />;
          case 'calendar':
              return (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[700px] animate-fade-in-up">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 border-t border-l border-gray-100 bg-gray-50">
                        {Array.from({ length: 35 }).map((_, i) => {
                            const today = new Date();
                            const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + i);
                            const isToday = currentDay.getDate() === new Date().getDate() && currentDay.getMonth() === new Date().getMonth();

                            const dayPosts = filteredPosts.filter(p => {
                                return p.date.getDate() === currentDay.getDate() && p.date.getMonth() === currentDay.getMonth();
                            });

                            return (
                                <div key={i} className={`min-h-[120px] bg-white border-r border-b border-gray-100 p-2 transition-colors relative hover:bg-gray-50 ${isToday ? 'bg-indigo-50/10' : ''}`}>
                                    <span className={`absolute top-2 right-2 text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400'}`}>
                                        {currentDay.getDate()}
                                    </span>
                                    <div className="mt-8 flex flex-col gap-1.5">
                                        {dayPosts.map(post => (
                                            <div 
                                                key={post.id} 
                                                onClick={() => openComposer(post)}
                                                className="group cursor-pointer p-1.5 rounded text-[10px] font-medium border shadow-sm truncate flex items-center gap-1.5 bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:shadow-md transition-all"
                                            >
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                post.platform === 'instagram' ? 'bg-pink-500' : 
                                                post.platform === 'twitter' ? 'bg-black' : 
                                                post.platform === 'linkedin' ? 'bg-blue-700' : 'bg-blue-600'
                                            }`} />
                                            <span className="truncate">{post.content}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
              );
          case 'feed':
          default:
              return (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 animate-fade-in-up">
                    <div className="break-inside-avoid mb-6">
                        <button 
                            onClick={() => openComposer()}
                            className="w-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer group p-8 bg-gray-50"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 flex items-center justify-center mb-3 transition-colors">
                                <Plus size={24} className="text-gray-400 group-hover:text-indigo-600"/>
                            </div>
                            <span className="font-semibold text-sm">Create Post</span>
                        </button>
                    </div>

                    {filteredPosts.map(post => (
                        <PostCard key={post.id} post={post} onClick={() => openComposer(post)} />
                    ))}
                </div>
              );
      }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-gray-900">
      <Sidebar 
        view={view} 
        setView={setView} 
        onNewPost={() => openComposer()} 
      />
      
      <main className="ml-64 p-8 min-h-screen">
        {/* Workspace Header - Only show on Feed/Calendar for cleanliness, or conditionally modify */}
        {(view === 'feed' || view === 'calendar') && (
             <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                        <span>Acme Corp</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-indigo-600">Marketing Campaign Q3</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {view === 'feed' ? 'Content Feed' : 'Calendar Overview'}
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search posts..." 
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm w-full md:w-64 transition-all"
                        />
                    </div>
                    
                    {/* Filter */}
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <button 
                            onClick={() => setFilterStatus('all')}
                            className={`p-1.5 rounded transition-all ${filterStatus === 'all' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600'}`}
                            title="All"
                        >
                            <Filter size={16} />
                        </button>
                        <div className="w-px bg-gray-200 mx-1 my-1"></div>
                        {(['draft', 'approved'] as const).map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                                    filterStatus === status 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </header>
        )}

        {renderContent()}

      </main>

      <PostComposer 
        isOpen={isComposerOpen} 
        onClose={() => setIsComposerOpen(false)} 
        onSave={handleSavePost}
        initialPost={selectedPost}
        key={selectedPost?.id || 'new'}
      />
    </div>
