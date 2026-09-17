import React, { useState, useEffect } from 'react';
import { 
  Calendar, CloudSun, Newspaper, Search, Menu, X, 
  Download, ShieldCheck, Home, ArrowRight, ChevronRight, ChevronDown,
  BookOpen, Clock, Smartphone, Sun, Moon, Bell, BellRing
} from 'lucide-react';
import { Category, NewsArticle, SiteSettings } from '../types';
import { bnNum } from '../utils/bengaliHelpers';
import { SiteLogo } from './SiteLogo';

interface HeaderProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateEpaper: () => void;
  onNavigateSearch: (query: string) => void;
  onNavigateArchive: () => void;
  onNavigateBlog?: () => void;
  onNavigateAppDownload?: () => void;
  isBlogActive?: boolean;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenAdmin: () => void;
  onDownloadZip?: () => void;
  allNews: NewsArticle[];
  settings?: SiteSettings;
  disableAds?: boolean;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  notificationSubscribed?: boolean;
  onToggleNotificationSubscription?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onNavigateHome,
  onNavigateEpaper,
  onNavigateSearch,
  onNavigateArchive,
  onNavigateBlog,
  onNavigateAppDownload,
  isBlogActive = false,
  onOpenArticle,
  onOpenAdmin,
  onDownloadZip,
  allNews,
  settings,
  theme = 'light',
  onToggleTheme,
  notificationSubscribed = false,
  onToggleNotificationSubscription
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<NewsArticle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Format compact date and 12-hour time (e.g., 12:00 PM)
  const formatTime12 = (d: Date) => {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const bnDays = [
    'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
  ];
  const dayName = bnDays[currentDate.getDay()];
  const day = bnNum(currentDate.getDate());
  const month = bnMonths[currentDate.getMonth()];
  const year = bnNum(currentDate.getFullYear());
  const formattedDate = `${dayName}, ${day} ${month} ${year}`;
  const formattedTime = formatTime12(currentDate);

  const handleSearchInput = (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      const q = val.toLowerCase();
      const matches = allNews.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.summary.toLowerCase().includes(q) ||
        (n.category_name && n.category_name.toLowerCase().includes(q))
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      onNavigateSearch(searchQuery.trim());
    }
  };

  return (
    <header className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 transition-colors">
      {/* 1. Top Utility Bar - Clean, Compact, Fully Visible on Mobile & Desktop */}
      <div className="bg-gray-100 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 text-[11px] sm:text-xs text-gray-800 dark:text-slate-200 px-2 sm:px-6 py-1 font-bengali-ui transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Date & Live Time (Always fully visible on mobile & desktop) */}
          <div className="flex items-center gap-1 sm:gap-2 font-medium text-gray-800 dark:text-slate-200 shrink-0 font-bengali-ui">
            <Calendar className="w-3 h-3 text-red-600 dark:text-red-500 shrink-0" />
            <span className="font-bold text-gray-950 dark:text-white">{dayName}, {day} {month}</span>
            <span className="hidden sm:inline font-bold text-gray-950 dark:text-white">{year}</span>
            <span className="text-gray-300 dark:text-slate-700">|</span>
            <span className="flex items-center gap-0.5 text-gray-700 dark:text-slate-300">
              <Clock className="w-3 h-3 text-gray-500 dark:text-slate-400 shrink-0" />
              <span className="font-medium">{formattedTime}</span>
            </span>
          </div>

          {/* Right: Only E-paper & Login (Upper header strictly contains: Date-time-epaper-login) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* E-paper Link */}
            <button 
              onClick={onNavigateEpaper}
              className="text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 active:bg-red-100 dark:active:bg-red-950/60 font-bold flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-[11px] sm:text-xs"
              title="ই-পেপার সংস্করণ"
            >
              <Newspaper className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />
              <span>ই-পেপার</span>
            </button>

            <span className="text-gray-300 dark:text-slate-700">|</span>

            {/* Admin Login Button */}
            <button 
              onClick={onOpenAdmin}
              className="text-slate-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400 active:bg-gray-200 dark:active:bg-slate-700 font-bold flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded bg-gray-200/90 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-[11px] sm:text-xs shadow-2xs"
              title="অ্যাডমিন প্যানেলে প্রবেশ করুন"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
              <span>লগইন</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Masthead Row (Logo + Search + Desktop Nav) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Official Brand Logo with Original Wave Shape Emblem */}
        <div 
          className="cursor-pointer select-none shrink-0 group flex items-center py-0.5" 
          onClick={onNavigateHome}
          title="বার্তাচিত্র - হোমপেজ"
        >
          <SiteLogo size="md" logoUrl={settings?.logo_url} />
        </div>

        {/* Center Desktop Navigation (lg screens and up) */}
        <div className="hidden lg:flex flex-1 mx-4 xl:mx-8">
          <nav className="flex justify-center items-center gap-3.5 xl:gap-5 text-sm font-bold border-y border-gray-100 dark:border-slate-800 py-2.5 w-full flex-wrap transition-colors">
            <button 
              onClick={onNavigateHome} 
              className={`transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'home' ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400'
              }`}
            >
              হোম
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.slug ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {categories.length > 8 && (
              <div className="relative group">
                <button 
                  type="button"
                  className={`transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    categories.slice(8).some(c => c.slug === activeCategory)
                      ? 'text-red-700 dark:text-red-400 font-bold'
                      : 'text-gray-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400'
                  }`}
                >
                  <span>আরও বিভাগ</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-gray-100 dark:border-slate-800 py-1.5 hidden group-hover:block z-50">
                  {categories.slice(8).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.slug)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors block cursor-pointer ${
                        activeCategory === cat.slug ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-red-700 dark:hover:text-red-400'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button 
              onClick={onNavigateBlog} 
              className={`transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isBlogActive ? 'text-red-700 dark:text-red-400 font-black' : 'text-gray-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
              <span>ব্লগ ও মুক্তচিন্তা</span>
              <span className="bg-red-700 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">নতুন</span>
            </button>
            <button 
              onClick={onNavigateEpaper} 
              className="text-gray-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <Newspaper className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
              ই-পত্রিকা
            </button>
            {settings?.android_app?.enabled !== false && onNavigateAppDownload && (
              <button
                onClick={onNavigateAppDownload}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs"
                title="বার্তাচিত্র মোবাইল অ্যাপ (.APK)"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>অ্যাপ ডাউনলোড</span>
              </button>
            )}
          </nav>
        </div>

        {/* Right Area: Search & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* User Theme Switcher (Dark/Light mode) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-full cursor-pointer transition-colors border ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
              }`}
              title={theme === 'dark' ? 'লাইট মোডে পরিবর্তন করুন (Switch to Light Mode)' : 'ডার্ক মোডে পরিবর্তন করুন (Switch to Dark Mode)'}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>
          )}
          {/* Desktop Search Bar (Hidden on mobile < sm) */}
          <div className="relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="অনুসন্ধান করুন..."
                className="bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full py-1.5 pl-3.5 pr-8 text-xs w-36 sm:w-44 lg:w-48 focus:ring-1 focus:ring-red-600 focus:bg-white dark:focus:bg-slate-850 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-2 text-gray-400 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 cursor-pointer p-0.5"
                title="অনুসন্ধান"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Live Autocomplete Suggestions (Desktop) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white dark:bg-slate-900 rounded-md shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                <div className="bg-gray-50 dark:bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-slate-300 border-b border-gray-200 dark:border-slate-700">
                  পরামর্শ (Suggestions)
                </div>
                <ul>
                  {suggestions.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                      <button
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery('');
                          onOpenArticle(item);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs transition-colors flex flex-col cursor-pointer"
                      >
                        <span className="text-[10px] font-bold text-red-700 dark:text-red-400">[{item.category_name}]</span>
                        <span className="text-gray-900 dark:text-slate-100 font-medium line-clamp-1">{item.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mobile Search Button (Toggles full-width mobile search bar) */}
          <button
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen);
              if (mobileNavOpen) setMobileNavOpen(false);
            }}
            className="sm:hidden p-2 text-gray-700 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="অনুসন্ধান করুন"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button 
            onClick={() => {
              setMobileNavOpen(!mobileNavOpen);
              if (mobileSearchOpen) setMobileSearchOpen(false);
            }}
            className="lg:hidden p-2 text-gray-700 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="মেনু খুলুন"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Width Search Bar (Appears cleanly below masthead when toggled) */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-2.5 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="সংবাদ অনুসন্ধান করুন..."
              className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg py-2 pl-3.5 pr-10 text-xs w-full text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button 
              type="submit" 
              className="absolute right-2 text-gray-500 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-400 cursor-pointer p-1"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile live suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 bg-white dark:bg-slate-850 rounded-md shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <ul>
                {suggestions.map((item) => (
                  <li key={item.id} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                    <button
                      onClick={() => {
                        setShowSuggestions(false);
                        setMobileSearchOpen(false);
                        setSearchQuery('');
                        onOpenArticle(item);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-slate-800 flex flex-col"
                    >
                      <span className="text-[10px] font-bold text-red-700 dark:text-red-400">{item.category_name}</span>
                      <span className="text-gray-900 dark:text-slate-100 font-medium line-clamp-1">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Horizontal Mobile Category Strip (BBC Bangla & Banglavision style) */}
      <div className="lg:hidden bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-4 text-xs font-bold text-gray-800 dark:text-slate-200 transition-colors">
        <button 
          onClick={onNavigateHome} 
          className={`shrink-0 cursor-pointer ${activeCategory === 'home' ? 'text-red-700 dark:text-red-400' : 'hover:text-red-700 dark:hover:text-red-400'}`}
        >
          হোম
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`shrink-0 cursor-pointer ${activeCategory === cat.slug ? 'text-red-700 dark:text-red-400' : 'hover:text-red-700 dark:hover:text-red-400'}`}
          >
            {cat.name}
          </button>
        ))}
        <button 
          onClick={onNavigateBlog} 
          className={`shrink-0 flex items-center gap-1 cursor-pointer ${
            isBlogActive ? 'text-red-700 dark:text-red-400 font-black' : 'text-gray-800 dark:text-slate-200 hover:text-red-700 dark:hover:text-red-400'
          }`}
        >
          <BookOpen className="w-3 h-3 text-red-700 dark:text-red-400" />
          <span>ব্লগ</span>
          <span className="bg-red-700 text-white text-[8px] px-1 rounded-full font-bold">নতুন</span>
        </button>
        <button 
          onClick={onNavigateEpaper} 
          className="shrink-0 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1 cursor-pointer"
        >
          <Newspaper className="w-3 h-3" />
          ই-পত্রিকা
        </button>
      </div>

      {/* 4. Full Mobile Navigation Drawer (when hamburger is open) */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-4 flex flex-col gap-1 shadow-xl max-h-[80vh] overflow-y-auto transition-colors">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-slate-800">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider">মেনু ও বিভাগসমূহ</span>
            <button 
              onClick={() => setMobileNavOpen(false)}
              className="text-gray-400 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onNavigateHome();
              setMobileNavOpen(false);
            }}
            className={`text-left py-2.5 px-3 text-sm font-bold rounded flex items-center justify-between ${
              activeCategory === 'home' && !isBlogActive ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4 text-red-700 dark:text-red-400" /> হোমপেজ
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          </button>

          <button
            onClick={() => {
              if (onNavigateBlog) onNavigateBlog();
              setMobileNavOpen(false);
            }}
            className={`text-left py-2.5 px-3 text-sm font-bold rounded flex items-center justify-between ${
              isBlogActive ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-red-700 dark:text-red-400" /> মুক্তচিন্তা ও আমাদের ব্লগ
            </span>
            <span className="bg-red-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">নতুন</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.slug);
                setMobileNavOpen(false);
              }}
              className={`text-left py-2.5 px-3 text-sm font-bold rounded flex items-center justify-between ${
                activeCategory === cat.slug ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
            </button>
          ))}

          <div className="border-t border-gray-200 dark:border-slate-800 my-2 pt-3 flex flex-col gap-2">
            {/* User Theme Selector in Mobile Menu */}
            {onToggleTheme && (
              <button
                onClick={() => {
                  onToggleTheme();
                }}
                className="text-left py-2.5 px-3 text-sm font-bold bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                  <span>থিম মোড</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                  {theme === 'dark' ? 'ডার্ক মোড সক্রিয়' : 'রেগুলার লাইট মোড'}
                </span>
              </button>
            )}

            {/* Notification Subscription in Mobile Menu */}
            {onToggleNotificationSubscription && (
              <button
                onClick={() => {
                  onToggleNotificationSubscription();
                }}
                className={`text-left py-2.5 px-3 text-sm font-bold rounded flex items-center justify-between transition-colors ${
                  notificationSubscribed
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                    : 'bg-gray-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  {notificationSubscribed ? (
                    <BellRing className="w-4 h-4 text-red-600 animate-pulse" />
                  ) : (
                    <Bell className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                  )}
                  <span>পুশ নোটিফিকেশন</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold">
                  {notificationSubscribed ? 'অন (Active)' : 'চালু করুন'}
                </span>
              </button>
            )}

            {settings?.android_app?.enabled !== false && onNavigateAppDownload && (
              <button
                onClick={() => {
                  onNavigateAppDownload();
                  setMobileNavOpen(false);
                }}
                className="text-left py-2 px-3 text-sm text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> অ্যান্ড্রয়েড অ্যাপ (.APK)
                </span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                  ফ্রি ডাউনলোড
                </span>
              </button>
            )}
            <button
              onClick={() => {
                onNavigateEpaper();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-sm text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/60 rounded flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4" /> আজকের ডিজিটাল ই-পত্রিকা
            </button>
            <button
              onClick={() => {
                onNavigateArchive();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-sm text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> পুরোনো সংবাদ আর্কাইভ
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-sm text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 rounded flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> অ্যাডমিন সিএমএস পোর্টাল
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
