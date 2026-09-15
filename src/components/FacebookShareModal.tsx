import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, Download, ExternalLink, RefreshCw, 
  Smartphone, MessageSquare, Sparkles, CheckCircle2 
} from 'lucide-react';
import { NewsArticle } from '../types';

interface FacebookShareModalProps {
  article: NewsArticle;
  isOpen: boolean;
  onClose: () => void;
  siteName?: string;
}

export const FacebookShareModal: React.FC<FacebookShareModalProps> = ({
  article,
  isOpen,
  onClose,
  siteName = 'বার্তাচিত্র'
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const fullArticleUrl = currentUrl.includes('?') 
    ? currentUrl 
    : `${window.location.origin}/article.php?slug=${encodeURIComponent(article.slug)}`;

  const fullImageUrl = article.featured_image?.startsWith('http') 
    ? article.featured_image 
    : `${window.location.origin}${article.featured_image || ''}`;

  const formattedCaption = `${article.title}

${article.summary}

বিস্তারিত পড়ুন: ${fullArticleUrl}

#${siteName.replace(/\s+/g, '')} #বাংলাদেশ #সংবাদ #খবর`.trim();

  // 1. Direct Facebook Share Dialog URL
  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullArticleUrl)}`;

  // 2. Facebook Open Graph Debugger URL
  const fbDebuggerUrl = `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(fullArticleUrl)}`;

  // Copy caption
  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(formattedCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      // Fallback
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2500);
    }
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullArticleUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Download image for manual Facebook posting
  const handleDownloadImage = async () => {
    if (!fullImageUrl) return;
    setDownloading(true);
    try {
      const response = await fetch(fullImageUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeSlug = article.slug || `news-${article.id}`;
      link.download = `${safeSlug}-banner.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Direct window open fallback
      window.open(fullImageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // Native Mobile Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `${article.title}\n\n${article.summary}`,
          url: fullArticleUrl
        });
      } catch (err) {
        // User cancelled or not supported
      }
    } else {
      window.open(fbShareUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 text-slate-900 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1877f2] to-[#0c5dc7] px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold text-lg">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-bengali-display leading-tight">
                ফেসবুকে ছবি ও ক্যাপশন সহ শেয়ার
              </h3>
              <p className="text-xs text-blue-100 font-bengali-body">
                ১-ক্লিকে ফেসবুকে পোস্ট করুন অথবা সরাসরি ক্যাপশন ও ছবি ডাউনলোড করে নিন
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 font-bengali-body text-sm">
          {/* 1. Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={fbShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.98] text-center"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>১-ক্লিকে ফেসবুকে শেয়ার</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4" />
                <span>মোবাইলে সরাসরি শেয়ার</span>
              </button>
            )}

            <button
              onClick={handleCopyCaption}
              className={`flex items-center justify-center gap-2 font-bold py-2.5 px-4 rounded-xl border transition-all active:scale-[0.98] ${
                copiedCaption 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              {copiedCaption ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copiedCaption ? 'ক্যাপশন কপি হয়েছে!' : 'ক্যাপশন ও লিংক কপি'}</span>
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{downloading ? 'ডাউনলোড হচ্ছে...' : 'সংবাদের ছবি সেভ করুন'}</span>
            </button>
          </div>

          {/* 2. Simulated Facebook Post Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1877f2]"></span>
                ফেসবুক পোস্টের লাইভ প্রিভিউ (Facebook Preview)
              </span>
              <span className="text-[11px] text-slate-500">Open Graph Card</span>
            </div>

            {/* Post Header */}
            <div className="p-3">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1877f2] text-white flex items-center justify-center font-bold text-xs">
                  {siteName.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{siteName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1877f2] fill-[#1877f2]/20" />
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span>এইমাত্র</span>
                    <span>·</span>
                    <span>🌐</span>
                  </div>
                </div>
              </div>

              {/* Caption Preview */}
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3 line-clamp-4">
                {formattedCaption}
              </div>
            </div>

            {/* Banner Image Preview */}
            {article.featured_image && (
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img 
                  src={article.featured_image} 
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Link Preview Bar */}
            <div className="bg-slate-100/90 p-3 border-t border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {window.location.hostname || 'BARTACHITRO.COM'}
              </div>
              <div className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mt-0.5">
                {article.title}
              </div>
              <div className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                {article.summary}
              </div>
            </div>
          </div>

          {/* 3. Helper Instructions */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-[#1877f2]" />
              ফেসবুক শেয়ার টিপস ও গাইডলাইন:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 text-[11px] leading-normal">
              <li><strong>১-ক্লিক শেয়ার:</strong> বাটনে চাপলে সরাসরি ফেসবুকের নিজস্ব ডায়ালগ ওপেন হবে এবং ফেসবুক স্বয়ংক্রিয়ভাবে মূল ছবি ও হেডলাইন নিয়ে নিবে।</li>
              <li><strong>গ্রুপ বা পেইজে ছবি পোস্ট:</strong> "সংবাদের ছবি সেভ করুন" চেপে ছবিটি ফোনে বা পিসিতে নামিয়ে নিন এবং "ক্যাপশন কপি" চেপে সহজে ফেসবুকের যে কোনো পেইজ, গ্রুপ বা স্টোরিতে পোস্ট করুন।</li>
              <li><strong>ফেসবুক স্ক্র্যাপার রিফ্রেশ:</strong> সংবাদে নতুন ছবি বা তথ্য আপডেট করার পর ফেসবুকে পুরনো ছবি দেখালে নিচের লিংকে ক্লিক করে স্ক্র্যাপার রিফ্রেশ করুন।</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <a
            href={fbDebuggerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1877f2] hover:underline flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3 h-3" />
            ফেসবুক ক্যাশ রিফ্রেশ করুন (Debugger)
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="text-slate-700 hover:text-slate-900 flex items-center gap-1 font-semibold px-2.5 py-1 rounded bg-slate-200/80 hover:bg-slate-200 transition-colors"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copiedLink ? 'লিংক কপি হয়েছে' : 'লিংক কপি'}
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3.5 py-1 rounded-lg transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
