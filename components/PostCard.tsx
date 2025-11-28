import React from 'react';
import { Post } from '../types';
import PlatformPreview from './PlatformPreview';
import { MessageSquare, CheckCircle2, Clock, Circle, AlertCircle } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const PostStatusIndicator: React.FC<{ status: Post['status'] }> = ({ status }) => {
  const config = {
    draft: { color: 'bg-gray-200', icon: <Circle size={12} className="text-gray-500 fill-gray-500" /> },
    pending: { color: 'bg-yellow-400', icon: <Clock size={12} className="text-white" /> },
    approved: { color: 'bg-green-500', icon: <CheckCircle2 size={12} className="text-white" /> },
    scheduled: { color: 'bg-blue-500', icon: <Clock size={12} className="text-white" /> },
    published: { color: 'bg-purple-500', icon: <CheckCircle2 size={12} className="text-white" /> },
  };

  const { color, icon } = config[status];

  return (
    <div className={`w-6 h-6 rounded-full ${status === 'draft' ? 'bg-gray-100 border border-gray-200' : color} flex items-center justify-center shadow-sm`}>
      {icon}
    </div>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <div className="relative group break-inside-avoid mb-6">
       {/* Card Container */}
      <div 
        onClick={onClick}
        className="relative cursor-pointer transition-all duration-200 hover:-translate-y-1"
      >
          {/* Main content wrapper */}
          <div className="relative">
             <PlatformPreview 
                platform={post.platform} 
                content={post.content} 
                mediaUrl={post.mediaUrl}
                author={post.author}
                date={post.date}
             />
             
             {/* Hover Overlay */}
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-xl pointer-events-none" />
          </div>

          {/* Floating Action/Status Bar - Appears on hover or stays simplified */}
          <div className="absolute -top-3 -right-3 transition-transform duration-200 scale-90 group-hover:scale-100 z-10">
              <PostStatusIndicator status={post.status} />
          </div>

          {/* Meta Footer */}
          <div className="mt-2 flex items-center justify-between px-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide bg-gray-100 px-1.5 py-0.5 rounded">
                    {post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
            </div>
            
            {post.comments.length > 0 && (
                 <div className="flex items-center gap-1 text-gray-500 bg-white px-1.5 py-0.5 rounded-full shadow-sm border border-gray-100">
                    <MessageSquare size={10} className="fill-gray-400 stroke-none" />
                    <span className="text-[10px] font-bold">{post.comments.length}</span>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default PostCard;