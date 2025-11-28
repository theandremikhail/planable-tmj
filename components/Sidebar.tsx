import React from 'react';
import { LayoutGrid, Calendar as CalendarIcon, Users, Settings, Plus, Command } from 'lucide-react';

interface SidebarProps {
  view: 'feed' | 'calendar';
  setView: (view: 'feed' | 'calendar') => void;
  onNewPost: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onNewPost }) => {
  const menuItems = [
    { id: 'feed', icon: <LayoutGrid size={20} />, label: 'Feed View' },
    { id: 'calendar', icon: <CalendarIcon size={20} />, label: 'Calendar' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-green-200">
           <Command size={18} />
        </div>
        <span className="font-bold text-xl text-gray-800 tracking-tight">PlanAI</span>
      </div>

      {/* Create Action */}
      <div className="px-6 mb-6">
        <button 
            onClick={onNewPost}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xl shadow-gray-200"
        >
            <Plus size={20} />
            <span>Compose</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspace</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as any)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              view === item.id 
                ? 'bg-green-50 text-green-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        
        <div className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Users size={20} />
            Members
        </button>
         <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
            <Settings size={20} />
            Settings
        </button>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <img src="https://ui-avatars.com/api/?name=Demo+User&background=random" className="w-9 h-9 rounded-full" alt="User" />
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-700">Demo User</span>
                <span className="text-xs text-gray-500">Pro Plan</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
