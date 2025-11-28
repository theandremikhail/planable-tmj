import React, { useState, useRef, useEffect } from 'react';
import { Platform, Post, PostStatus, Comment } from '../types';
import { PLATFORMS } from '../constants';
import PlatformPreview from './PlatformPreview';
import { X, Wand2, Image as ImageIcon, Loader2, Sparkles, Check, Paperclip, Send, UserCircle, Clock, Calendar, ChevronDown, Monitor } from 'lucide-react';
import { generatePostContent, generateImage } from '../services/geminiService';

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, 'id' | 'author' | 'comments'>, newComment?: string) => void;
  initialPost?: Post | null;
}

const PostComposer: React.FC<PostComposerProps> = ({ isOpen, onClose, onSave, initialPost }) => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [mediaUrl, setMediaUrl] = useState<string | undefined>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // AI States
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        if (initialPost) {
            setContent(initialPost.content);
            setPlatform(initialPost.platform);
            setDate(new Date(initialPost.date).toISOString().split('T')[0]);
            setStatus(initialPost.status);
            setMediaUrl(initialPost.mediaUrl);
            setComments(initialPost.comments);
        } else {
            setContent('');
            setPlatform('instagram');
            setDate(new Date().toISOString().split('T')[0]);
            setStatus('draft');
            setMediaUrl(undefined);
            setComments([]);
        }
        setAiPrompt('');
        setNewComment('');
    }
  }, [isOpen, initialPost]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      content,
      platform,
      date: new Date(date),
      status,
      mediaUrl,
    }, newComment);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  const handleAIText = async (type: 'draft' | 'improve' | 'hashtags' | 'shorten' | 'expand', tone?: string) => {
    setIsGeneratingText(true);
    try {
      const result = await generatePostContent({
        type,
        platform,
        currentText: content,
        topic: aiPrompt || "Brand Update", 
        tone
      });
      
      if (type === 'hashtags') {
        setContent(prev => prev + "\n\n" + result);
      } else {
        setContent(result);
      }
    } catch (e) {
      alert("Failed to generate text.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleAIImage = async () => {
    if (!aiPrompt) {
        alert("Please enter a topic/prompt for the image first.");
        return;
    }
    setIsGeneratingImage(true);
    try {
      const base64Image = await generateImage(aiPrompt);
      setMediaUrl(base64Image);
    } catch (e) {
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAddComment = () => {
      if (!newComment.trim()) return;
      const comment: Comment = {
          id: Date.now().toString(),
          author: 'You',
          text: newComment,
          createdAt: new Date()
      };
      setComments([...comments, comment]);
      setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090A0B]/80 backdrop-blur-sm p-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl w-full max-w-[96vw] h-[92vh] flex overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
        
        {/* COLUMN 1: Editor (25%) */}
        <div className="w-[25%] flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                    <Monitor size={16} />
                </div>
                <span className="text-sm font-bold text-gray-800">Editor</span>
             </div>
             <div className="flex gap-1">
                 {/* Platform selector compact */}
             </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-6">
             {/* Platform Selection */}
             <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-2">Platform</label>
                <div className="grid grid-cols-4 gap-2">
                    {PLATFORMS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className={`flex items-center justify-center py-2 rounded-lg text-sm transition-all border ${
                        platform === p.id 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' 
                            : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                        }`}
                        title={p.name}
                    >
                        {p.icon}
                    </button>
                    ))}
                </div>
             </div>

             {/* Text Editor */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Content</label>
                    <button onClick={() => handleAIText('improve')} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full hover:bg-purple-100 flex items-center gap-1 transition-colors">
                        <Sparkles size={10} /> Enhance
                    </button>
                </div>
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind for ${PLATFORMS.find(p => p.id === platform)?.name}?`}
                        className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded-xl resize-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all placeholder:text-gray-400"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                        <button onClick={() => handleAIText('hashtags')} className="p-1.5 bg-white text-gray-400 border border-gray-200 rounded-md hover:text-indigo-600 hover:border-indigo-200 text-[10px] font-medium transition-colors">#Hashtags</button>
                    </div>
                </div>
             </div>

             {/* Media */}
             <div className="space-y-2">
                 <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Visuals</label>
                 {!mediaUrl ? (
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-24 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all gap-1 group"
                        >
                            <Paperclip size={18} className="group-hover:-translate-y-0.5 transition-transform"/>
                            <span className="text-[10px] font-medium">Upload File</span>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </button>
                        <button 
                             onClick={() => setAiPrompt("Social media background") /* Simple default */} 
                             className="h-24 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all gap-1 relative overflow-hidden group"
                        >
                            {isGeneratingImage && <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10"><Loader2 className="animate-spin text-purple-600"/></div>}
                            <ImageIcon size={18} className="group-hover:-translate-y-0.5 transition-transform"/>
                            <span className="text-[10px] font-medium">Create AI Art</span>
                        </button>
                     </div>
                 ) : (
                     <div className="relative rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                         <img src={mediaUrl} alt="Preview" className="w-full h-32 object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button 
                                onClick={() => setMediaUrl(undefined)}
                                className="bg-white/20 backdrop-blur text-white p-2 rounded-full hover:bg-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                         </div>
                     </div>
                 )}
             </div>

             {/* Scheduling */}
             <div className="grid grid-cols-2 gap-3 pt-2">
                 <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Date</label>
                    <div className="relative">
                        <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500"
                        />
                        <Calendar size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide block mb-1">Time</label>
                     <div className="relative">
                        <input 
                            type="time" 
                            defaultValue="10:00"
                            className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500"
                        />
                        <Clock size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                    </div>
                 </div>
             </div>

             {/* AI Generator Box */}
             <div className="mt-4 bg-gradient-to-br from-indigo-600 to-purple-700 p-4 rounded-xl text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                    <Wand2 size={14} className="text-yellow-300" />
                    <span className="text-xs font-bold tracking-wide">Gemini Copilot</span>
                </div>
                
                <input 
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe post idea..."
                    className="w-full text-xs px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:border-white/50 bg-white/10 text-white placeholder-white/50 mb-3"
                />
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleAIText('draft')} 
                        disabled={!aiPrompt || isGeneratingText}
                        className="flex-1 bg-white text-indigo-700 text-[10px] py-2 rounded-md font-bold hover:bg-indigo-50 disabled:opacity-50 flex justify-center items-center gap-1 transition-colors"
                    >
                        {isGeneratingText ? <Loader2 className="animate-spin" size={10}/> : "Write Draft"}
                    </button>
                    <button 
                        onClick={handleAIImage} 
                        disabled={!aiPrompt || isGeneratingImage}
                        className="flex-1 bg-white/20 text-white text-[10px] py-2 rounded-md font-bold hover:bg-white/30 disabled:opacity-50 flex justify-center items-center gap-1 transition-colors"
                    >
                         {isGeneratingImage ? <Loader2 className="animate-spin" size={10}/> : "Create Art"}
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* COLUMN 2: Preview (50%) */}
        <div className="w-[50%] bg-[#F2F4F7] flex flex-col relative shadow-[inset_0px_0px_20px_rgba(0,0,0,0.02)]">
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="scale-100 origin-center transition-all duration-300 drop-shadow-xl">
                     <PlatformPreview 
                        platform={platform} 
                        content={content} 
                        mediaUrl={mediaUrl}
                        author={initialPost?.author || "Acme Corp"}
                        date={date ? new Date(date) : new Date()}
                     />
                </div>
            </div>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-sm border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-gray-500">Live Preview</span>
            </div>
        </div>

        {/* COLUMN 3: Collaboration (25%) */}
        <div className="w-[25%] bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Collaboration</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Approval Workflow */}
            <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                    {(['draft', 'pending', 'approved'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-md capitalize transition-all ${
                                status === s 
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <UserCircle size={32} />
                        </div>
                        <p className="text-sm font-medium text-gray-400">No feedback yet</p>
                        <p className="text-xs text-center px-4 mt-1">Comments from your team will appear here.</p>
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 text-sm group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex-shrink-0 flex items-center justify-center text-indigo-700 font-bold text-xs border border-white shadow-sm">
                                {comment.author.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-800 text-xs">{comment.author}</span>
                                    <span className="text-[10px] text-gray-300 group-hover:text-gray-400 transition-colors">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="mt-1 p-3 bg-gray-50 rounded-lg rounded-tl-none border border-gray-100 text-gray-600 text-xs leading-relaxed">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="relative">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Type a comment..."
                        className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                    />
                    <button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Main Action */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <button 
                    onClick={handleSave}
                    className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${
                        status === 'approved' 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    }`}
                >
                    {status === 'approved' ? <Check size={18} /> : <Check size={18} />}
                    {status === 'approved' ? 'Approve & Schedule' : 'Save as Draft'}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PostComposer;