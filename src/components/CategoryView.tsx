import React, { useState, useMemo } from 'react';
import { Clock, ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { NewsArticle, Category } from '../types';
import { bnNum, bnDate, timeAgoBn } from '../utils/bengaliHelpers';

interface CategoryViewProps {
  categorySlug: string;
  categories: Category[];
  allNews: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
}

type DatePreset = 'all' | 'today' | 'last7' | 'thisMonth' | 'custom';

export const CategoryView: React.FC<CategoryViewProps> = ({
  categorySlug,
  categories,
  allNews,
  onOpenArticle
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const itemsPerPage = 8;

  const currentCat = categories.find(c => c.slug === categorySlug);
  const categoryTitle = categorySlug === 'all' 
    ? 'সব খবর' 
    : (currentCat ? currentCat.name : 'ক্যাটাগরি');

  // Handle Preset selection
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    setCurrentPage(1);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'last7') {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      setStartDate(past7.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  const handleResetFilters = () => {
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Filter news based on category and date range
  const filteredNews = useMemo(() => {
    // 1. Filter by category
    const catFiltered = categorySlug === 'all'
      ? allNews.filter(n => n.status === 'published')
      : allNews.filter(n => n.category_slug === categorySlug && n.status === 'published');

    // 2. Filter by date range if specified
    if (!startDate && !endDate) {
      return catFiltered;
    }

    return catFiltered.filter(item => {
      if (!item.published_at) return false;
      const itemDate = new Date(item.published_at);
      if (isNaN(itemDate.getTime())) return true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (itemDate < start) return false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (itemDate > end) return false;
      }

      return true;
    });
  }, [categorySlug, allNews, startDate, endDate]);

  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filteredNews.slice(startIndex, startIndex + itemsPerPage);

  const leadStory = currentPage === 1 && pageItems.length > 0 ? pageItems[0] : null;
  const gridStories = currentPage === 1 ? pageItems.slice(1) : pageItems;

  const isFilterActive = datePreset !== 'all' || startDate !== '' || endDate !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Category Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-red-700 pb-2.5 mb-4 gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-3xl font-black text-gray-950 font-bengali-display">
            {categoryTitle}
          </h1>
          <span className="text-xs bg-red-50 text-red-700 font-bold px-2.5 py-0.5 rounded-full border border-red-200">
            {bnNum(filteredNews.length)}টি সংবাদ
          </span>
        </div>

        {/* Filter Status Badge and Quick Reset */}
        <div className="flex items-center gap-2">
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded border border-red-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="ফিল্টার রিসেট করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Date Range Filter Bar (Always visible on mobile & desktop) */}
      <div className="bg-gradient-to-r from-gray-50 to-red-50/30 border border-gray-200 rounded-lg p-3 sm:p-4 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-gray-800 mr-1 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-red-700" /> তারিখ ফিল্টার:
            </span>
            <button
              onClick={() => handlePresetChange('all')}
              className={`px-3 py-1.5 rounded transition-all font-semibold cursor-pointer ${
                datePreset === 'all' 
                  ? 'bg-red-700 text-white shadow-xs' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              সব সময়
            </button>
            <button
              onClick={() => handlePresetChange('today')}
              className={`px-3 py-1.5 rounded transition-all font-semibold cursor-pointer ${
                datePreset === 'today' 
                  ? 'bg-red-700 text-white shadow-xs' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              আজকে
            </button>
            <button
              onClick={() => handlePresetChange('last7')}
              className={`px-3 py-1.5 rounded transition-all font-semibold cursor-pointer ${
                datePreset === 'last7' 
                  ? 'bg-red-700 text-white shadow-xs' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              গত ৭ দিন
            </button>
            <button
              onClick={() => handlePresetChange('thisMonth')}
              className={`px-3 py-1.5 rounded transition-all font-semibold cursor-pointer ${
                datePreset === 'thisMonth' 
                  ? 'bg-red-700 text-white shadow-xs' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              এই মাস
            </button>
          </div>

          {/* Specific Start & End Date Inputs */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200">
            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-2.5 py-1 shadow-2xs">
              <label htmlFor="startDateInput" className="text-gray-700 font-bold whitespace-nowrap text-[11px]">
                শুরুর তারিখ:
              </label>
              <input
                id="startDateInput"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset('custom');
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-gray-900 focus:outline-none cursor-pointer font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-2.5 py-1 shadow-2xs">
              <label htmlFor="endDateInput" className="text-gray-700 font-bold whitespace-nowrap text-[11px]">
                শেষ তারিখ:
              </label>
              <input
                id="endDateInput"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset('custom');
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-gray-900 focus:outline-none cursor-pointer font-medium"
              />
            </div>

            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                রিসেট
              </button>
            )}
          </div>
        </div>

        {/* Active Filter summary */}
        {isFilterActive && (
          <div className="mt-3 pt-2 border-t border-gray-200/80 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
            <span>
              নির্বাচিত সময়কাল: <strong className="text-red-700 font-bold">
                {startDate ? bnDate(startDate, false) : 'শুরু থেকে'} হতে {endDate ? bnDate(endDate, false) : 'আজ পর্যন্ত'}
              </strong>
            </span>
            <span className="text-gray-600 font-medium">
              পাওয়া গেছে: <strong className="text-gray-900 font-bold">{bnNum(filteredNews.length)}</strong>টি সংবাদ
            </span>
          </div>
        )}
      </div>

      {pageItems.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center my-6">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-bold text-base mb-1">
            {isFilterActive 
              ? 'নির্বাচিত তারিখের পরিসীমায় কোনো সংবাদ পাওয়া যায়নি।' 
              : 'এই ক্যাটাগরিতে বর্তমানে কোনো প্রকাশিত সংবাদ নেই।'}
          </p>
          <p className="text-gray-500 text-xs mb-4">
            অন্য কোনো তারিখ বা ক্যাটাগরি নির্বাচন করে আবার চেষ্টা করুন।
          </p>
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2 rounded transition-colors cursor-pointer"
            >
              সকল সংবাদ দেখুন
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ========================================================
              MOBILE VIEW: BBC Bangla & Banglavision style stream
              ======================================================== */}
          <div className="block sm:hidden mb-8">
            {leadStory && (
              <article 
                onClick={() => onOpenArticle(leadStory)}
                className="cursor-pointer group pb-3 border-b border-gray-200 mb-2"
              >
                <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 rounded-xs mb-2">
                  <img 
                    src={leadStory.featured_image} 
                    alt={leadStory.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <h2 className="text-lg font-bold font-bengali-display text-gray-950 leading-snug group-hover:text-red-700 transition-colors">
                  {leadStory.title}
                </h2>
                {leadStory.summary && (
                  <p className="text-xs text-gray-600 leading-relaxed mt-1 line-clamp-2">
                    {leadStory.summary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
                  <span>{timeAgoBn(leadStory.published_at)}</span>
                  <span>•</span>
                  <span className="text-red-600 font-semibold">{leadStory.category_name}</span>
                </div>
              </article>
            )}

            {/* List items with thumbnail left, headline right */}
            <div className="divide-y divide-gray-200">
              {gridStories.map((story) => (
                <article
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="flex gap-3 py-3 cursor-pointer group"
                >
                  <div className="w-28 aspect-[16/10] shrink-0 bg-gray-100 overflow-hidden rounded-xs">
                    <img 
                      src={story.featured_image} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                      loading="lazy" 
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-gray-900 leading-snug line-clamp-2 group-hover:text-red-700 transition-colors">
                      {story.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                      <span>{timeAgoBn(story.published_at)}</span>
                      <span className="text-red-600 font-semibold">{story.category_name}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ========================================================
              DESKTOP VIEW: High-Density Lead + Multi-Column Card Grid
              ======================================================== */}
          <div className="hidden sm:block">
            {/* Lead story on page 1 */}
            {leadStory && (
              <article 
                onClick={() => onOpenArticle(leadStory)}
                className="bg-white border border-gray-200 rounded overflow-hidden shadow-xs hover:border-red-300 transition-all mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer group"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  <img 
                    src={leadStory.featured_image} 
                    alt={leadStory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-red-700 block mb-2">{leadStory.category_name}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-950 font-bengali-display leading-tight group-hover:text-red-700 transition-colors">
                      {leadStory.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                      {leadStory.summary}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgoBn(leadStory.published_at)}
                  </div>
                </div>
              </article>
            )}

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {gridStories.map((story) => (
                <article 
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="bg-white border border-gray-200 rounded overflow-hidden hover:border-red-300 transition-all flex flex-col group cursor-pointer"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    <img 
                      src={story.featured_image} 
                      alt={story.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <span className="text-xs font-bold text-red-700 block mb-1">{story.category_name}</span>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2">
                        {story.title}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgoBn(story.published_at)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mb-10">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> পূর্ববর্তী
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded text-xs font-bold transition-colors cursor-pointer ${
                    currentPage === num
                      ? 'bg-red-700 text-white border border-red-700'
                      : 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {bnNum(num)}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded border border-gray-300 bg-white text-xs font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                পরবর্তী <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
