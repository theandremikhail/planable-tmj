
import React, { useState, useEffect } from 'react';
import { Mail, MoreHorizontal, Plus, Shield, ShieldAlert, User, CheckCircle2, Loader2, X } from 'lucide-react';
import { TeamMember } from '../types';
import { getTeam, addTeamMember } from '../services/storage';

const TeamPeople: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const load = async () => {
        const data = await getTeam();
        setMembers(data);
        setLoading(false);
    };
    load();
  }, []);

  const handleInvite = async () => {
      if (!newEmail) return;
      setIsInviting(true);
      
      const newMember: TeamMember = {
          id: Date.now().toString(),
          name: newEmail.split('@')[0], // placeholder name
          email: newEmail,
          role: 'Viewer',
          avatar: `https://ui-avatars.com/api/?name=${newEmail}&background=random`,
          status: 'Pending'
      };

      try {
          const updatedTeam = await addTeamMember(newMember);
          setMembers(updatedTeam);
          setIsInviteOpen(false);
          setNewEmail('');
      } catch (e) {
          console.error("Failed to add member");
      } finally {
          setIsInviting(false);
      }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400"/></div>;

  return (
    <div className="animate-fade-in-up">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team & People</h1>
                <p className="text-gray-500 mt-1">Manage access and roles for your workspace.</p>
            </div>
            <button 
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
                 <Plus size={18} /> Invite Member
            </button>
        </header>

        {isInviteOpen && (
            <div className="mb-6 p-4 bg-white border border-indigo-100 rounded-xl shadow-sm animate-fade-in-up flex items-center gap-3">
                <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email Address</label>
                    <input 
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 outline-none"
                        autoFocus
                    />
                </div>
                <div className="flex items-end gap-2 h-full pt-5">
                    <button 
                        onClick={handleInvite}
                        disabled={isInviting || !newEmail}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                    >
                       {isInviting ? <Loader2 size={14} className="animate-spin"/> : 'Send Invite'}
                    </button>
                    <button 
                        onClick={() => setIsInviteOpen(false)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="col-span-5">Member</div>
                <div className="col-span-3">Role</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-1 text-right">Action</div>
            </div>
            
            <div className="divide-y divide-gray-100">
                {members.map((member, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                        <div className="col-span-5 flex items-center gap-3">
                            <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border border-gray-200" />
                            <div>
                                <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                        </div>
                        <div className="col-span-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                member.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                member.role === 'Editor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                                {member.role === 'Admin' ? <ShieldAlert size={12}/> : <User size={12}/>}
                                {member.role}
                            </span>
                        </div>
                        <div className="col-span-3">
                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                member.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                            }`}>
                                {member.status === 'Active' && <CheckCircle2 size={12} />}
                                {member.status}
                            </span>
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-6 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-indigo-200">
            <div>
                <h3 className="text-lg font-bold">Invite your team to collaborate</h3>
                <p className="text-indigo-100 text-sm mt-1 max-w-md">Collaborate on content, approve drafts, and manage feedback in real-time. Unlimited seats on your current plan.</p>
            </div>
            <div className="flex -space-x-3">
                {members.slice(0, 4).map(m => (
                    <img key={m.id} src={m.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover" alt="" />
                ))}
                <button onClick={() => setIsInviteOpen(true)} className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center font-bold text-lg hover:scale-110 transition-transform shadow-lg z-10">
                    <Plus size={20} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default TeamPeople;
