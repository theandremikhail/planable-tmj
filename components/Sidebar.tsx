
import React from 'react';
import { LayoutGrid, Calendar as CalendarIcon, Users, Settings, Plus, Briefcase, Image as ImageIcon, ChevronDown, BarChart2, Bell, Sparkles } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  onNewPost: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onNewPost }) => {
  const workspaceItems = [
    { id: 'feed', icon: <LayoutGrid size={20} />, label: 'Feed' },
    { id: 'calendar', icon: <CalendarIcon size={20} />, label: 'Calendar' },
    { id: 'media', icon: <ImageIcon size={20} />, label: 'Media Library' },
    { id: 'inspiration', icon: <Sparkles size={20} />, label: 'Inspiration' },
  ];

  const managementItems = [
      { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
      { id: 'team', icon: <Users size={20} />, label: 'Team & People' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const renderButton = (id: string, icon: React.ReactNode, label: string) => (
      <button
        key={id}
        onClick={() => setView(id as View)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
          view === id 
            ? 'bg-white/10 text-white shadow-sm' 
            : 'hover:bg-white/5 hover:text-gray-200'
        }`}
      >
        {icon}
        {label}
      </button>
  );

  return (
    <div className="w-64 h-screen bg-[#1A1D21] text-gray-400 flex flex-col fixed left-0 top-0 z-20 border-r border-gray-800">
      {/* Workspace Selector */}
      <div className="p-4 border-b border-gray-800">
        <button className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group text-white">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                   <Briefcase size={16} />
                </div>
                <div className="text-left">
                    <div className="text-sm font-bold leading-none">Acme Corp</div>
                    <div className="text-[10px] text-gray-400 font-medium mt-1 group-hover:text-gray-300">Free Plan</div>
                </div>
            </div>
            <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        
        {/* Actions */}
        <div className="px-1">
             <button 
                onClick={onNewPost}
                className="w-full bg-[#4F46E5] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#4338CA] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 group"
            >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Compose</span>
            </button>
        </div>

        {/* Workspace Menu */}
        <div className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Workspace</div>
            {workspaceItems.map((item) => renderButton(item.id, item.icon, item.label))}
        </div>
        
        {/* Management Menu */}
        <div className="space-y-1">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">Management</div>
            {managementItems.map((item) => renderButton(item.id, item.icon, item.label))}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 bg-[#15171a]">
        <div className="flex items-center gap-3 px-2 py-1 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative">
                <img src="https://ui-avatars.com/api/?name=Alex+Designer&background=374151&color=fff" className="w-9 h-9 rounded-full border border-gray-700" alt="User" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1A1D21] rounded-full"></div>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">Alex Designer</span>
                <span className="text-xs text-gray-500 truncate">alex@acme.com</span>
            </div>
            <Bell size={16} className="ml-auto text-gray-500 hover:text-white" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
