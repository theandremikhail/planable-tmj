import React, { useState, useRef } from 'react';
import { Platform, Post, PostStatus } from '../types';
import { PLATFORMS } from '../constants';
import PlatformPreview from './PlatformPreview';
import { X, Wand2, Image as ImageIcon, Loader2, Sparkles, Check, Paperclip } from 'lucide-react';
import { generatePostContent, generateImage } from '../services/geminiService';

interface PostComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Omit<Post, 'id' | 'author' | 'comments'>) => void;
  initialPost?: Post | null;
}

const PostComposer: React.FC<PostComposerProps> = ({ isOpen, onClose, onSave, initialPost }) => {
  const [content, setContent] = useState(initialPost?.content || '');
  const [platform, setPlatform] = useState<Platform>(initialPost?.platform || 'instagram');
  const [date, setDate] = useState<string>(initialPost?.date ? new Date(initialPost.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || 'draft');
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(initialPost?.mediaUrl);
  
  // AI States
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiMenu, setShowAiMenu] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      content,
      platform,
      date: new Date(date),
      status,
      mediaUrl,
    });
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
    setShowAiMenu(false);
    try {
      const result = await generatePostContent({
        type,
        platform,
        currentText: content,
        topic: aiPrompt || "New Product Launch", // Fallback if drafting from scratch
        tone
      });
      
      if (type === 'hashtags') {
        setContent(prev => prev + "\n\n" + result);
      } else {
        setContent(result);
      }
    } catch (e) {
      alert("Failed to generate text. Please check your API key.");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* LEFT: Editor */}
        <div className="w-1/2 flex flex-col border-r border-gray-100 bg-gray-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Compose Post</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Platform Selector */}
          <div className="px-6 py-4 bg-white">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Select Platform</label>
             <div className="flex gap-3">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      platform === p.id 
                        ? 'border-green-500 bg-green-50 text-green-700 font-medium ring-1 ring-green-500' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {p.icon}
                    <span>{p.name}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Main Input Area */}
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            
            {/* AI Controls */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-indigo-600" size={18} />
                    <span className="font-semibold text-indigo-900 text-sm">Gemini AI Assistant</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Topic (e.g., 'Summer Sale', 'Team Lunch')..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="flex-1 border border-indigo-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button 
                        onClick={() => handleAIText('draft', 'excited')}
                        disabled={isGeneratingText || !aiPrompt}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGeneratingText ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16} />}
                        Draft
                    </button>
                     <button 
                        onClick={handleAIImage}
                        disabled={isGeneratingImage || !aiPrompt}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGeneratingImage ? <Loader2 className="animate-spin" size={16}/> : <ImageIcon size={16} />}
                        Gen Image
                    </button>
                </div>
            </div>

            {/* Content Textarea */}
            <div className="relative group">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Write your caption for ${platform}...`}
                    className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base leading-relaxed"
                />
                
                {/* Floating AI Actions for existing text */}
                {content.length > 5 && (
                    <div className="absolute bottom-3 right-3 flex gap-2">
                         <button 
                            onClick={() => handleAIText('improve')}
                            disabled={isGeneratingText}
                            className="text-xs bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full hover:bg-gray-50 text-gray-600 flex items-center gap-1"
                        >
                            <Sparkles size={12} /> Refine
                        </button>
                        <button 
                            onClick={() => handleAIText('hashtags')}
                            disabled={isGeneratingText}
                            className="text-xs bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full hover:bg-gray-50 text-gray-600 flex items-center gap-1"
                        >
                            # Hashtags
                        </button>
                    </div>
                )}
            </div>

            {/* Media Uploader */}
            <div>
                 <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Media</label>
                 <div className="flex items-center gap-4">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center w-32 h-32 hover:bg-gray-50 transition-colors text-gray-500 gap-2"
                    >
                        <Paperclip size={20} />
                        <span className="text-xs">Upload</span>
                    </button>
                    
                    {mediaUrl && (
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group">
                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                onClick={() => setMediaUrl(undefined)}
                                className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                 </div>
            </div>
            
            {/* Meta Data */}
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Schedule Date</label>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                 <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                    <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as PostStatus)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                </div>
             </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
             <button onClick={onClose} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
             <button 
                onClick={handleSave} 
                disabled={!content}
                className="px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm shadow-md shadow-green-200"
            >
                <Check size={18} />
                Save Post
             </button>
          </div>
        </div>

        {/* RIGHT: Preview */}
        <div className="w-1/2 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-gray-100 relative flex flex-col">
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 shadow-sm">
                Live Preview
            </div>
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                 <PlatformPreview 
                    platform={platform} 
                    content={content} 
                    mediaUrl={mediaUrl} 
                    author="PlanAI Team" 
                    date={new Date()}
                 />
            </div>
            <div className="bg-white/50 backdrop-blur border-t border-gray-200 p-4 text-center text-xs text-gray-500">
                This is how your post will look on {PLATFORMS.find(p => p.id === platform)?.name}.
            </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
