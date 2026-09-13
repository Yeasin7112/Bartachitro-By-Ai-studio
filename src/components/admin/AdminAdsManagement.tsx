import React, { useState } from 'react';
import { 
  Megaphone, PlusCircle, Edit3, Trash2, Check, X, AlertCircle, 
  ExternalLink, Eye, MousePointerClick, RefreshCw, Power, 
  Layers, Sliders, Image as ImageIcon, Sparkles
} from 'lucide-react';
import { Advertisement, SiteSettings } from '../../types';
import { bnNum } from '../../utils/bengaliHelpers';
import { ImageUploader } from '../ImageUploader';

interface AdminAdsManagementProps {
  ads: Advertisement[];
  settings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => Promise<void> | void;
  onAddAd?: (ad: Partial<Advertisement>) => Promise<Advertisement | void> | void;
  onUpdateAd?: (ad: Advertisement) => Promise<void> | void;
  onDeleteAd?: (id: number) => Promise<void> | void;
  onToggleAdStatus?: (id: number) => Promise<void> | void;
}

export const AD_POSITIONS_META: Record<string, { label: string; desc: string; size: string; badge: string }> = {
  header_top: {
    label: 'হেডার ব্যানার (টপ)',
    desc: 'ওয়েবসাইটের একদম উপরে হেডারের পাশে বা উপরে দৃশ্যমান',
    size: '৭২৮ × ৯০ অথবা ৯৭০ × ৯০',
    badge: 'bg-blue-950/80 text-blue-300 border-blue-700/50'
  },
  home_middle: {
    label: 'হোমপেজ মিডল ব্যানার',
    desc: 'প্রধান সংবাদ ও ক্যাটাগরি সেকশনের মধ্যবর্তী অংশে দৃশ্যমান',
    size: '৭২৮ × ৯০ অথবা ৯৭০ × ২৫০',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-700/50'
  },
  sidebar: {
    label: 'সাইডবার ব্যানার',
    desc: 'হোমপেজ ও সংবাদের ডান পাশের সাইডবারে দৃশ্যমান',
    size: '৩০০ × ২৫০ অথবা ৩০০ × ৬০০',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
  },
  article_inline: {
    label: 'সংবাদের ভেতরে ব্যানার (Inline)',
    desc: 'সংবাদের বিস্তারিত পাতার মূল লেখার অনুচ্ছেদের মাঝে দৃশ্যমান',
    size: '৭২৮ × ৯০ অথবা ৪৬৮ × ৬০',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-700/50'
  },
  lead_bottom: {
    label: 'প্রধান সংবাদের নিচে ব্যানার',
    desc: 'হোমপেজের লিড ও সাব-লিড নিউজের ঠিক নিচে দৃশ্যমান',
    size: '৭২৮ × ৯০ অথবা ৯৭০ × ৯০',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-700/50'
  },
  footer_top: {
    label: 'ফুটার টপ ব্যানার',
    desc: 'ওয়েবসাইটের ফুটারে যাওয়ার আগে প্রধান বডির নিচে দৃশ্যমান',
    size: '৭২৮ × ৯০ অথবা ৯৭০ × ৯০',
    badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50'
  },
  popup: {
    label: 'পপআপ / স্পেশাল প্রমোশন',
    desc: 'স্পেশাল ইভেন্ট বা ঈদ/উৎসব অফার প্রমোশনাল ব্যানার',
    size: '৬০০ × ৪০০ অথবা ৫০০ × ৫০০',
    badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50'
  }
};

const SAMPLE_ADS = [
  {
    title: 'ডিজিটাল ব্যাংকিং প্রমোশন',
    position: 'header_top',
    image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=970&h=120&fit=crop&q=80',
    target_url: 'https://bartachitro.com'
  },
  {
    title: 'জাতীয় প্রযুক্তি মেলা ২০২৬',
    position: 'home_middle',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&h=160&fit=crop&q=80',
    target_url: 'https://bartachitro.com'
  },
  {
    title: 'স্মার্টফোন স্পেশাল ডিসকাউন্ট',
    position: 'sidebar',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=500&fit=crop&q=80',
    target_url: 'https://bartachitro.com'
  },
  {
    title: 'ই-কমার্স মেগা সেল অফার',
    position: 'article_inline',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=140&fit=crop&q=80',
    target_url: 'https://bartachitro.com'
  }
];

