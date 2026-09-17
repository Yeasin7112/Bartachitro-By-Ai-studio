import React, { useState, useMemo } from 'react';
import { 
  Bell, BellRing, Send, Sparkles, Zap, Smartphone, 
  CheckCircle2, AlertCircle, RefreshCw, Trash2, ExternalLink,
  Users, MousePointerClick, ShieldCheck, Eye, Search, Filter,
  Share2, ArrowRight, MessageSquare
} from 'lucide-react';
import { NewsArticle, PushNotification } from '../../types';
import { bnNum, bnDate, getNowBangladeshString } from '../../utils/bengaliHelpers';

interface AdminPushNotificationsProps {
  newsList: NewsArticle[];
  pushList: PushNotification[];
  onSendPush: (notification: Omit<PushNotification, 'id' | 'sent_at'>) => Promise<PushNotification> | PushNotification;
  onDeletePush: (id: string | number) => void;
  onResendPush: (item: PushNotification) => void;
  selectedNewsForPush?: NewsArticle | null;
  onClearSelectedNews?: () => void;
}

export const AdminPushNotifications: React.FC<AdminPushNotificationsProps> = ({
  newsList,
  pushList,
  onSendPush,
  onDeletePush,
  onResendPush,
  selectedNewsForPush = null,
  onClearSelectedNews
}) => {
  // Form state
  const [selectedArticleId, setSelectedArticleId] = useState<number | ''>(
    selectedNewsForPush ? selectedNewsForPush.id : ''
  );
  const [title, setTitle] = useState<string>(selectedNewsForPush ? selectedNewsForPush.title : '');
  const [body, setBody] = useState<string>(
    selectedNewsForPush ? (selectedNewsForPush.summary || '') : ''
  );
  const [imageUrl, setImageUrl] = useState<string>(
    selectedNewsForPush ? (selectedNewsForPush.featured_image || '') : ''
  );
  const [categoryName, setCategoryName] = useState<string>(
    selectedNewsForPush ? (selectedNewsForPush.category_name || 'জাতীয়') : 'জাতীয়'
  );
  const [isBreaking, setIsBreaking] = useState<boolean>(
    selectedNewsForPush ? Boolean(selectedNewsForPush.is_breaking) : false
  );
  const [targetAudience, setTargetAudience] = useState<'all' | 'subscribed'>('all');

  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Handle article selection from dropdown
  const handleSelectArticle = (idStr: string) => {
    if (!idStr) {
      setSelectedArticleId('');
      return;
    }
    const id = Number(idStr);
    setSelectedArticleId(id);
    const found = newsList.find(n => n.id === id);
    if (found) {
      setTitle(found.title);
      setBody(found.summary || found.title);
      setImageUrl(found.featured_image || '');
      setCategoryName(found.category_name || 'সাধারণ');
      setIsBreaking(Boolean(found.is_breaking));
    }
  };

  // Metrics
  const totalSent = pushList.length;
  const totalClicks = useMemo(() => {
    return pushList.reduce((acc, curr) => acc + (curr.click_count || 0), 0);
  }, [pushList]);

  // Submit send notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setErrorMessage('অনুগ্রহ করে নোটিফিকেশনের শিরোনাম এবং বার্তা উভয়ই পূরণ করুন।');
      return;
    }

    setIsSending(true);
    setErrorMessage('');
    setFeedback('');

    try {
      const estimatedRecipients = targetAudience === 'all' ? 16500 : 8400;
      await onSendPush({
        title: title.trim(),
        body: body.trim(),
        article_id: selectedArticleId ? Number(selectedArticleId) : undefined,
        category_name: categoryName.trim(),
        image_url: imageUrl.trim() || undefined,
        status: 'sent',
        total_recipients: estimatedRecipients,
        click_count: 0,
        is_breaking: isBreaking
      });

      setFeedback('পুশ নোটিফিকেশন সকল পাঠকের ডিভাইসে সফলভাবে সম্প্রচার (Broadcast) করা হয়েছে!');
      
      // Try local browser native notification trigger for testing
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title.trim(), {
            body: body.trim(),
            icon: '/logo.svg',
            ...(imageUrl.trim() ? { image: imageUrl.trim() } : {})
          } as NotificationOptions);
        } catch {}
      }

      // Reset form if desired
      setTimeout(() => {
        setFeedback('');
        if (onClearSelectedNews) onClearSelectedNews();
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'নোটিফিকেশন প্রেরণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSending(false);
    }
  };

  // Test send in admin's own browser
  const handleTestInBrowser = async () => {
    if (!title.trim() || !body.trim()) {
      setErrorMessage('টেস্ট করার জন্য অন্তত শিরোনাম ও বার্তা পূরণ করুন।');
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setErrorMessage('আপনার ব্রাউজারে ওয়েব নোটিফিকেশন সুবিধা পাওয়া যায়নি। তবে ইন-অ্যাপ নোটিফিকেশন কাজ করবে।');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification(title.trim(), {
          body: body.trim(),
          icon: '/logo.svg',
          ...(imageUrl.trim() ? { image: imageUrl.trim() } : {})
        } as NotificationOptions);
        setFeedback('আপনার ব্রাউজারে একটি টেস্ট নোটিফিকেশন পাঠানো হয়েছে!');
        setTimeout(() => setFeedback(''), 3000);
      } catch (err: any) {
        setErrorMessage('নোটিফিকেশন প্রদর্শনে সমস্যা হয়েছে: ' + err.message);
      }
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title.trim(), {
          body: body.trim(),
          icon: '/logo.svg',
          ...(imageUrl.trim() ? { image: imageUrl.trim() } : {})
        } as NotificationOptions);
        setFeedback('পারমিশন মঞ্জুর হয়েছে এবং টেস্ট নোটিফিকেশন পাঠানো হয়েছে!');
        setTimeout(() => setFeedback(''), 3000);
      } else {
        setErrorMessage('ব্রাউজার নোটিফিকেশন পারমিশন পাওয়া যায়নি।');
      }
    } else {
      setErrorMessage('ব্রাউজারে নোটিফিকেশন ব্লক করা রয়েছে। ব্রাউজার সেটিংসে গিয়ে পারমিশন অন করুন।');
    }
  };

  // Filtered history
  const filteredHistory = useMemo(() => {
    if (!searchFilter.trim()) return pushList;
    const q = searchFilter.toLowerCase();
    return pushList.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.body.toLowerCase().includes(q) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
  }, [pushList, searchFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 font-bengali-display">
              <span>পুশ নোটিফিকেশন সেন্টার</span>
              <span className="bg-red-700 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">
                Web Push
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              পাঠক ও ভিজিটরদের ডিভাইসে সরাসরি নতুন ও জরুরি সংবাদের নোটিফিকেশন প্রেরণ ও পরিচালনা করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestInBrowser}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
            title="ব্রাউজারে টেস্ট নোটিফিকেশন দেখুন"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>ব্রাউজার টেস্ট</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">মোট প্রেরিত পুশ</span>
            <Send className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-2 font-mono">
            {bnNum(totalSent)} টি
          </p>
          <span className="text-[10px] text-emerald-400 mt-1 block">সরাসরি সম্প্রচারিত</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">সক্রিয় পাঠক প্রাপক</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-2 font-mono">
            {bnNum(16500)} জন
          </p>
          <span className="text-[10px] text-blue-300 mt-1 block">ব্রাউজার ও মোবাইল ডিভাইস</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">মোট পাঠক ক্লিক</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white mt-2 font-mono">
            {bnNum(totalClicks)} বার
          </p>
          <span className="text-[10px] text-emerald-300 mt-1 block">সংবাদ পড়ার রূপান্তর হার</span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">ডেলিভারি সাফল্য হার</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 font-mono">
            ৯৯.৮%
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">রিয়েল-টাইম ক্লাউড পুশ</span>
        </div>
      </div>

      {/* Main Grid: Form Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Compose Form */}
        <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4">
          <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-red-500" />
              <h3 className="text-sm sm:text-base font-bold text-white font-bengali-display">
                নতুন সংবাদ নোটিফিকেশন পাঠান
              </h3>
            </div>
            {selectedNewsForPush && (
              <span className="text-[11px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                সংবাদ থেকে সিলেক্টেড
              </span>
            )}
          </div>

          {feedback && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-950/80 border border-red-700 text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
            {/* Quick Pick from News */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>সংবাদ তালিকা থেকে অটো-ফিল করুন (ঐচ্ছিক):</span>
                <span className="text-[10px] text-slate-400 font-normal">সর্বশেষ প্রকাশিত সংবাদ</span>
              </label>
              <select
                value={selectedArticleId}
                onChange={(e) => handleSelectArticle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 text-xs"
              >
                <option value="">-- সংবাদ নির্বাচন করুন (অথবা নিচে কাস্টম লিখুন) --</option>
                {newsList.slice(0, 20).map(n => (
                  <option key={n.id} value={n.id}>
                    {n.is_breaking ? '🚨 [ব্রেকিং] ' : ''} {n.title} ({n.category_name || 'সাধারণ'})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>নোটিফিকেশনের শিরোনাম (Notification Title) *</span>
                <span className="text-[10px] text-slate-400 font-normal">{title.length}/১০০ অক্ষর</span>
              </label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="যেমন: ব্রেকিং: রাজধানীতে বিশেষ সতর্কবার্তা জারি..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-semibold"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                <span>নোটিফিকেশনের বার্তা বা সংক্ষিপ্ত বিবরণ (Message Body) *</span>
                <span className="text-[10px] text-slate-400 font-normal">{body.length}/২০০ অক্ষর</span>
              </label>
              <textarea 
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={240}
                placeholder="সংবাদের মূল আকর্ষণ বা জরুরি তথ্য এখানে লিখুন..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 leading-relaxed"
                required
              />
            </div>

            {/* Two Column: Category & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ক্যাটাগরি ট্যাগ</label>
                <input 
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="যেমন: জাতীয়, আন্তর্জাতিক, খেলা"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">ছবি বা থাম্বনেইল লিংক</label>
                <input 
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (ছবি থাকলে রূপান্তর বাড়ে)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Target Audience & Breaking Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">জরুরি ব্রেকিং নিউজ</span>
                  <span className="text-[10px] text-slate-400">উচ্চ অগ্রাধিকার ও লাল রঙের অ্যালার্ট</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                <span className="font-bold text-white block mb-1">প্রাপক পাঠক গ্রুপ</span>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="all">সকল পাঠক ও ব্রাউজার (~১৬,৫০০ জন)</option>
                  <option value="subscribed">কেবল নোটিফিকেশন অন করা ইউজার (~৮,৪০০ জন)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>পাঠকদের ডিভাইসে প্রেরণ করা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>এখনই পুশ নোটিফিকেশন পাঠান (Broadcast Now)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Preview Device Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-xl">
            <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-bengali-display">
                  লাইভ প্রিভিউ (পাঠক যেভাবে দেখবেন)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">রিয়েল-টাইম অনুকরণ</span>
            </div>

            {/* Realistic Push Banner Simulation */}
            <div className="mt-4 p-3.5 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl space-y-2 font-bengali-ui">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-[9px] text-white font-black">
                    বা
                  </div>
                  <span className="font-bold text-white">বার্তাচিত্র • এখন</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  isBreaking ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {isBreaking ? '🚨 ব্রেকিং' : categoryName}
                </span>
              </div>

              <div className="flex gap-2.5 items-start mt-1">
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0" 
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {title || 'নোটিফিকেশনের শিরোনাম এখানে প্রদর্শিত হবে...'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {body || 'সংবাদের বিবরণ বা আকর্ষণীয় সারাংশ এখানে পাঠকদের স্ক্রিনে ভেসে উঠবে।'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  ট্যাপ করে সংবাদটি পড়ুন <ArrowRight className="w-3 h-3" />
                </span>
                <span>www.bartachitro.com</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 space-y-1.5">
              <p className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>পুশ নোটিফিকেশন কার্যপদ্ধতি:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-400">
                <li>পাঠক ব্রাউজার বা মোবাইল ফোনে থাকা অবস্থায় সাথে সাথে পপআপ পাবেন।</li>
                <li>ক্লিক করলে সরাসরি নির্বাচিত সংবাদের ফুল ভিউ স্ক্রিন খুলে যাবে।</li>
                <li>ইন-অ্যাপ ব্যানার এবং ব্রাউজার নেটিভ পুশ উভয় প্রযুক্তি সমর্থিত।</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* History of Sent Notifications */}
      <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            <h3 className="text-base font-bold text-white font-bengali-display">
              প্রেরিত নোটিফিকেশনের ইতিহাস ({bnNum(filteredHistory.length)} টি)
            </h3>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="ইতিহাস খুঁজুন..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            কোনো প্রেরিত পুশ নোটিফিকেশন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/60">
                  <th className="py-2.5 px-3">শিরোনাম ও বার্তা</th>
                  <th className="py-2.5 px-3">ক্যাটাগরি</th>
                  <th className="py-2.5 px-3">প্রেরণের সময়</th>
                  <th className="py-2.5 px-3">প্রাপক সংখ্যা</th>
                  <th className="py-2.5 px-3">ক্লিক সংখ্যা</th>
                  <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-start gap-2.5 max-w-md">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt="" 
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                            <Bell className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                            {item.is_breaking && (
                              <span className="text-red-400 text-[10px] font-bold shrink-0">[ব্রেকিং]</span>
                            )}
                            <span>{item.title}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="bg-slate-900 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.category_name || 'সাধারণ'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                      {bnDate(item.sent_at || new Date(), true)}
                    </td>

                    <td className="py-3 px-3 text-slate-200 font-mono">
                      {bnNum(item.total_recipients || 15000)} জন
                    </td>

                    <td className="py-3 px-3 text-emerald-400 font-bold font-mono">
                      {bnNum(item.click_count || 0)} বার
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onResendPush(item)}
                          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="পুনরায় নোটিফিকেশন পাঠান"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeletePush(item.id)}
                          className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded-lg transition-colors cursor-pointer border border-red-800/40"
                          title="ইতিহাস থেকে মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
