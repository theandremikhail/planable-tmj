
import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2, Globe, ExternalLink } from 'lucide-react';
import { searchWeb } from '../services/geminiService';
import { SearchResult, Post } from '../types';

interface InspirationProps {
  onDraftPost: (initialContent: string) => void;
}

const Inspiration: React.FC<InspirationProps> = ({ onDraftPost }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    try {
        const data = await searchWeb(query);
        setResults(data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const suggestions = ["Artificial Intelligence trends", "Sustainable fashion news", "B2B Marketing strategies 2025", "Tech startup funding news"];

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto">
      <header className="mb-8 text-center">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-4 border border-indigo-100">
            <Sparkles size={14} /> Powered by Google Search
         </div>
         <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Find Trending Content</h1>
         <p className="text-gray-500 max-w-xl mx-auto">
            Use AI to research real-time topics, news, and trends from the web. 
            Instantly turn findings into social media posts.
         </p>
      </header>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            </div>
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to post about? (e.g., 'Crypto news')"
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
            <button 
                type="submit"
                disabled={loading || !query}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
            </button>
        </form>
        
        {!hasSearched && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {suggestions.map(s => (
                    <button 
                        key={s}
                        onClick={() => { setQuery(s); handleSearch(); }} // Trigger search immediately might need effect or simple logic
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                        {s}
                    </button>
                ))}
            </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Researching the web...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col">
                    <div className="flex-1">
                        {item.source && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-3">
                                <Globe size={12} />
                                <span className="truncate max-w-[200px]">{item.source}</span>
                            </div>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {item.content}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                        {item.url ? (
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            >
                                Read Source <ExternalLink size={10} />
                            </a>
                        ) : <div></div>}
                        
                        <button 
                            onClick={() => onDraftPost(`Check out this news about ${item.title}: ${item.content} \n\n#Trend #News`)}
                            className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2"
                        >
                            Draft Post <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            ))}
            
            {hasSearched && results.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                    <p>No results found. Try a different topic.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Inspiration;
