
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Users, Eye, MousePointer, Share2 } from 'lucide-react';

const Analytics: React.FC = () => {
  const metrics = [
    { label: 'Total Reach', value: '24.5K', change: '+12%', isPositive: true, icon: <Eye size={20} /> },
    { label: 'Engagement Rate', value: '5.2%', change: '+0.8%', isPositive: true, icon: <MousePointer size={20} /> },
    { label: 'Followers', value: '8,940', change: '+24', isPositive: true, icon: <Users size={20} /> },
    { label: 'Shares', value: '1,203', change: '-2%', isPositive: false, icon: <Share2 size={20} /> },
  ];

  return (
    <div className="animate-fade-in-up">
       <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Performance Analytics</h1>
            <p className="text-gray-500 mt-1">Track the performance of your social media campaigns.</p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((m, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${m.isPositive ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                            {m.icon}
                        </div>
                        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${m.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {m.isPositive ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownRight size={12} className="mr-1" />}
                            {m.change}
                        </span>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 mb-1">{m.value}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{m.label}</div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart Placeholder */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-gray-800">Engagement Overview</h3>
                     <select className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-gray-50">
                         <option>Last 30 Days</option>
                         <option>Last 7 Days</option>
                     </select>
                </div>
                
                {/* Simple CSS Bar Chart Simulation */}
                <div className="h-64 flex items-end justify-between gap-2">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95].map((h, i) => (
                        <div key={i} className="w-full bg-indigo-50 rounded-t-sm relative group">
                            <div 
                                style={{ height: `${h}%` }} 
                                className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-600 transition-colors"
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {h * 10} views
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-400 font-medium">
                    <span>Jan 1</span>
                    <span>Jan 8</span>
                    <span>Jan 15</span>
                    <span>Jan 22</span>
                    <span>Jan 30</span>
                </div>
            </div>

            {/* Top Posts */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Top Performing Posts</h3>
                <div className="space-y-4">
                    {[1,2,3].map((_, i) => (
                        <div key={i} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                <img src={`https://picsum.photos/100/100?random=${i+10}`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">
                                    Product launch announcement for the new summer collection...
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Eye size={10}/> 1.2k</span>
                                    <span className="flex items-center gap-1"><MousePointer size={10}/> 4.5%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                 <button className="w-full mt-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    View All Posts
                </button>
            </div>
        </div>
    </div>
  );
};

export default Analytics;
