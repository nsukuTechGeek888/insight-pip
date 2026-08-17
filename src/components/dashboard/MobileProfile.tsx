// components/dashboard/MobileProfile.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Shield, Camera, Save, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import MobileLayout from '@/components/mobile/MobileLayout';

export default function MobileProfile() {
  const { user, isLoading, logout, checkAuth } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user, isLoading]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        await checkAuth();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setUpdatingPassword(true);
    setMessage(null);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <MobileLayout title="Profile" showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />
        </div>
      </MobileLayout>
    );
  }

  if (!user) return null;

  const userRole = user.role === 'ADMIN' ? 'Administrator' : user.role === 'REVIEWER' ? 'Verified Reviewer' : 'Community Member';
  const roleColor = user.role === 'ADMIN' ? 'text-purple-400' : user.role === 'REVIEWER' ? 'text-blue-400' : 'text-green-400';

  return (
    <MobileLayout title="Profile" showSearch={false}>
      <div className="space-y-5 pb-6">
        
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-5 border border-purple-500/30 text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mt-3">{user.name || 'User'}</h3>
          <p className="text-xs text-zinc-400">{user.email}</p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/50">
            <Shield size={10} className={roleColor} />
            <span className={`text-[10px] ${roleColor}`}>{userRole}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-500/30">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Member since</span>
              <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span className="text-xs">{message.text}</span>
          </div>
        )}

        {/* Update Profile Form */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <User size={14} className="text-purple-400" />
            Profile Information
          </h2>
          <form onSubmit={updateProfile} className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-zinc-800/30 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-500 text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-zinc-500 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield size={14} className="text-green-400" />
            Security
          </h2>
          <form onSubmit={updatePassword} className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingPassword ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={14} />}
              {updatingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </MobileLayout>
  );
}