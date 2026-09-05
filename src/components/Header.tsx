import React, { useState } from 'react';
import { 
  Calendar, CloudSun, Newspaper, Search, Menu, X, 
  Download, ShieldCheck, Home, ArrowRight, ChevronRight
} from 'lucide-react';
import { Category, NewsArticle, SiteSettings } from '../types';
import { bnDate } from '../utils/bengaliHelpers';
import { SiteLogo } from './SiteLogo';

interface HeaderProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateEpaper: () => void;
  onNavigateSearch: (query: string) => void;
  onNavigateArchive: () => void;
  onOpenArticle: (article: NewsArticle) => void;
  onOpenAdmin: () => void;
  onDownloadZip: () => void;
  allNews: NewsArticle[];
  settings?: SiteSettings;
  disableAds?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  onNavigateHome,
  onNavigateEpaper,
  onNavigateSearch,
  onNavigateArchive,
  onOpenArticle,
  onOpenAdmin,
  onDownloadZip,
  allNews
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<NewsArticle[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Top Utility Bar - Clean, Compact, Fully Responsive */}
      <div className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 px-3 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Date and Weather */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <div className="flex items-center gap-1 font-medium text-gray-700 whitespace-nowrap">
              <Calendar className="w-3 h-3 text-red-700 shrink-0" />
              <span>{bnDate(new Date().toISOString(), true)}</span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-gray-500 text-[11px]">
              <CloudSun className="w-3 h-3 text-amber-600 shrink-0" />
              <span>ঢাকা ২৯° সে.</span>
            </div>
          </div>

          {/* Right: Quick Portals & Tools */}
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold shrink-0">
            <button 
              onClick={onNavigateArchive}
              className="text-gray-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              আর্কাইভ
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={onNavigateEpaper}
              className="text-gray-700 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Newspaper className="w-3 h-3 text-red-700" />
              <span className="hidden xs:inline">ই-পত্রিকা</span>
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={onOpenAdmin}
              className="text-gray-700 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="অ্যাডমিন সিএমএস ড্যাশবোর্ড"
            >
              <ShieldCheck className="w-3 h-3 text-gray-600" />
              <span>অ্যাডমিন</span>
            </button>
            <button 
              onClick={onDownloadZip}
              className="hidden sm:flex bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded text-[10px] font-bold items-center gap-1 transition-colors cursor-pointer ml-1 shadow-xs"
              title="সম্পূর্ণ PHP 8+ / MySQL কোডবেস ডাউনলোড করুন"
            >
              <Download className="w-3 h-3" />
              PHP
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
          <SiteLogo size="md" />
        </div>

        {/* Center Desktop Navigation (lg screens and up) */}
        <div className="hidden lg:flex flex-1 mx-4 xl:mx-8">
          <nav className="flex justify-center items-center gap-3.5 xl:gap-5 text-sm font-bold border-y border-gray-100 py-2.5 w-full flex-wrap">
            <button 
              onClick={onNavigateHome} 
              className={`transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === 'home' ? 'text-red-700' : 'text-gray-800 hover:text-red-700'
              }`}
            >
              হোম
            </button>
            {categories.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.slug ? 'text-red-700' : 'text-gray-800 hover:text-red-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button 
              onClick={onNavigateEpaper} 
              className="text-gray-800 hover:text-red-700 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <Newspaper className="w-3.5 h-3.5 text-red-700" />
              ই-পত্রিকা
            </button>
          </nav>
        </div>

        {/* Right Area: Search & Controls (Never overflows on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Desktop Search Bar (Hidden on mobile < sm) */}
          <div className="relative hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="অনুসন্ধান করুন..."
                className="bg-gray-100 border border-gray-200 rounded-full py-1.5 pl-3.5 pr-8 text-xs w-36 sm:w-44 lg:w-48 focus:ring-1 focus:ring-red-600 focus:bg-white text-gray-900 focus:outline-none transition-all"
              />
              <button 
                type="submit" 
                className="absolute right-2 text-gray-400 hover:text-red-700 cursor-pointer p-0.5"
                title="অনুসন্ধান"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Live Autocomplete Suggestions (Desktop) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-md shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="bg-gray-50 px-3 py-1.5 text-[11px] font-bold text-gray-600 border-b border-gray-200">
                  পরামর্শ (Suggestions)
                </div>
                <ul>
                  {suggestions.map((item) => (
                    <li key={item.id} className="border-b border-gray-100 last:border-0">
                      <button
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery('');
                          onOpenArticle(item);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs transition-colors flex flex-col cursor-pointer"
                      >
                        <span className="text-[10px] font-bold text-red-700">[{item.category_name}]</span>
                        <span className="text-gray-900 font-medium line-clamp-1">{item.title}</span>
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
            className="sm:hidden p-2 text-gray-700 hover:text-red-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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
            className="lg:hidden p-2 text-gray-700 hover:text-red-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
            aria-label="মেনু খুলুন"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Full-Width Search Bar (Appears cleanly below masthead when toggled) */}
      {mobileSearchOpen && (
        <div className="sm:hidden bg-gray-50 border-t border-gray-200 px-4 py-2.5 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="সংবাদ অনুসন্ধান করুন..."
              className="bg-white border border-gray-300 rounded-lg py-2 pl-3.5 pr-10 text-xs w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button 
              type="submit" 
              className="absolute right-2 text-gray-500 hover:text-red-700 cursor-pointer p-1"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Mobile live suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mt-2 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
              <ul>
                {suggestions.map((item) => (
                  <li key={item.id} className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => {
                        setShowSuggestions(false);
                        setMobileSearchOpen(false);
                        setSearchQuery('');
                        onOpenArticle(item);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex flex-col"
                    >
                      <span className="text-[10px] font-bold text-red-700">{item.category_name}</span>
                      <span className="text-gray-900 font-medium line-clamp-1">{item.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Horizontal Mobile Category Strip (BBC Bangla & Banglavision style) */}
      <div className="lg:hidden bg-white border-t border-gray-200 px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-4 text-xs font-bold text-gray-800">
        <button 
          onClick={onNavigateHome} 
          className={`shrink-0 cursor-pointer ${activeCategory === 'home' ? 'text-red-700' : 'hover:text-red-700'}`}
        >
          হোম
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`shrink-0 cursor-pointer ${activeCategory === cat.slug ? 'text-red-700' : 'hover:text-red-700'}`}
          >
            {cat.name}
          </button>
        ))}
        <button 
          onClick={onNavigateEpaper} 
          className="shrink-0 text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
        >
          <Newspaper className="w-3 h-3" />
          ই-পত্রিকা
        </button>
      </div>

      {/* 4. Full Mobile Navigation Drawer (when hamburger is open) */}
      {mobileNavOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-4 py-4 flex flex-col gap-1 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">মেনু ও বিভাগসমূহ</span>
            <button 
              onClick={() => setMobileNavOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-1"
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
              activeCategory === 'home' ? 'bg-red-50 text-red-700' : 'text-gray-800 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4 text-red-700" /> হোমপেজ
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.slug);
                setMobileNavOpen(false);
              }}
              className={`text-left py-2.5 px-3 text-sm font-bold rounded flex items-center justify-between ${
                activeCategory === cat.slug ? 'bg-red-50 text-red-700' : 'text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{cat.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}

          <div className="border-t border-gray-200 my-2 pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                onNavigateEpaper();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-sm text-red-700 font-bold bg-red-50 rounded flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4" /> আজকের ডিজিটাল ই-পত্রিকা
            </button>
            <button
              onClick={() => {
                onNavigateArchive();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-sm text-gray-700 font-bold hover:bg-gray-50 rounded flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> পুরোনো সংবাদ আর্কাইভ
            </button>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-sm text-gray-700 font-bold hover:bg-gray-50 rounded flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> অ্যাডমিন সিএমএস পোর্টাল
            </button>
            <button 
              onClick={() => {
                onDownloadZip();
                setMobileNavOpen(false);
              }}
              className="text-left py-2 px-3 text-xs text-emerald-700 font-bold hover:bg-emerald-50 rounded flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> PHP 8+ / MySQL কোডবেস জিপ
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
