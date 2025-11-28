import React from 'react';
import { Post } from '../types';
import { PLATFORMS } from '../constants';
import { Calendar, CheckCircle2, Circle, Clock, MessageSquare, MoreVertical, Edit2 } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const PostStatusBadge: React.FC<{ status: Post['status'] }> = ({ status }) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    published: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const icons = {
    draft: <Circle size={12} className="fill-gray-400 stroke-none" />,
    pending: <Clock size={12} />,
    approved: <CheckCircle2 size={12} />,
    scheduled: <Calendar size={12} />,
    published: <CheckCircle2 size={12} className="fill-purple-200" />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      <span className="capitalize">{status}</span>
    </span>
  );
};

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const platform = PLATFORMS.find(p => p.id === post.platform);
  
  return (
    <div 
        onClick={onClick}
        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
        <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${platform?.color.replace('text-', 'bg-').replace('600', '50').replace('700', '50').replace('900', '50')} ${platform?.color}`}>
                {platform?.icon}
            </div>
            <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500">{post.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span className="text-xs text-gray-400">{post.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        </div>
        <PostStatusBadge status={post.status} />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {post.mediaUrl && (
            <div className="w-full h-32 rounded-lg bg-gray-100 overflow-hidden relative">
                <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
        )}
        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {post.content || <span className="text-gray-400 italic">No text content...</span>}
        </p>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                <img src={`https://ui-avatars.com/api/?name=${post.author}&background=random`} className="w-5 h-5 rounded-full" alt="avatar" />
                <span className="truncate max-w-[80px]">{post.author.split(' ')[0]}</span>
            </div>
            {post.comments.length > 0 && (
                <div className="flex items-center gap-1 text-gray-600 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    <MessageSquare size={12} />
                    <span>{post.comments.length}</span>
                </div>
            )}
         </div>
         <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white hover:shadow-sm rounded-md text-gray-600">
             <Edit2 size={14} />
         </button>
      </div>
    </div>
  );
};

export default PostCard;
