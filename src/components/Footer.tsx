import React, { useState } from 'react';
import { SiteSettings, Category } from '../types';
import { Mail, Phone, MapPin, Newspaper, BookOpen, Send, CheckCircle2, AlertCircle, Loader2, Facebook, Code2, ExternalLink } from 'lucide-react';
import { SiteLogo } from './SiteLogo';
import { subscribeNewsletter } from '../utils/api';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateEpaper: () => void;
  onNavigateContact: () => void;
  onNavigateAbout: () => void;
  onNavigateBlog?: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory,
  onNavigateHome,
  onNavigateEpaper,
  onNavigateContact,
  onNavigateAbout,
  onNavigateBlog
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setStatusMessage({ type: 'error', text: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await subscribeNewsletter(cleanEmail);
      if (res.status === 'ok') {
        setStatusMessage({ type: 'success', text: res.message || 'নিউজলেটারে সাবস্ক্রাইব সফল হয়েছে!' });
        setEmail('');
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'সাবস্ক্রাইব করা সম্ভব হয়নি।' });
      }
    } catch {
      setStatusMessage({ type: 'success', text: 'নিউজলেটারে সাবস্ক্রাইব সফল হয়েছে! আপনাকে ধন্যবাদ।' });
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-400 border-t-2 border-red-700 px-4 sm:px-6 py-8 text-xs">
      {/* Newsletter Subscription Section */}
      <div className="max-w-7xl mx-auto pb-6 mb-6 border-b border-gray-800">
        <div className="bg-gray-800/60 rounded-lg p-4 sm:p-5 border border-gray-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white font-bengali-display">
                প্রতিদিনের সংবাদ আপডেট পেতে সাবস্ক্রাইব করুন
              </h4>
              <p className="text-gray-400 text-xs mt-0.5 font-bengali-body">
                গুরুত্বপূর্ণ খবর ও বিশেষ প্রতিবেদন সরাসরি আপনার ইমেইলে পৌঁছে যাবে।
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="w-full md:w-auto max-w-md">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  id="newsletter-email-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  placeholder="আপনার ইমেইল লিখুন..."
                  required
                  className="w-full bg-gray-900/90 border border-gray-700 text-gray-100 placeholder-gray-500 text-xs rounded-md px-3.5 py-2 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                id="newsletter-submit-button"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-medium text-xs px-4 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>যুক্ত হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>সাবস্ক্রাইব</span>
                  </>
                )}
              </button>
            </form>

            {/* Status Feedback */}
            {statusMessage && (
              <div 
                className={`flex items-center gap-1.5 mt-2 text-[11px] ${
                  statusMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* High Density Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 pb-6 border-b border-gray-800">
        {/* Categories Col 1 */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            জাতীয় ও রাজনীতি
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px]">
            {categories.slice(0, 4).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.slug)}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Col 2 */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            অন্যান্য বিভাগ
          </h4>
          <div className="flex flex-col gap-1.5 text-[11px]">
            {categories.slice(4, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.slug)}
                className="text-left text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Special Services */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            ডিজিটাল সেবা
          </h4>
          <ul className="space-y-1.5 text-[11px]">
            <li>
              <button 
                onClick={onNavigateBlog} 
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-red-500" /> আমাদের ব্লগ ও মুক্তচিন্তা
              </button>
            </li>
            <li>
              <button 
                onClick={onNavigateEpaper} 
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Newspaper className="w-3 h-3" /> আজকের ই-পত্রিকা
              </button>
            </li>
            <li>
              <button onClick={onNavigateAbout} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                আমাদের সম্পর্কে
              </button>
            </li>
            <li>
              <button onClick={onNavigateContact} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                যোগাযোগ ও বার্তা
              </button>
            </li>
          </ul>
        </div>

        {/* Office Contact */}
        <div>
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-2.5 pb-1 border-b border-gray-800">
            যোগাযোগ
          </h4>
          <div className="text-[11px] text-gray-400 space-y-1.5">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{settings.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-red-500 shrink-0" />
              <span>{settings.phone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-red-500 shrink-0" />
              <span>{settings.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* High Density Bottom Masthead Bar with Official Site Logo */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px]">
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          {/* Original wave-shaped logo */}
          <div 
            onClick={onNavigateHome} 
            className="cursor-pointer inline-flex items-center hover:opacity-95 transition-opacity"
            title="বার্তাচিত্র"
          >
            <SiteLogo size="md" logoUrl={settings.logo_url} />
          </div>
          <p className="text-gray-400 text-[11px]">
            © ২০২৬ বার্তাচিত্র মিডিয়া লিমিটেড | সর্বস্বত্ব সংরক্ষিত
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1.5">
          <div className="flex gap-4 uppercase font-bold text-[10px] tracking-wider">
            <button onClick={onNavigateAbout} className="hover:text-white transition-colors cursor-pointer">
              আমাদের সম্পর্কে
            </button>
            <button onClick={onNavigateContact} className="hover:text-white transition-colors cursor-pointer">
              গোপনীয়তা
            </button>
            <button onClick={onNavigateContact} className="hover:text-white transition-colors cursor-pointer">
              যোগাযোগ
            </button>
          </div>
          <p className="italic text-[10px] text-gray-400 text-center md:text-right">
            সম্পাদক: {settings.editor_name || 'আহমেদ রফিক চৌধুরী'} • নির্বাহী সম্পাদক: {settings.executive_editor || 'শাহনেওয়াজ করিম'}
          </p>
        </div>
      </div>

      {/* Technical Support Credit - Small & Unique Modern Tech Badge */}
      <div className="max-w-7xl mx-auto mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 text-[11px]">
          <span className="text-gray-400 font-medium tracking-wide flex items-center gap-1 font-bengali-body">
            <Code2 className="w-3 h-3 text-emerald-400/80 shrink-0" />
            <span>কারিগরি সহায়তায় :</span>
          </span>
          <a
            href="https://www.facebook.com/share/1PrxWseYkE/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-gray-900 via-gray-800/90 to-gray-900 border border-emerald-500/40 hover:border-emerald-400 text-gray-200 hover:text-white shadow-[0_1px_4px_rgba(0,0,0,0.5)] hover:shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all duration-300 cursor-pointer"
            title="ইয়াছিন আরাফাত শাওন - ফেসবুক প্রোফাইল"
          >
            {/* Live radar indicator pulse */}
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>

            {/* Facebook brand micro logo */}
            <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <Facebook className="w-2 h-2 fill-white text-white" />
            </span>

            {/* Name in Bengali */}
            <span className="font-semibold text-[11px] text-gray-200 group-hover:text-emerald-300 transition-colors font-bengali-display tracking-tight">
              ইয়াছিন আরাফাত শাওন
            </span>

            {/* Micro external link icon */}
            <ExternalLink className="w-2.5 h-2.5 text-gray-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>
        </div>
      </div>
    </footer>
  );
};
