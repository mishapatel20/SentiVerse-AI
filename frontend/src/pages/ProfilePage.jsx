import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { User, Lock, Shield, CheckCircle2, AlertCircle, Save, KeyRound } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      await authAPI.updateProfile({ full_name: fullName, avatar_url: avatarUrl });
      updateUser({ full_name: fullName, avatar_url: avatarUrl });
      setProfileMsg('Profile updated successfully.');
    } catch (err) {
      setProfileErr(err.response?.data?.error || 'Profile update failed.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    try {
      await authAPI.changePassword({ current_password: currentPw, new_password: newPw });
      setPwMsg('Password changed successfully.');
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      setPwErr(err.response?.data?.error || 'Password update failed.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          Profile & Security Settings <User className="w-5 h-5 text-indigo-400" />
        </h1>
        <p className="text-xs text-gray-400 mt-1">Manage user identity, security credentials, and role privileges.</p>
      </div>

      {/* User Info Overview Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl glow-primary flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/20">
          {fullName ? fullName[0].toUpperCase() : 'U'}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Role: {user?.role ? user.role.toUpperCase() : 'USER'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" /> General Details
          </h3>

          {profileMsg && <div className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">{profileMsg}</div>}
          {profileErr && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{profileErr}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl glow-primary text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" /> Password & Security
          </h3>

          {pwMsg && <div className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">{pwMsg}</div>}
          {pwErr && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{pwErr}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