export const AdminAdsManagement: React.FC<AdminAdsManagementProps> = ({
  ads,
  settings,
  onUpdateSettings,
  onAddAd,
  onUpdateAd,
  onDeleteAd,
  onToggleAdStatus
}) => {
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [deletingAdId, setDeletingAdId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form states for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formPosition, setFormPosition] = useState<string>('header_top');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const openAddModal = () => {
    setFormTitle('');
    setFormPosition('header_top');
    setFormImageUrl('');
    setFormTargetUrl('https://');
    setFormStatus('active');
    setFormError('');
    setShowAddModal(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormTitle(ad.title);
    setFormPosition(ad.position);
    setFormImageUrl(ad.image_url);
    setFormTargetUrl(ad.target_url || 'https://');
    setFormStatus(ad.status);
    setFormError('');
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingAd(null);
    setFormError('');
  };

  const handleGlobalToggle = async () => {
    const newDisable = !settings.disable_ads;
    const updated = { ...settings, disable_ads: newDisable };
    await onUpdateSettings(updated);
    setFeedback(
      newDisable 
        ? 'পুরো ওয়েবসাইটে সকল বিজ্ঞাপন সফলভাবে বন্ধ করা হয়েছে (Global Ads Off)!' 
        : 'পুরো ওয়েবসাইটে বিজ্ঞাপন সফলভাবে চালু করা হয়েছে (Global Ads Active)!'
    );
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleToggleSingleAd = async (ad: Advertisement) => {
    if (onToggleAdStatus) {
      await onToggleAdStatus(ad.id);
    } else if (onUpdateAd) {
      const nextStatus = ad.status === 'active' ? 'inactive' : 'active';
      await onUpdateAd({ ...ad, status: nextStatus });
    }
    setFeedback(`"${ad.title}" বিজ্ঞাপনের স্ট্যাটাস পরিবর্তন করা হয়েছে।`);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('বিজ্ঞাপনের শিরোনাম প্রদান করুন।');
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError('বিজ্ঞাপনের ইমেজ URL প্রদান করুন অথবা ইমেজ ফাইল আপলোড করুন।');
      return;
    }

    setIsSaving(true);
    setFormError('');

    try {
      if (editingAd) {
        // Update existing ad
        const updated: Advertisement = {
          ...editingAd,
          title: formTitle.trim(),
          position: formPosition as any,
          image_url: formImageUrl.trim(),
          target_url: formTargetUrl.trim() || '#',
          status: formStatus
        };
        if (onUpdateAd) {
          await onUpdateAd(updated);
        }
        setFeedback(`"${updated.title}" বিজ্ঞাপনটি সফলভাবে আপডেট করা হয়েছে!`);
      } else {
        // Create new ad
        const newAdPayload: Partial<Advertisement> = {
          title: formTitle.trim(),
          position: formPosition as any,
          image_url: formImageUrl.trim(),
          target_url: formTargetUrl.trim() || '#',
          status: formStatus,
          views: 0,
          clicks: 0
        };
        if (onAddAd) {
          await onAddAd(newAdPayload);
        }
        setFeedback(`নতুন বিজ্ঞাপন "${formTitle}" সফলভাবে তৈরি ও সংরক্ষণ করা হয়েছে!`);
      }
      closeModals();
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      setFormError(err?.message || 'বিজ্ঞাপন সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (id: number) => {
    if (onDeleteAd) {
      await onDeleteAd(id);
      setFeedback('বিজ্ঞাপন সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setFeedback(''), 3000);
    }
    setDeletingAdId(null);
  };

  // Filtered ads
  const filteredAds = ads.filter(ad => {
    if (filterPosition !== 'all' && ad.position !== filterPosition) return false;
    if (filterStatus !== 'all' && ad.status !== filterStatus) return false;
    return true;
  });

  const activeCount = ads.filter(a => a.status === 'active').length;
  const inactiveCount = ads.filter(a => a.status === 'inactive').length;
  const totalImpressions = ads.reduce((acc, a) => acc + (a.views || 0), 0);
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-black text-white font-bengali-display">
              বিজ্ঞাপন ব্যানার ও প্রমোশন ব্যবস্থাপনা
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ওয়েবসাইটের সকল অ্যাড স্লট, ব্যানার ইমেজ, টার্গেট লিঙ্ক এবং প্রদর্শন স্ট্যাটাস নিয়ন্ত্রণ করুন।
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন বিজ্ঞাপন তৈরি করুন</span>
        </button>
      </div>

      {/* Global Ads Disable / Enable Master Toggle */}
      <div className={`p-5 rounded-xl border transition-all ${
        settings.disable_ads
          ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
          : 'bg-emerald-950/30 border-emerald-500/40'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              settings.disable_ads 
                ? 'bg-amber-900/60 border-amber-500/60 text-amber-300' 
                : 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  পুরো ওয়েবসাইটে বিজ্ঞাপন নিয়ন্ত্রণ (Global Ads Master Switch)
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  settings.disable_ads ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {settings.disable_ads ? 'OFF' : 'LIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {settings.disable_ads
                  ? 'বর্তমান অবস্থা: পুরো ওয়েবসাইটে সকল বিজ্ঞাপন এবং স্পন্সর ব্যানার প্রদর্শন স্থগিত (Disabled) রয়েছে।'
                  : 'বর্তমান অবস্থা: পুরো ওয়েবসাইটে সক্রিয় বিজ্ঞাপন ও ব্যানার স্বাভাবিকভাবে পাঠকদের দেখানো হচ্ছে (Active)।'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGlobalToggle}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2 shrink-0 ${
              settings.disable_ads
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-700 hover:bg-red-600 text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{settings.disable_ads ? 'বিজ্ঞাপন চালু করুন (Turn ON Ads)' : 'সকল বিজ্ঞাপন বন্ধ করুন (Turn OFF All)'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-900/40 border border-blue-600/40 text-blue-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">মোট বিজ্ঞাপন</p>
            <p className="text-lg font-black text-white font-bengali-display">{bnNum(ads.length)} টি</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-900/40 border border-emerald-600/40 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">সক্রিয় বিজ্ঞাপন</p>
            <p className="text-lg font-black text-emerald-400 font-bengali-display">{bnNum(activeCount)} টি</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-700/40 border border-slate-600/40 text-slate-400 flex items-center justify-center">
            <X className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">নিষ্ক্রিয় / বন্ধ</p>
            <p className="text-lg font-black text-slate-300 font-bengali-display">{bnNum(inactiveCount)} টি</p>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-900/40 border border-red-600/40 text-red-400 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400">মোট ক্লিকস</p>
            <p className="text-lg font-black text-white font-bengali-display">{bnNum(totalClicks)}</p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">স্লট ফিল্টার:</span>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">সকল স্লট ({bnNum(ads.length)})</option>
            {Object.entries(AD_POSITIONS_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </select>

          <span className="text-xs text-slate-400 font-medium ml-2">স্ট্যাটাস:</span>
          <div className="inline-flex rounded-lg border border-slate-700 p-0.5 bg-slate-900">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                filterStatus === 'all' ? 'bg-red-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              সকল
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              সক্রিয় ({bnNum(activeCount)})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('inactive')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                filterStatus === 'inactive' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              বন্ধ ({bnNum(inactiveCount)})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          প্রদর্শিত হচ্ছে: <strong className="text-white font-bengali-display">{bnNum(filteredAds.length)}</strong> টি বিজ্ঞাপন
        </span>
      </div>

      {/* Ads Cards Grid */}
      {filteredAds.length === 0 ? (
        <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-xl p-12 text-center">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300">কোনো বিজ্ঞাপন পাওয়া যায়নি</p>
          <p className="text-xs text-slate-500 mt-1">ফিল্টার পরিবর্তন করুন অথবা নতুন বিজ্ঞাপন তৈরি করুন।</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            বিজ্ঞাপন তৈরি করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAds.map((ad) => {
            const meta = AD_POSITIONS_META[ad.position] || {
              label: ad.position,
              desc: 'কাস্টম স্লট',
              size: 'স্ট্যান্ডার্ড',
              badge: 'bg-slate-700 text-slate-300 border-slate-600'
            };
            const isActive = ad.status === 'active';

            return (
              <div 
                key={ad.id} 
                className={`bg-slate-800/90 border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ${
                  isActive ? 'border-slate-700 hover:border-slate-600' : 'border-slate-700/60 opacity-85'
                }`}
              >
                {/* Card Header with Slot Badge and Quick Toggle */}
                <div className="p-4 pb-3 border-b border-slate-700/70">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${meta.badge}`}>
                      {meta.label}
                    </span>

                    {/* Quick On/Off Switch Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleSingleAd(ad)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/80'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                      title={isActive ? 'বিজ্ঞাপনটি বন্ধ করতে ক্লিক করুন' : 'বিজ্ঞাপনটি চালু করতে ক্লিক করুন'}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span>{isActive ? 'সক্রিয় (ON)' : 'বন্ধ (OFF)'}</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-1" title={ad.title}>
                    {ad.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">রেকমেন্ডেড সাইজ: {meta.size}</p>
                </div>

                {/* Banner Preview Area */}
                <div className="p-4 bg-slate-900/60 flex-1 flex flex-col justify-center">
                  <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[16/7] flex items-center justify-center group">
                    {ad.image_url ? (
                      <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center p-4 text-slate-500 text-xs">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                        <span>ইমেজ পাওয়া যায়নি</span>
                      </div>
                    )}
                    
                    {/* Hover Overlay with External Link */}
                    {ad.target_url && (
                      <a
                        href={ad.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white font-bold transition-opacity backdrop-blur-xs cursor-pointer"
                        title="বিজ্ঞাপনের লিঙ্ক পরীক্ষা করুন"
                      >
                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                        <span>টার্গেট লিঙ্ক দেখুন</span>
                      </a>
                    )}
                  </div>

                  {/* Target URL text */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 truncate">
                    <span className="truncate max-w-[200px]" title={ad.target_url}>
                      লিঙ্ক: {ad.target_url || '#'}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">আইডি #{ad.id}</span>
                  </div>
                </div>

                {/* Card Footer with Stats & Action Buttons */}
                <div className="p-3 bg-slate-800 border-t border-slate-700/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1" title="মোট প্রদর্শন">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{bnNum(ad.views || 0)}</span>
                    </span>
                    <span className="flex items-center gap-1" title="মোট ক্লিক">
                      <MousePointerClick className="w-3.5 h-3.5 text-red-400" />
                      <span>{bnNum(ad.clicks || 0)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(ad)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      title="বিজ্ঞাপন এডিট করুন"
                    >
                      <Edit3 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingAdId(ad.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="বিজ্ঞাপন মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD / EDIT ADVERTISEMENT */}
      {(showAddModal || editingAd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-bengali-display">
                    {editingAd ? 'বিজ্ঞাপন সম্পাদনা (Edit Ad)' : 'নতুন বিজ্ঞাপন তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    বিজ্ঞাপনের স্লট, ব্যানার ইমেজ ও টার্গেট লিঙ্ক কনফিগার করুন।
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModals}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-950/70 border border-red-600/50 text-red-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAd} className="space-y-4">
              {/* Title & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    বিজ্ঞাপনের নাম / শিরোনাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="যেমন: প্রযুক্তি মেলা অফার ব্যানার"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    বিজ্ঞাপনের স্লট / পজিশন <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {Object.entries(AD_POSITIONS_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label} ({meta.size})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Slot Description Box */}
              {AD_POSITIONS_META[formPosition] && (
                <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">{AD_POSITIONS_META[formPosition].label}: </span>
                    <span>{AD_POSITIONS_META[formPosition].desc}</span>
                    <span className="block text-[11px] text-emerald-300 mt-0.5">
                      অনুমোদিত সাইজ: {AD_POSITIONS_META[formPosition].size}
                    </span>
                  </div>
                </div>
              )}

              {/* Target Link URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  টার্গেট ওয়েব লিঙ্ক (Target Click URL)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formTargetUrl}
                    onChange={(e) => setFormTargetUrl(e.target.value)}
                    placeholder="https://example.com/promo"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                  {formTargetUrl && formTargetUrl.startsWith('http') && (
                    <a
                      href={formTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      title="নতুন ট্যাবে লিঙ্ক টেস্ট করুন"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  পাঠক বিজ্ঞাপনে ক্লিক করলে যে ওয়েবসাইটে যাবে।
                </p>
              </div>

              {/* Image Input via ImageUploader Component */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  বিজ্ঞাপন ব্যানার ইমেজ <span className="text-red-500">*</span>
                </label>
                <ImageUploader
                  currentImage={formImageUrl}
                  onImageChange={(url) => setFormImageUrl(url)}
                  onImageSelected={(url) => setFormImageUrl(url)}
                  label="ব্যানার ছবি আপলোড করুন অথবা সরাসরি ইমেজ লিঙ্ক দিন"
                  helperText="রেকমেন্ডেড ফরম্যাট: JPG, PNG, WebP বা GIF ব্যানার।"
                />
              </div>

              {/* Sample Ads Presets (Quick Fill) */}
              <div className="bg-slate-800/40 border border-slate-700/60 p-3 rounded-xl">
                <p className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>নমুনা ব্যানার প্রি-সেট থেকে ছবি নির্বাচন করুন (Sample Presets):</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_ADS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormImageUrl(sample.image_url);
                        if (!formTitle.trim()) setFormTitle(sample.title);
                        setFormPosition(sample.position);
                      }}
                      className="text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
                    >
                      <img 
                        src={sample.image_url} 
                        alt={sample.title} 
                        className="w-full h-10 object-cover rounded mb-1" 
                      />
                      <p className="text-[10px] text-slate-300 group-hover:text-white font-medium truncate">
                        {sample.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Toggle in Form */}
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">বিজ্ঞাপনের অবস্থা (Ad Status)</h4>
                  <p className="text-[11px] text-slate-400">
                    {formStatus === 'active' 
                      ? 'সক্রিয়: এই বিজ্ঞাপনটি ওয়েবসাইটে নির্দিষ্ট স্লটে দেখানো হবে।' 
                      : 'নিষ্ক্রিয়: বিজ্ঞাপনটি সাময়িকভাবে বন্ধ থাকবে, কিন্তু ডাটাবেসে সেভ থাকবে।'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus(formStatus === 'active' ? 'inactive' : 'active')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formStatus === 'active' ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formStatus === 'active' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${formStatus === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {formStatus === 'active' ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  বাতিল করুন
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>সংরক্ষণ হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingAd ? 'বিজ্ঞাপন আপডেট করুন' : 'বিজ্ঞাপন সংরক্ষণ করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAdId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">বিজ্ঞাপন মুছে ফেলতে চান?</h3>
                <p className="text-xs text-slate-400">এই অ্যাকশনটি ফিরিয়ে নেওয়া সম্ভব নয়।</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-4 bg-slate-800/80 p-3 rounded-xl border border-slate-700/70">
              বিজ্ঞাপনটি স্থায়ীভাবে সিস্টেম থেকে মুছে ফেলা হবে। সাময়িকভাবে বন্ধ রাখতে চাইলে অন/অফ সুইচ ব্যবহার করতে পারেন।
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingAdId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deletingAdId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-600 text-white transition-all shadow-md cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
