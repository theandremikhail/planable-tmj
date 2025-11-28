
import React, { useState, useEffect } from 'react';
import { Instagram, Linkedin, Twitter, Facebook, Save, Globe, Lock, Bell, CreditCard, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getSettings, saveSettings } from '../services/storage';
import { AppSettings } from '../types';

const Settings: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const load = async () => {
        const data = await getSettings();
        setSettings(data);
    };
    load();
  }, []);

  const handleToggleConnection = async (platform: keyof AppSettings['connections']) => {
    if (!settings) return;

    if (settings.connections[platform]) {
      // Disconnect immediately
      const newSettings = { 
          ...settings, 
          connections: { ...settings.connections, [platform]: false } 
      };
      setSettings(newSettings);
      saveSettings(newSettings); // Save in background
    } else {
      // Simulate connection delay
      setIsLoading(platform);
      const newSettings = { 
          ...settings, 
          connections: { ...settings.connections, [platform]: true } 
      };
      
      // Artificial delay for "Authenticating..." feel
      setTimeout(() => {
        setSettings(newSettings);
        saveSettings(newSettings);
        setIsLoading(null);
      }, 1500);
    }
  };

  const handleSaveGeneral = async () => {
      if (!settings) return;
      setIsSaving(true);
      await saveSettings(settings);
      setIsSaving(false);
  };

  if (!settings) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="animate-fade-in-up max-w-4xl">
        <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your workspace preferences and connected accounts.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Config */}
            <div className="w-full md:w-64 shrink-0 space-y-1">
                <button className="w-full text-left px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">General</button>
                <button className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">Social Platforms</button>
                <button className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">Notifications</button>
                <button className="w-full text-left px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors">Billing & Plan</button>
            </div>

            {/* Form Area */}
            <div className="flex-1 space-y-8">
                
                {/* General Section */}
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-gray-400"/> Workspace Details
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Workspace Name</label>
                            <input 
                                type="text" 
                                value={settings.workspaceName} 
                                onChange={(e) => setSettings({...settings, workspaceName: e.target.value})}
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 outline-none transition-colors focus:ring-2 focus:ring-indigo-100" 
                            />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Timezone</label>
                                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors">
                                    <option>Pacific Time (US & Canada)</option>
                                    <option>UTC</option>
                                    <option>London (GMT)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Language</label>
                                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500 transition-colors">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Connected Accounts */}
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-gray-400"/> Connected Accounts
                    </h2>
                    <div className="space-y-3">
                        {/* Instagram */}
                        <div className={`flex items-center justify-between p-4 border rounded-xl transition-all ${settings.connections.instagram ? 'bg-gray-50 border-gray-200' : 'bg-white border-dashed border-gray-300 opacity-80 hover:opacity-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl shadow-sm ${settings.connections.instagram ? 'bg-white text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Instagram size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Instagram Business</div>
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${settings.connections.instagram ? 'text-green-600' : 'text-gray-400'}`}>
                                        {settings.connections.instagram ? (
                                            <><CheckCircle2 size={12}/> Connected as @{settings.workspaceName.replace(/\s+/g,'').toLowerCase()}</>
                                        ) : (
                                            'Not Connected'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggleConnection('instagram')}
                                disabled={isLoading === 'instagram'}
                                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                                    settings.connections.instagram 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                            >
                                {isLoading === 'instagram' ? <Loader2 className="animate-spin" size={14}/> : settings.connections.instagram ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>

                        {/* LinkedIn */}
                        <div className={`flex items-center justify-between p-4 border rounded-xl transition-all ${settings.connections.linkedin ? 'bg-gray-50 border-gray-200' : 'bg-white border-dashed border-gray-300 opacity-80 hover:opacity-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl shadow-sm ${settings.connections.linkedin ? 'bg-white text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                                    <Linkedin size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">LinkedIn Page</div>
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${settings.connections.linkedin ? 'text-green-600' : 'text-gray-400'}`}>
                                        {settings.connections.linkedin ? (
                                            <><CheckCircle2 size={12}/> Connected as {settings.workspaceName}</>
                                        ) : (
                                            'Not Connected'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggleConnection('linkedin')}
                                disabled={isLoading === 'linkedin'}
                                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                                    settings.connections.linkedin 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                            >
                                {isLoading === 'linkedin' ? <Loader2 className="animate-spin" size={14}/> : settings.connections.linkedin ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>

                        {/* Twitter */}
                        <div className={`flex items-center justify-between p-4 border rounded-xl transition-all ${settings.connections.twitter ? 'bg-gray-50 border-gray-200' : 'bg-white border-dashed border-gray-300 opacity-80 hover:opacity-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl shadow-sm ${settings.connections.twitter ? 'bg-white text-black' : 'bg-gray-100 text-gray-400'}`}>
                                    <Twitter size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">X / Twitter</div>
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${settings.connections.twitter ? 'text-green-600' : 'text-gray-400'}`}>
                                        {settings.connections.twitter ? (
                                            <><CheckCircle2 size={12}/> Connected as @{settings.workspaceName.replace(/\s+/g,'').toLowerCase()}_inc</>
                                        ) : (
                                            'Not Connected'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggleConnection('twitter')}
                                disabled={isLoading === 'twitter'}
                                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                                    settings.connections.twitter 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                            >
                                {isLoading === 'twitter' ? <Loader2 className="animate-spin" size={14}/> : settings.connections.twitter ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>

                         {/* Facebook */}
                         <div className={`flex items-center justify-between p-4 border rounded-xl transition-all ${settings.connections.facebook ? 'bg-gray-50 border-gray-200' : 'bg-white border-dashed border-gray-300 opacity-80 hover:opacity-100'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl shadow-sm ${settings.connections.facebook ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Facebook size={24} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Facebook Page</div>
                                    <div className={`text-xs font-medium flex items-center gap-1.5 ${settings.connections.facebook ? 'text-green-600' : 'text-gray-400'}`}>
                                        {settings.connections.facebook ? (
                                            <><CheckCircle2 size={12}/> Connected as {settings.workspaceName}</>
                                        ) : (
                                            'Not Connected'
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggleConnection('facebook')}
                                disabled={isLoading === 'facebook'}
                                className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                                    settings.connections.facebook 
                                    ? 'text-red-600 hover:bg-red-50' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                }`}
                            >
                                {isLoading === 'facebook' ? <Loader2 className="animate-spin" size={14}/> : settings.connections.facebook ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    </div>
                </section>
                
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSaveGeneral}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Settings;
