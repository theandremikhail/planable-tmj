
import React from 'react';
import { Upload, Image as ImageIcon, Film, Filter, Search, MoreHorizontal } from 'lucide-react';

const MediaLibrary: React.FC = () => {
  const images = [
    "https://picsum.photos/400/300?random=1",
    "https://picsum.photos/300/400?random=2",
    "https://picsum.photos/400/400?random=3",
    "https://picsum.photos/300/300?random=4",
    "https://picsum.photos/400/500?random=5",
    "https://picsum.photos/500/300?random=6",
    "https://picsum.photos/400/300?random=7",
    "https://picsum.photos/300/300?random=8",
  ];

  return (
    <div className="animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Media Library</h1>
            <p className="text-gray-500 mt-1">Manage and organize your visual assets.</p>
        </div>
        <div className="flex gap-3">
             <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                 <Filter size={16} /> Filter
             </button>
             <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                 <Upload size={16} /> Upload Asset
             </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 mb-6">
          <button className="px-4 py-2 border-b-2 border-indigo-600 text-indigo-600 font-medium text-sm">All Assets</button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Images</button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Videos</button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Documents</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Upload Placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors group">
            <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Upload className="text-indigo-600" size={24} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Drop files here</span>
            <span className="text-xs text-gray-400 mt-1">or click to upload</span>
        </div>

        {images.map((src, i) => (
            <div key={i} className="group relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm aspect-square">
                <img src={src} alt={`Asset ${i}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                        <button className="p-1.5 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/40">
                             <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <div className="text-white">
                        <div className="text-xs font-medium truncate">marketing_asset_{i+1}.jpg</div>
                        <div className="text-[10px] opacity-80">2.4 MB • JPG</div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default MediaLibrary;
