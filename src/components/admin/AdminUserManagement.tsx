import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, UserCheck, 
  Trash2, Edit3, Key, Check, AlertCircle, Phone, Mail, 
  Clock, ShieldAlert, Sparkles, X
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { bnNum } from '../../utils/bengaliHelpers';

interface AdminUserManagementProps {
  users: AdminUser[];
  currentUser: AdminUser;
  onAddUser: (user: AdminUser) => void;
  onUpdateUser: (user: AdminUser) => void;
  onDeleteUser: (id: number) => void;
  onChangeActiveUser: (user: AdminUser) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onChangeActiveUser
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState('');

  // Add User Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('editor');
  const [roleTitle, setRoleTitle] = useState('বার্তা সম্পাদক');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face');

  const isSuperAdmin = currentUser.role === 'super_admin';

  const roleMeta: Record<AdminRole, { label: string; bg: string; text: string; icon: React.ReactNode; desc: string }> = {
    super_admin: {
      label: 'সুপার অ্যাডমিন (Super Admin)',
      bg: 'bg-red-900/40 border-red-700/60',
      text: 'text-red-300',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
      desc: 'সম্পূর্ণ নিয়ন্ত্রণ: সংবাদ, ব্লগ, ক্যাটাগরি, সাইট সেটিংস, মাল্টি-অ্যাডমিন রোল এবং ব্যাকআপ ও ডাটাবেস।'
    },
    editor: {
      label: 'সম্পাদক (Editor)',
      bg: 'bg-blue-900/40 border-blue-700/60',
      text: 'text-blue-300',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />,
      desc: 'সংবাদ ও ব্লগ তৈরি, সম্পাদনা, প্রকাশ ও ক্যাটাগরি ব্যবস্থাপনা।'
    },
    moderator: {
      label: 'মডারেটর (Moderator)',
      bg: 'bg-emerald-900/40 border-emerald-700/60',
      text: 'text-emerald-300',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />,
      desc: 'ব্রেকিং নিউজ টিকার নিয়ন্ত্রণ, পাঠক বার্তা ইনবক্স ও ব্লগ রিডিং মনিটরিং।'
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) {
      alert('অনুগ্রহ করে নাম, ইউজারনেম এবং ইমেইল পূরণ করুন।');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      alert('এই ইউজারনেমটি ইতিমধ্যে বিদ্যমান। অন্য ইউজারনেম ব্যবহার করুন।');
      return;
    }

    const newUser: AdminUser = {
      id: Date.now(),
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      phone: phone.trim() || '০১৭১১০০০০০০',
      role,
      role_title: roleTitle.trim() || roleMeta[role].label,
      avatar: avatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      last_login: 'নতুন নিবন্ধিত'
    };

    onAddUser(newUser);
    setFeedback(`"${newUser.name}" কে সফলভাবে ${roleMeta[newUser.role].label} হিসেবে যুক্ত করা হয়েছে!`);
    setShowAddModal(false);
    setName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdateUser(editingUser);
    setFeedback(`"${editingUser.name}" এর তথ্য ও রোল সফলভাবে আপডেট করা হয়েছে!`);
    setEditingUser(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Role Switcher Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-red-500" />
            <h1 className="text-xl sm:text-2xl font-black text-white font-bengali-display">
              মাল্টি অ্যাডমিন ও রোল ব্যবস্থাপনা
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            সুপার অ্যাডমিন হিসেবে আপনি একাধিক সম্পাদক (Editor) ও মডারেটর (Moderator) যুক্ত করতে এবং তাদের অ্যাক্সেস নিয়ন্ত্রণ করতে পারেন।
          </p>
        </div>

        {isSuperAdmin ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow transition-all shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" /> নতুন অ্যাডমিন যুক্ত করুন
          </button>
        ) : (
          <div className="bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>নতুন অ্যাডমিন যোগ বা ডিলিট করার ক্ষমতা শুধুমাত্র সুপার অ্যাডমিনের রয়েছে।</span>
          </div>
        )}
      </div>

      {/* Role Switcher Test Box */}
      <div className="bg-linear-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Key className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-white font-bold block">বর্তমান সক্রিয় অ্যাডমিন একাউন্ট:</span>
            <span className="text-slate-400">
              {currentUser.name} — <span className="text-red-400 font-bold">{roleMeta[currentUser.role]?.label}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-400 font-medium shrink-0">পরীক্ষামূলক পরিবর্তন:</span>
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find(x => x.id === Number(e.target.value));
              if (u) onChangeActiveUser(u);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer w-full md:w-auto"
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className="bg-emerald-900/60 border border-emerald-600 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Role Permissions Matrix Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['super_admin', 'editor', 'moderator'] as AdminRole[]).map((r) => {
          const meta = roleMeta[r];
          const count = users.filter(u => u.role === r).length;
          return (
            <div key={r} className={`border rounded-xl p-4 ${meta.bg} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {meta.icon}
                    <h3 className={`text-xs font-bold ${meta.text}`}>{meta.label}</h3>
                  </div>
                  <span className="bg-slate-950/70 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {bnNum(count)} জন
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {meta.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl overflow-hidden shadow-md">
        <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white font-bengali-display flex items-center gap-2">
            <Users className="w-4 h-4 text-red-500" />
            নিবন্ধিত অ্যাডমিন ও দায়িত্বপ্রাপ্ত টিম ({bnNum(users.length)} জন)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-700">
              <tr>
                <th className="p-3.5">ব্যবহারকারী / অবতার</th>
                <th className="p-3.5">রোল ও পদবী</th>
                <th className="p-3.5">যোগাযোগ</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5">সর্বশেষ লগইন</th>
                {isSuperAdmin && <th className="p-3.5 text-right">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-200">
              {users.map((u) => {
                const meta = roleMeta[u.role] || roleMeta.editor;
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className={isCurrent ? 'bg-slate-700/30' : 'hover:bg-slate-750/30'}>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'} 
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="bg-red-900/80 text-red-300 text-[9px] px-1.5 py-0.2 rounded font-mono">
                                আপনি
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.bg} ${meta.text}`}>
                          {meta.icon}
                          {u.role === 'super_admin' ? 'সুপার অ্যাডমিন' : u.role === 'editor' ? 'সম্পাদক' : 'মডারেটর'}
                        </span>
                        <p className="text-[11px] text-slate-400">{u.role_title}</p>
                      </div>
                    </td>
                    <td className="p-3.5 space-y-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3 h-3" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                      }`}>
                        {u.status === 'active' ? 'সক্রিয় (Active)' : 'স্থগিত (Suspended)'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {u.last_login}
                    </td>
                    {isSuperAdmin && (
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingUser({ ...u })}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                            title="রোল ও তথ্য সম্পাদনা করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== 'super_admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`আপনি কি নিশ্চিত যে "${u.name}" কে অ্যাডমিন তালিকা থেকে মুছে ফেলতে চান?`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="bg-red-900/60 hover:bg-red-800 text-red-200 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                              title="ব্যবহারকারী মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white font-bengali-display">
                  নতুন অ্যাডমিন / সম্পাদক যুক্ত করুন
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সাইফুল ইসলাম"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ইউজারনেম *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="যেমন: saiful_editor"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ইমেইল ঠিকানা *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="saiful@bartachitro.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">অ্যাডমিন রোল (Role) *</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newR = e.target.value as AdminRole;
                      setRole(newR);
                      setRoleTitle(newR === 'super_admin' ? 'সহকারী প্রধান সম্পাদক' : newR === 'editor' ? 'বার্তা সম্পাদক' : 'কমিউনিটি মডারেটর');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="editor">সম্পাদক (Editor)</option>
                    <option value="moderator">মডারেটর (Moderator)</option>
                    <option value="super_admin">সুপার অ্যাডমিন (Super Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">পদবী বা দায়িত্বের নাম</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="যেমন: সিনিয়র সাব-এডিটর"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">ফোন নম্বর</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭১১০০০০০০"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">প্রোফাইল ছবি / অবতার URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Check className="w-4 h-4" /> যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-bengali-display">
                  অ্যাডমিন তথ্য ও রোল পরিবর্তন
                </h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">নাম</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">দায়িত্ব / রোল *</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as AdminRole })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="editor">সম্পাদক (Editor)</option>
                  <option value="moderator">মডারেটর (Moderator)</option>
                  <option value="super_admin">সুপার অ্যাডমিন (Super Admin)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">পদবী</label>
                <input
                  type="text"
                  value={editingUser.role_title}
                  onChange={(e) => setEditingUser({ ...editingUser, role_title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">স্ট্যাটাস</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'suspended' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Check className="w-4 h-4" /> সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
