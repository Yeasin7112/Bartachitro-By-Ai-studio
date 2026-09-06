import React, { useState } from 'react';
import {
  Globe, Search, Share2, CheckCircle2, AlertTriangle,
  Info, Sparkles, ExternalLink, HelpCircle
} from 'lucide-react';
import { bnNum } from '../utils/bengaliHelpers';

interface SeoMetaHelperProps {
  title: string;
  summary: string;
  content?: string;
  slug: string;
  featuredImage?: string;
  siteName?: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  onChangeSeoTitle: (val: string) => void;
  onChangeSeoDescription: (val: string) => void;
  onChangeSeoKeywords: (val: string) => void;
  itemType?: 'news' | 'blog';
}

export const SeoMetaHelper: React.FC<SeoMetaHelperProps> = ({
  title,
  summary,
  content = '',
  slug,
  featuredImage,
  siteName = 'বার্তাচিত্র',
  seoTitle,
  seoDescription,
  seoKeywords,
  onChangeSeoTitle,
  onChangeSeoDescription,
  onChangeSeoKeywords,
  itemType = 'news'
}) => {
  const [activePreview, setActivePreview] = useState<'google' | 'facebook'>('google');

  // Fallback defaults if SEO fields are empty
  const displayTitle = seoTitle.trim() || title || 'সংবাদের শিরোনাম এখানে প্রদর্শিত হবে';
  const displayDesc = seoDescription.trim() || summary || 'সংবাদের সংক্ষিপ্ত বিবরণ ও মেটা ডেসক্রিপশন এখানে দেখা যাবে...';
  const displayUrl = `https://bartachitro.com/${itemType === 'news' ? 'news' : 'blog'}/${slug || 'post-slug'}`;

  // Length calculations
  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;

  // Title Status
  let titleStatus: { label: string; color: string } = { label: 'খুব ছোট', color: 'text-amber-400' };
  if (titleLen >= 40 && titleLen <= 65) {
    titleStatus = { label: 'আদর্শ দৈর্ঘ্য (Optimal)', color: 'text-emerald-400' };
  } else if (titleLen > 65) {
    titleStatus = { label: 'বেশি বড় (Too long)', color: 'text-rose-400' };
  } else if (titleLen > 0) {
    titleStatus = { label: 'কিছুটা ছোট', color: 'text-amber-400' };
  } else {
    titleStatus = { label: 'ফাঁকা (ডিফল্ট ব্যবহৃত হবে)', color: 'text-slate-400' };
  }

  // Description Status
  let descStatus: { label: string; color: string } = { label: 'খুব ছোট', color: 'text-amber-400' };
  if (descLen >= 120 && descLen <= 165) {
    descStatus = { label: 'আদর্শ দৈর্ঘ্য (Optimal)', color: 'text-emerald-400' };
  } else if (descLen > 165) {
    descStatus = { label: 'বেশি বড় (Too long)', color: 'text-rose-400' };
  } else if (descLen > 0) {
    descStatus = { label: 'কিছুটা ছোট', color: 'text-amber-400' };
  } else {
    descStatus = { label: 'ফাঁকা (ডিফল্ট ব্যবহৃত হবে)', color: 'text-slate-400' };
  }

  // SEO Score Checklist calculation
  const checks = [
    {
      id: 'title',
      label: 'SEO টাইটেল যুক্ত করা হয়েছে এবং দৈর্ঘ্য মানসম্মত',
      passed: titleLen >= 30 && titleLen <= 70,
      weight: 25
    },
    {
      id: 'desc',
      label: 'মেটা ডেসক্রিপশন যুক্ত করা হয়েছে (১০০-১৬৫ অক্ষর)',
      passed: descLen >= 80 && descLen <= 170,
      weight: 25
    },
    {
      id: 'keywords',
      label: 'সার্চ কিওয়ার্ড (Focus Keywords) যুক্ত রয়েছে',
      passed: seoKeywords.trim().length > 3,
      weight: 20
    },
    {
      id: 'image',
      label: 'সোশ্যাল শেয়ার ও গুগলের জন্য ফিচার্ড ছবি রয়েছে',
      passed: Boolean(featuredImage && featuredImage.trim()),
      weight: 15
    },
    {
      id: 'slug',
      label: 'ক্লিন ও রিডেবল URL স্লাগ ব্যবহার করা হয়েছে',
      passed: Boolean(slug && slug.length >= 3),
      weight: 15
    }
  ];

  const totalScore = checks.reduce((acc, curr) => acc + (curr.passed ? curr.weight : 0), 0);

  const handleAutoGenerate = () => {
    if (title && !seoTitle) {
      onChangeSeoTitle(`${title.slice(0, 60)} | ${siteName}`);
    }
    if (summary && !seoDescription) {
      onChangeSeoDescription(summary.slice(0, 155));
    }
    if (!seoKeywords) {
      const words = title.split(' ').filter(w => w.length > 3).slice(0, 5).join(', ');
      onChangeSeoKeywords(`${siteName}, ${words}, বাংলা সংবাদ`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 sm:p-5 space-y-5">
      {/* Header & Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-bengali-display flex items-center gap-2">
              সার্চ ইঞ্জিন অপটিমাইজেশন (SEO ও মেটা ট্যাগ)
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                গুগল ফ্রেন্ডলি
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              গুগল সার্চ ও ফেসবুকে খবরটির র‌্যাঙ্কিং এবং শেয়ারিং লুক অপটিমাইজ করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* SEO Score Badge */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400">SEO স্কোর:</span>
            <span
              className={`text-xs font-black px-2 py-0.5 rounded ${
                totalScore >= 80
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/40'
                  : totalScore >= 50
                  ? 'bg-amber-900/80 text-amber-300 border border-amber-600/40'
                  : 'bg-rose-900/80 text-rose-300 border border-rose-600/40'
              }`}
            >
              {bnNum(totalScore)}%
            </span>
          </div>

          <button
            type="button"
            onClick={handleAutoGenerate}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="শিরোনাম ও বিবরণ থেকে স্বয়ংক্রিয় SEO প্রস্তুত করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">স্বয়ংক্রিয় পূরণ</span>
          </button>
        </div>
      </div>

      {/* SEO Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SEO Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              SEO মেটা টাইটেল (Google Search Title)
            </label>
            <span className={`text-[11px] font-semibold ${titleStatus.color}`}>
              {bnNum(titleLen)} / ৬০ অক্ষর ({titleStatus.label})
            </span>
          </div>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => onChangeSeoTitle(e.target.value)}
            placeholder={`${title || 'সংবাদের শিরোনাম'} | ${siteName}`}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
          />
          <p className="text-[10px] text-slate-500">
            গুগল ফলাফলের নীল শিরোনামে এটি প্রদর্শিত হবে। খালি রাখলে মূল শিরোনাম ব্যবহৃত হবে।
          </p>
        </div>

        {/* SEO Keywords */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              সার্চ কিওয়ার্ড / ট্যাগ (Focus Keywords)
            </label>
            <span className="text-[10px] text-slate-400">কমা (,) দিয়ে আলাদা করুন</span>
          </div>
          <input
            type="text"
            value={seoKeywords}
            onChange={(e) => onChangeSeoKeywords(e.target.value)}
            placeholder="যেমন: বাংলাদেশ, নির্বাচন, অর্থনীতি, ব্রেকিং নিউজ"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
          />
          <p className="text-[10px] text-slate-500">
            রোবট ও সার্চ ইঞ্জিন সহজে বিষয়বস্তু শনাক্ত করতে এই কিওয়ার্ডগুলো ব্যবহার করবে।
          </p>
        </div>

        {/* SEO Meta Description */}
        <div className="space-y-1.5 md:col-span-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              SEO মেটা ডেসক্রিপশন (Meta Description Snippet)
            </label>
            <span className={`text-[11px] font-semibold ${descStatus.color}`}>
              {bnNum(descLen)} / ১৬০ অক্ষর ({descStatus.label})
            </span>
          </div>
          <textarea
            rows={2}
            value={seoDescription}
            onChange={(e) => onChangeSeoDescription(e.target.value)}
            placeholder={summary || 'গুগল সার্চ ফলাফলের নিচে ২ লাইনের আকর্ষণীয় সংক্ষিপ্ত বিবরণ...'}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Live SERP & Social Card Preview Toggle */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-blue-400" />
            লাইভ প্রিভিউ (Live Snippet Preview):
          </span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setActivePreview('google')}
              className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                activePreview === 'google'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              গুগল সার্চ
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('facebook')}
              className={`text-[11px] px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                activePreview === 'facebook'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ফেসবুক / সোশ্যাল শেয়ার
            </button>
          </div>
        </div>

        {/* Google SERP Preview */}
        {activePreview === 'google' && (
          <div className="bg-white text-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 font-sans space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-4 h-4 rounded-full bg-red-700 text-white text-[9px] font-bold flex items-center justify-center">
                ব
              </span>
              <div className="flex flex-col">
                <span className="text-[12px] text-slate-800 font-semibold">{siteName}</span>
                <span className="text-[11px] text-slate-500 truncate max-w-sm">{displayUrl}</span>
              </div>
            </div>
            <h5 className="text-base text-[#1a0dab] hover:underline font-medium font-bengali-display leading-snug cursor-pointer line-clamp-1">
              {displayTitle}
            </h5>
            <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-bengali-body">
              {displayDesc}
            </p>
          </div>
        )}

        {/* Facebook OpenGraph Card Preview */}
        {activePreview === 'facebook' && (
          <div className="bg-[#18191a] text-white rounded-lg overflow-hidden border border-slate-700/80 max-w-lg mx-auto shadow-md">
            {featuredImage ? (
              <img src={featuredImage} alt="Social preview" className="w-full h-44 object-cover" />
            ) : (
              <div className="w-full h-32 bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                কোনো ফিচার্ড ছবি যুক্ত করা হয়নি
              </div>
            )}
            <div className="p-3 bg-[#242526] space-y-1">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">
                BARTACHITRO.COM
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2 font-bengali-display">
                {displayTitle}
              </h5>
              <p className="text-[11px] text-slate-300 line-clamp-2 font-bengali-body">
                {displayDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SEO Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
        {checks.map((chk) => (
          <div key={chk.id} className="flex items-center gap-2 text-xs">
            {chk.passed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
            <span className={chk.passed ? 'text-slate-300' : 'text-slate-500'}>
              {chk.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
