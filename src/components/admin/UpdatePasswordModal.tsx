import React, { useState } from 'react';
import { 
  KeyRound, Lock, Eye, EyeOff, CheckCircle2, 
  AlertCircle, X, Loader2, ShieldCheck, ShieldAlert, UserCheck
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { changeUserPassword } from '../../utils/api';

interface UpdatePasswordModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const roleMeta: Record<AdminRole, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    super_admin: {
      label: 'সুপার অ্যাডমিন (Super Admin)',
      bg: 'bg-red-900/40 border-red-700/60',
      text: 'text-red-300',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
    },
    editor: {
      label: 'বার্তা সম্পাদক (Admin/Editor)',
      bg: 'bg-blue-900/40 border-blue-700/60',
      text: 'text-blue-300',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
    },
    moderator: {
      label: 'কমিউনিটি ও বার্তা মডারেটর (Moderator)',
      bg: 'bg-emerald-900/40 border-emerald-700/60',
      text: 'text-emerald-300',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
    }
  };

  const isMatching = newPassword && confirmPassword && newPassword === confirmPassword;
  const isMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার বর্তমান পুরাতন পাসওয়ার্ড দিন।');
      return;
    }

    if (!newPassword.trim()) {
      setErrorMsg('অনুগ্রহ করে একটি নতুন পাসওয়ার্ড নির্ধারণ করুন।');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড হুবহু মিলছে না।');
      return;
    }

    if (oldPassword.trim() === newPassword.trim()) {
      setErrorMsg('নতুন পাসওয়ার্ড পুরাতন পাসওয়ার্ডের চেয়ে ভিন্ন হতে হবে।');
      return;
    }

    setIsLoading(true);

    try {
      const res = await changeUserPassword({
        userId: user.id,
        username: user.username,
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim()
      });

      if (res.status === 'ok') {
        const msg = res.message || 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!';
        setSuccessMsg(msg);
        if (onSuccess) onSuccess(msg);

        // Reset fields
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.message || 'পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে। পুরাতন পাসওয়ার্ডটি সঠিক কিনা পরীক্ষা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = roleMeta[user.role] || roleMeta.editor;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-bengali-display">
                পাসওয়ার্ড আপডেট করুন
              </h3>
              <p className="text-xs text-slate-400">
                অ্যাডমিন ও মডারেটর অ্যাকাউন্টের নিরাপত্তা নিশ্চিতকরণ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge Info */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-700">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
              <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
            </div>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentRole.bg} ${currentRole.text}`}>
                {currentRole.icon}
                <span>{currentRole.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="bg-red-950/80 border border-red-700 text-red-200 text-xs px-3.5 py-2.5 rounded-xl flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs px-3.5 py-2.5 rounded-xl flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. Old Password */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>পুরাতন পাসওয়ার্ড (Old Password) *</span>
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                required
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                title={showOld ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              যাচাইকরণের জন্য আপনার বর্তমান পাসওয়ার্ড দিন (প্রাথমিক পাসওয়ার্ড: <span className="font-mono text-slate-300">admin123</span>)।
            </p>
          </div>

          {/* 2. New Password */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>নতুন পাসওয়ার্ড (New Password) *</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="কমপক্ষে ৪ অক্ষরের নতুন পাসওয়ার্ড"
                required
                minLength={4}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                title={showNew ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && newPassword.length < 4 && (
              <p className="text-[10px] text-rose-400 mt-1">
                পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।
              </p>
            )}
          </div>

          {/* 3. Confirm New Password */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>নতুন পাসওয়ার্ড নিশ্চিতকরণ (Confirm New Password) *</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="নতুন পাসওয়ার্ডটি হুবহু পুনরায় লিখুন"
                required
                minLength={4}
                disabled={isLoading}
                className={`w-full bg-slate-950 border rounded-lg px-3 py-2.5 pr-10 text-white text-xs placeholder-slate-500 focus:outline-none transition-colors ${
                  isMismatch 
                    ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : isMatching 
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                    : 'border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                title={showConfirm ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Validation match helper */}
            {isMatching && (
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলেছে</span>
              </p>
            )}
            {isMismatch && (
              <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>পাসওয়ার্ড মিলছে না, দয়া করে একই পাসওয়ার্ড দিন</span>
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer text-xs"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isLoading || (Boolean(newPassword && confirmPassword && newPassword !== confirmPassword))}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>আপডেট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>পাসওয়ার্ড আপডেট করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
