import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Clock, ArrowLeft, Filter, Calendar, 
  User, FolderTree, X, ChevronLeft, ChevronRight, 
  RotateCcw, SlidersHorizontal, Eye, Tag 
} from 'lucide-react';
import { NewsArticle, Category } from '../types';
import { bnNum, timeAgoBn, bnDate } from '../utils/bengaliHelpers';

interface SearchViewProps {
  initialQuery: string;
  allNews: NewsArticle[];
  categories?: Category[];
  onOpenArticle: (article: NewsArticle) => void;
  onNavigateHome: () => void;
}

type DateRangePreset = 'all' | 'today' | '7days' | '30days' | 'this_year' | 'custom';

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery,
  allNews,
  categories = [],
  onOpenArticle,
  onNavigateHome
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_read' | 'title'>('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(true);

  // Sync initial query if prop changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Reset to page 1 whenever search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedCategory, selectedAuthor, datePreset, customStartDate, customEndDate, sortBy, itemsPerPage]);

  // Unique list of authors extracted from news
  const availableAuthors = useMemo(() => {
    const set = new Set<string>();
    allNews.forEach(n => {
      if (n.author_name && n.author_name.trim()) {
        set.add(n.author_name.trim());
      }
    });
    return Array.from(set).sort();
  }, [allNews]);

  // Unique categories if not provided as props
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const catMap = new Map<string, string>();
    allNews.forEach(n => {
      if (n.category_name) {
        catMap.set(n.category_name, n.category_name);
      }
    });
    return Array.from(catMap.keys()).map((name, id) => ({ id, name, slug: name }));
  }, [categories, allNews]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const now = new Date();

    return allNews.filter(item => {
      // 1. Keyword search (Title, Summary, Category, Author, Tags)
      if (trimmed) {
        const matchesTitle = item.title?.toLowerCase().includes(trimmed);
        const matchesSummary = item.summary?.toLowerCase().includes(trimmed);
        const matchesCat = item.category_name?.toLowerCase().includes(trimmed);
        const matchesAuthor = item.author_name?.toLowerCase().includes(trimmed);
        const matchesTags = item.seo_keywords?.toLowerCase().includes(trimmed);
        if (!matchesTitle && !matchesSummary && !matchesCat && !matchesAuthor && !matchesTags) {
          return false;
        }
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (item.category_name !== selectedCategory && String(item.category_id) !== selectedCategory) {
          return false;
        }
      }

      // 3. Author filter
      if (selectedAuthor !== 'all') {
        if (item.author_name !== selectedAuthor) {
          return false;
        }
      }

      // 4. Date range filter
      if (datePreset !== 'all' && item.published_at) {
        const pubDate = new Date(item.published_at);
        if (isNaN(pubDate.getTime())) return true;

        if (datePreset === 'today') {
          const isSameDay = pubDate.toDateString() === now.toDateString();
          if (!isSameDay) return false;
        } else if (datePreset === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (pubDate < sevenDaysAgo) return false;
        } else if (datePreset === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (pubDate < thirtyDaysAgo) return false;
        } else if (datePreset === 'this_year') {
          if (pubDate.getFullYear() !== now.getFullYear()) return false;
        } else if (datePreset === 'custom') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (pubDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (pubDate > end) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'most_read') {
        return (Number(b.views) || 0) - (Number(a.views) || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'bn');
      }
      // default: newest
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
  }, [allNews, query, selectedCategory, selectedAuthor, datePreset, customStartDate, customEndDate, sortBy]);

  // Pagination calculation
  const totalItems = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  // Active filters count
  const activeFiltersCount = (
    (query ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedAuthor !== 'all' ? 1 : 0) +
    (datePreset !== 'all' ? 1 : 0)
  );

  // Reset all filters
  const handleResetFilters = () => {
    setQuery('');
    setSelectedCategory('all');
    setSelectedAuthor('all');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-red-700 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> 
        <span>প্রচ্ছদে ফিরে যান</span>
      </button>

      {/* SEARCH HEADER & ADVANCED FILTER PANEL */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs mb-8 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-bengali-display flex items-center gap-2">
              <Search className="w-6 h-6 text-red-700" />
              উন্নত সংবাদ অনুসন্ধান (Advanced Search)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              কি-ওয়ার্ড, ক্যাটাগরি, নির্দিষ্ট সময়সীমা ও লেখকের নাম দিয়ে নির্ভুলভাবে যে কোনো সংবাদ খুঁজে বের করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-red-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{showFiltersPanel ? 'ফিল্টার লুকান' : 'ফিল্টার অপশন খুলুন'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-700 text-white text-[10px] font-bold flex items-center justify-center ml-1">
                {bnNum(activeFiltersCount)}
              </span>
            )}
          </button>
        </div>

        {/* Primary Keyword Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="খবরের শিরোনাম, বিষয়বস্তু বা যে কোনো কি-ওয়ার্ড লিখুন..."
            className="w-full bg-gray-50/80 border border-gray-300 rounded-xl pl-11 pr-10 py-3 text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-red-700 transition-all shadow-inner"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-1"
              title="মুছুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsible Filter Bar */}
        {showFiltersPanel && (
          <div className="pt-4 border-t border-gray-150 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
            
            {/* 1. Category Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-red-700" />
                <span>ক্যাটাগরি / বিভাগ</span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-red-700 transition-colors"
              >
                <option value="all">সকল ক্যাটাগরি</option>
                {availableCategories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Author Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-700" />
                <span>লেখক / প্রতিবেদক</span>
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-red-700 transition-colors"
              >
                <option value="all">সকল প্রতিবেদক</option>
                {availableAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Date Range Preset */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-700" />
                <span>প্রকাশনার সময়সীমা</span>
              </label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-red-700 transition-colors"
              >
                <option value="all">যে কোনো সময় (All Time)</option>
                <option value="today">আজকের প্রকাশিত (Today)</option>
                <option value="7days">গত ৭ দিন (Past 7 Days)</option>
                <option value="30days">গত ৩০ দিন (Past 30 Days)</option>
                <option value="this_year">এই বছর (This Year)</option>
                <option value="custom">কাস্টম তারিখ রেঞ্জ (Custom)...</option>
              </select>
            </div>

            {/* 4. Sort Order */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-red-700" />
                <span>ফলাফল সাজান (Sort)</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-gray-800 focus:outline-none focus:border-red-700 transition-colors"
              >
                <option value="newest">সর্বশেষ প্রকাশিত (নতুন আগে)</option>
                <option value="most_read">সর্বাধিক পঠিত (জনপ্রিয়)</option>
                <option value="oldest">পুরাতন সংবাদ প্রথমে</option>
                <option value="title">শিরোনাম অনুযায়ী (অ-ক্ষর)</option>
              </select>
            </div>

            {/* Custom Date Inputs (if custom preset chosen) */}
            {datePreset === 'custom' && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-gray-50 p-3 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">হতে (From Date):</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">পর্যন্ত (To Date):</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs text-gray-800"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE FILTER CHIPS & RESET */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-400 text-[11px]">সক্রিয় ফিল্টার:</span>

            {query && (
              <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                শব্দ: "{query}"
                <button onClick={() => setQuery('')} className="hover:text-red-900 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                বিভাগ: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-red-700 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAuthor !== 'all' && (
              <span className="bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                লেখক: {selectedAuthor}
                <button onClick={() => setSelectedAuthor('all')} className="hover:text-red-700 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {datePreset !== 'all' && (
              <span className="bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                সময়সীমা: {datePreset === 'today' ? 'আজ' : datePreset === '7days' ? 'গত ৭ দিন' : datePreset === '30days' ? 'গত ৩০ দিন' : datePreset === 'this_year' ? 'এই বছর' : 'কাস্টম রেঞ্জ'}
                <button onClick={() => { setDatePreset('all'); setCustomStartDate(''); setCustomEndDate(''); }} className="hover:text-red-700 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-red-700 hover:text-red-800 text-[11px] font-bold flex items-center gap-1 ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>সকল ফিল্টার রিসেট করুন</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS STATUS STRIP */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-red-700 pb-2 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-bengali-display">
            {query ? `‘${query}’ সম্পর্কিত ফলাফল` : 'অনুসন্ধান ফলাফল তালিকা'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            {totalItems > 0 ? (
              <>মোট <strong>{bnNum(totalItems)}টি</strong> সংবাদের মধ্যে <strong>{bnNum(startIndex + 1)} - {bnNum(endIndex)}</strong> প্রদর্শিত হচ্ছে</>
            ) : (
              'কোনো সংবাদ পাওয়া যায়নি'
            )}
          </p>
        </div>

        {/* Per page selector */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>প্রতি পৃষ্ঠায়:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-red-700"
            >
              <option value={9}>৯টি</option>
              <option value={12}>১২টি</option>
              <option value={18}>১৮টি</option>
              <option value={24}>২৪টি</option>
            </select>
          </div>
        )}
      </div>

      {/* RESULTS CONTENT */}
      {filteredResults.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-gray-800 text-base font-bold">কোনো সংবাদ খুঁজে পাওয়া যায়নি</p>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            আপনার অনুসন্ধান শব্দের বানান পরীক্ষা করুন অথবা ফিল্টারগুলো পরিবর্তন করে পুনরায় চেষ্টা করুন।
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      ) : (
        <>
          {/* Mobile View: Stream List */}
          <div className="block sm:hidden divide-y divide-gray-200">
            {paginatedResults.map((item) => (
              <article 
                key={item.id}
                onClick={() => onOpenArticle(item)}
                className="flex gap-3 py-3.5 cursor-pointer group"
              >
                <div className="w-28 aspect-[16/10] shrink-0 bg-gray-100 overflow-hidden rounded-lg">
                  <img 
                    src={item.featured_image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    loading="lazy" 
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <h3 className="font-bold text-xs text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                    <span>{timeAgoBn(item.published_at)}</span>
                    <span className="text-red-600 font-semibold">{item.category_name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Desktop View: Grid Cards */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedResults.map((item) => (
              <article 
                key={item.id}
                onClick={() => onOpenArticle(item)}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-500 transition-all flex flex-col group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative">
                  <img 
                    src={item.featured_image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.category_name}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug font-bengali-display">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="truncate max-w-[120px] font-medium text-gray-600">{item.author_name}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{timeAgoBn(item.published_at)}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* NUMBERED PAGINATION BAR */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-200">
              <span className="text-xs text-gray-500 font-medium order-2 sm:order-1">
                পৃষ্ঠা <strong>{bnNum(currentPage)}</strong> / <strong>{bnNum(totalPages)}</strong>
              </span>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 cursor-pointer'
                  }`}
                  title="পূর্ববর্তী পৃষ্ঠা"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">পূর্ববর্তী</span>
                </button>

                {/* Page Number Pills */}
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                  // Show current page, surrounding 1 page, first and last page
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    Math.abs(pageNum - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-red-700 text-white shadow-sm'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {bnNum(pageNum)}
                      </button>
                    );
                  }
                  // Ellipsis
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-gray-400 text-xs px-1">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-300 cursor-pointer'
                  }`}
                  title="পরবর্তী পৃষ্ঠা"
                >
                  <span className="hidden sm:inline">পরবর্তী</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
