import React from 'react';
import { Platform } from '../types';
import { Heart, MessageCircle, Repeat, Send, Share, ThumbsUp, MoreHorizontal, Globe, Bookmark } from 'lucide-react';

interface PlatformPreviewProps {
  platform: Platform;
  content: string;
  mediaUrl?: string;
  author?: string;
  date?: Date;
}

const PlatformPreview: React.FC<PlatformPreviewProps> = ({ platform, content, mediaUrl, author = "You", date = new Date() }) => {
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Helper to render text with line breaks
  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (platform === 'twitter') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-md mx-auto shadow-sm font-sans text-sm">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=${author}&background=1DA1F2&color=fff`} alt={author} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 truncate">{author}</span>
              <span className="text-gray-500 truncate">@{author.replace(/\s+/g, '').toLowerCase()}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{formattedDate}</span>
            </div>
            <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words text-[15px] leading-snug">
              {renderText(content || "Drafting your tweet...")}
            </div>
            {mediaUrl && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 max-h-80">
                <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex justify-between mt-3 text-gray-500 max-w-xs">
              <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer group">
                <div className="p-2 rounded-full group-hover:bg-blue-50">
                  <MessageCircle size={18} />
                </div>
              </div>
              <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer group">
                 <div className="p-2 rounded-full group-hover:bg-green-50">
                  <Repeat size={18} />
                </div>
              </div>
              <div className="flex items-center gap-1 hover:text-pink-500 cursor-pointer group">
                 <div className="p-2 rounded-full group-hover:bg-pink-50">
                  <Heart size={18} />
                </div>
              </div>
              <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer group">
                 <div className="p-2 rounded-full group-hover:bg-blue-50">
                  <Share size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'instagram') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl max-w-[370px] mx-auto shadow-sm font-sans text-sm overflow-hidden">
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-[2px]">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                <img src={`https://ui-avatars.com/api/?name=${author}&background=random`} alt={author} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="font-semibold text-sm">{author.replace(/\s+/g, '').toLowerCase()}</span>
          </div>
          <MoreHorizontal size={20} className="text-gray-600" />
        </div>
        
        <div className="aspect-square bg-gray-100 w-full flex items-center justify-center overflow-hidden">
           {mediaUrl ? (
              <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <span className="text-xs">No Image</span>
              </div>
            )}
        </div>

        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-4">
              <Heart size={24} className="cursor-pointer hover:text-gray-600" />
              <MessageCircle size={24} className="cursor-pointer hover:text-gray-600 -rotate-90" />
              <Send size={24} className="cursor-pointer hover:text-gray-600" />
            </div>
            <Bookmark size={24} className="cursor-pointer hover:text-gray-600" />
          </div>
          <div className="font-semibold text-sm mb-1">2,345 likes</div>
          <div className="text-sm">
            <span className="font-semibold mr-2">{author.replace(/\s+/g, '').toLowerCase()}</span>
            <span className="whitespace-pre-wrap">{renderText(content || "Drafting caption...")}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 uppercase">2 hours ago</div>
        </div>
      </div>
    );
  }

  if (platform === 'linkedin') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl max-w-md mx-auto shadow-sm font-sans text-sm">
         <div className="p-3 flex gap-2 mb-1">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${author}&background=0A66C2&color=fff`} alt={author} className="w-full h-full object-cover" />
             </div>
             <div>
                 <div className="font-semibold text-sm text-gray-900 leading-tight">{author}</div>
                 <div className="text-xs text-gray-500">Marketing Professional</div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                     1w • <Globe size={10} />
                 </div>
             </div>
         </div>
         <div className="px-3 pb-2 text-sm text-gray-900 whitespace-pre-wrap">
            {renderText(content || "Drafting post...")}
         </div>
         {mediaUrl && (
            <div className="w-full overflow-hidden bg-gray-100">
               <img src={mediaUrl} alt="Post media" className="w-full h-auto object-cover max-h-[400px]" />
            </div>
         )}
         <div className="px-3 py-2 border-t border-gray-100 flex justify-between">
             <div className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer flex-1 justify-center">
                 <ThumbsUp size={18} /> <span className="text-xs font-semibold">Like</span>
             </div>
             <div className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer flex-1 justify-center">
                 <MessageCircle size={18} /> <span className="text-xs font-semibold">Comment</span>
             </div>
             <div className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer flex-1 justify-center">
                 <Repeat size={18} /> <span className="text-xs font-semibold">Repost</span>
             </div>
             <div className="flex items-center gap-1 text-gray-500 hover:bg-gray-100 px-2 py-3 rounded cursor-pointer flex-1 justify-center">
                 <Send size={18} /> <span className="text-xs font-semibold">Send</span>
             </div>
         </div>
      </div>
    );
  }

  // Fallback (Facebook style roughly)
  return (
    <div className="bg-white border border-gray-200 rounded-xl max-w-md mx-auto shadow-sm font-sans text-sm">
        <div className="p-3 flex items-center gap-2">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                 <img src={`https://ui-avatars.com/api/?name=${author}&background=1877F2&color=fff`} alt={author} className="w-full h-full object-cover" />
             </div>
             <div>
                 <div className="font-semibold text-sm text-gray-900">{author}</div>
                 <div className="text-xs text-gray-500 flex items-center gap-1">
                     {formattedDate} • <Globe size={10} />
                 </div>
             </div>
        </div>
        <div className="px-3 pb-3 text-sm text-gray-900 whitespace-pre-wrap">
             {renderText(content || "What's on your mind?")}
        </div>
        {mediaUrl && (
            <div className="w-full h-64 bg-gray-100 overflow-hidden relative">
               <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
            </div>
         )}
         <div className="px-3 py-2 border-t border-gray-100 flex justify-between text-gray-500">
            <div className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-50 py-1 rounded cursor-pointer">
                <ThumbsUp size={18} /> Like
            </div>
             <div className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-50 py-1 rounded cursor-pointer">
                <MessageCircle size={18} /> Comment
            </div>
             <div className="flex-1 flex items-center justify-center gap-2 hover:bg-gray-50 py-1 rounded cursor-pointer">
                <Share size={18} /> Share
            </div>
         </div>
    </div>
  );
};

export default PlatformPreview;
