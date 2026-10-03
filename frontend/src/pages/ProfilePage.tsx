import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, LogOut, Save, CheckCircle, Settings, Sparkles, Building2 } from 'lucide-react';
import { api } from '../services/api';
import { INDUSTRY_MAPPINGS } from '../config/industryMapping';

const ProfilePage = () => {
  const { user, logout, fetchUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [industry, setIndustry] = useState(user?.industry || '🚗 Automotive');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await api.patch('/profile', {
        full_name: fullName || null,
        industry: industry,
      });
      await fetchUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
            Node Configuration & Identity
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
          Account & Plant Sector Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Manage operator details and active sector adaptation for FactoryIQ AI.
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold animate-pulse">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Profile configuration updated! Platform terminology, SVGs, and ML metrics adapted globally.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        
        {/* User Identity Banner */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black font-heading shadow-md shadow-indigo-600/20">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 font-heading">{user.full_name || user.username}</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 mt-0.5 font-mono">
              <ShieldCheck className="w-4 h-4" /> VERIFIED OPERATIONAL NODE
            </span>
          </div>
        </div>

        <div className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Operator Handle</label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-mono text-xs">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-900">{user.username}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-mono text-xs">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-900 truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Display Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-xs font-semibold"
              placeholder="e.g. Lead Process Engineer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Active Industry Sector Mode
            </label>
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all text-xs font-bold appearance-none cursor-pointer"
              >
                {Object.keys(INDUSTRY_MAPPINGS).map((key) => (
                  <option key={key} value={key} className="bg-white text-slate-900 font-medium py-2">
                    {key}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <Settings className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Dynamically configures line terminology, metric sensors, PDF reports, and AI advisor prompts for your active manufacturing vertical.
            </p>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Configuration'}</span>
          </button>
          
          <button
            type="button"
            onClick={logout}
            className="py-3 px-6 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
