import React, { useState } from 'react';
import { Lock, User, ArrowLeft, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { loginAdmin } from '../utils/api';
import { AdminUser } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('ইউজারনেম ও পাসওয়ার্ড দুটিই আবশ্যক।');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { user } = await loginAdmin(username.trim(), password.trim());
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('ইউজার তথ্য পাওয়া যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      console.error('Admin Login Error:', err);
      const msg = err.message || 'লগইন ব্যর্থ হয়েছে। ইউজারনেম ও পাসওয়ার্ড সঠিক কিনা যাচাই করুন।';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 font-bengali-body relative overflow-hidden">
      {/* Background Subtle Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Back Link */}
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>মূল ওয়েবসাইটে ফিরে যান</span>
        </button>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-900/40 border border-red-700/60 rounded-2xl mb-3.5 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-red-500" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-red-500 font-bold block mb-1">
            বার্তাচিত্র সিএমএস সিকিউরিটি
          </span>
          <h1 className="text-2xl font-black text-white font-bengali-display">
            অ্যাডমিন প্যানেল লগইন
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            সংবাদ সম্পাদনা ও সাইট পরিচালনার জন্য অনুমোদিত ক্রেডেনশিয়াল প্রদান করুন
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-700 text-red-200 text-xs px-4 py-3 rounded-lg mb-5 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ইউজারনেম বা ইমেইল
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin অথবা আপনার ইমেইল"
                disabled={isLoading}
                required
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                className="w-full bg-slate-950 border border-slate-700 focus:border-red-600 focus:ring-1 focus:ring-red-600 rounded-lg pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-hidden transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm shadow-md"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>যাচাইকরণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>নিরাপদ লগইন</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>সেশনভিত্তিক সুরক্ষিত PHP অথেন্টিকেশন ও MySQL ডেটাবেস এনক্রিপশন</span>
          </p>
        </div>
      </div>
    </div>
  );
};
