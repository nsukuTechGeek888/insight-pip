'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

export default function ProfilePage() {
  const { user, isLoading, checkAuth } = useUser();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  if (!user) return null;

  const userRole = user.role === 'ADMIN' ? 'Administrator' : user.role === 'REVIEWER' ? 'Verified Reviewer' : 'Community Member';
  const roleColor = user.role === 'ADMIN' ? 'text-purple-400' : user.role === 'REVIEWER' ? 'text-blue-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-zinc-400 text-sm mt-1">Manage your profile and security</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 text-center sticky top-24">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg">
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-zinc-800 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors">
                  <Camera size={14} className="text-zinc-400" />
                </button>
              </div>
              <h3 className="text-xl font-semibold text-white mt-4">{user.name || 'User'}</h3>
              <p className="text-sm text-zinc-400">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-800/50">
                <Shield size={12} className={roleColor} />
                <span className={`text-xs ${roleColor}`}>{userRole}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Member since</span>
                    <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Update Profile Form */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User size={18} className="text-purple-400" />
                Profile Information
              </h2>
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-zinc-800/30 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Email cannot be changed. Contact support for assistance.</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={18} className="text-green-400" />
                Security
              </h2>
              <form onSubmit={updatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-500 hover:to-teal-500 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {updatingPassword ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={16} />}
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}