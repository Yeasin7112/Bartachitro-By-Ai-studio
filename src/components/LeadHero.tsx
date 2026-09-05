import React from 'react';
import { Newspaper, ChevronRight, Radio } from 'lucide-react';
import { NewsArticle } from '../types';
import { timeAgoBn } from '../utils/bengaliHelpers';

interface LeadHeroProps {
  leadStory: NewsArticle;
  subStories: NewsArticle[];
  latestArticles?: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onNavigateEpaper?: () => void;
  disableAds?: boolean;
}

export const LeadHero: React.FC<LeadHeroProps> = ({
  leadStory,
  subStories,
  latestArticles = [],
  onOpenArticle,
  onNavigateEpaper,
  disableAds = false
}) => {
  if (!leadStory) return null;

  const sideLatest = latestArticles.length > 0 ? latestArticles.slice(0, 4) : subStories.slice(0, 4);
  const bottomSubStories = subStories.slice(0, 2);

  // For mobile stream (BBC Bangla & Banglavision style)
  const mobileListStories = [...subStories, ...latestArticles.filter(a => a.id !== leadStory.id && !subStories.some(s => s.id === a.id))].slice(0, 6);

  return (
    <section className="mb-6 w-full" aria-label="প্রধান ও শীর্ষ সংবাদ">
      {/* ========================================================
          MOBILE VIEW: Exact BBC Bangla & Banglavision BD Style
          Full-width lead image with clean text below + 
          High-density horizontal thumbnail-left rows with dividers
          ======================================================== */}
      <div className="block md:hidden">
        {/* Mobile Lead Story (BBC Bangla & Banglavision style) */}
        <article 
          onClick={() => onOpenArticle(leadStory)}
          className="cursor-pointer group pb-3"
        >
          {/* Full-width clean photo on top (no text overlay) */}
          <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 rounded-xs mb-2.5">
            <img 
              src={leadStory.featured_image} 
              alt={leadStory.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>

          {/* Headline directly below image */}
          <div className="px-0.5">
            <h2 className="text-lg font-bold font-bengali-display text-gray-950 leading-snug group-hover:text-red-700 transition-colors">
              <span className="inline-flex items-center gap-1 bg-red-700 text-white text-[10px] font-bold px-1.5 py-0.5 mr-1.5 align-middle rounded-none">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                {leadStory.category_name}
              </span>
              <span>{leadStory.title}</span>
            </h2>

            {/* Banglavision style 2-line clean summary */}
            {leadStory.summary && (
              <p className="text-xs text-gray-600 leading-relaxed mt-1.5 line-clamp-2">
                {leadStory.summary}
              </p>
            )}

            {/* Time ago in muted font */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
              <span>{timeAgoBn(leadStory.published_at)}</span>
              <span>•</span>
              <span>{leadStory.author_name}</span>
            </div>
          </div>
        </article>

        {/* Thin divider line matching screenshot */}
        <div className="border-b border-gray-200 mb-1" />

        {/* Mobile Subsequent Stories List (BBC Bangla / Banglavision exact horizontal card layout) */}
        <div className="divide-y divide-gray-200">
          {mobileListStories.map((story) => (
            <article 
              key={story.id}
              onClick={() => onOpenArticle(story)}
              className="flex gap-3 py-3 cursor-pointer group"
            >
              {/* Left: Fixed-ratio rectangular photo thumbnail */}
              <div className="w-28 aspect-[16/10] shrink-0 bg-gray-100 overflow-hidden rounded-xs">
                <img 
                  src={story.featured_image} 
                  alt={story.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                  loading="lazy" 
                />
              </div>

              {/* Right: Bold Bengali Headline + Timestamp below */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-2 sm:line-clamp-3 group-hover:text-red-700 transition-colors">
                  {story.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                  <span>{timeAgoBn(story.published_at)}</span>
                  <span className="text-[10px] text-red-600 font-semibold">{story.category_name}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile E-paper quick banner */}
        {onNavigateEpaper && (
          <div 
            onClick={onNavigateEpaper}
            className="mt-3 mb-1 p-2.5 bg-gray-50 border border-gray-200 rounded flex items-center justify-between cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-red-700" />
              <span className="text-xs font-bold text-gray-900 font-bengali-display">
                আজকের ই-পত্রিকা পড়ুন
              </span>
            </div>
            <span className="text-[11px] font-semibold text-red-700 flex items-center gap-0.5">
              বই সংস্করণ <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </div>

      {/* ========================================================
          DESKTOP VIEW: High-Density 12-Column Newspaper Layout
          (Span 6 Lead, Span 3 Latest, Span 3 Ad & Epaper)
          ======================================================== */}
      <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
        {/* Col 1 (Span 6): Main Lead Story + 2 Sub-stories below */}
        <div className="md:col-span-12 lg:col-span-6 flex flex-col gap-4 lg:border-r lg:border-gray-200 lg:pr-6">
          {/* Main Story */}
          <div className="relative group cursor-pointer" onClick={() => onOpenArticle(leadStory)}>
            <div className="bg-gray-100 w-full h-[260px] sm:h-[300px] overflow-hidden rounded relative">
              <img 
                src={leadStory.featured_image} 
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                <span className="bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase rounded-none inline-block">
                  {leadStory.category_name}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold leading-tight mt-1 group-hover:text-red-300 transition-colors font-bengali-display">
                  {leadStory.title}
                </h2>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mt-3">
              {leadStory.summary}
            </p>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
              <span>{timeAgoBn(leadStory.published_at)}</span>
              <span>•</span>
              <span>{leadStory.author_name}</span>
            </div>
          </div>

          {/* Sub Stories (2-column Grid below main story) */}
          {bottomSubStories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-1">
              {bottomSubStories.map((story) => (
                <div 
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="flex flex-col gap-1 cursor-pointer group"
                >
                  <span className="text-red-700 text-[10px] font-bold">
                    {story.category_name}
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                    {story.title}
                  </h3>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {timeAgoBn(story.published_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 (Span 3): Latest News Column with High Density Rows */}
        <div className="md:col-span-6 lg:col-span-3 lg:border-r lg:border-gray-200 lg:px-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-gray-900 border-b-2 border-red-700 pb-1 font-bengali-display">
              সর্বশেষ সংবাদ
            </h4>
          </div>

          <div className="flex flex-col gap-3.5 divide-y divide-gray-100">
            {sideLatest.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => onOpenArticle(item)}
                className={`group flex gap-3 cursor-pointer ${idx !== 0 ? 'pt-3' : ''}`}
              >
                <div className="w-16 h-16 bg-gray-100 shrink-0 rounded overflow-hidden">
                  <img 
                    src={item.featured_image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <h5 className="text-xs font-bold leading-snug text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2">
                    {item.title}
                  </h5>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {timeAgoBn(item.published_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3 (Span 3): High Density Ad + E-paper Widget */}
        <div className="md:col-span-6 lg:col-span-3 flex flex-col gap-4">
          {/* Ad Placement Space - completely hidden when disableAds is enabled */}
          {!disableAds && (
            <div className="bg-gray-100 p-4 rounded flex flex-col items-center justify-center border border-gray-200 min-h-[160px]">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 font-bold">
                বিজ্ঞাপন
              </span>
              <div className="w-full h-24 bg-white border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 italic text-xs p-2 text-center">
                <span className="font-semibold text-gray-600 not-italic text-[11px] mb-0.5">স্পন্সরড ব্যানার</span>
                <span className="text-[10px]">Ad Placement Space (৩০০x২৫০)</span>
              </div>
            </div>
          )}

          {/* E-Paper Widget */}
          <div className="border border-gray-200 rounded p-4 bg-white shadow-xs">
            <h4 className="font-bold text-sm mb-3 text-center bg-gray-50 py-1 border-b border-gray-200 rounded text-gray-800 flex items-center justify-center gap-1.5 font-bengali-display">
              <Newspaper className="w-3.5 h-3.5 text-red-700" />
              ই-পত্রিকা
            </h4>
            <div 
              onClick={onNavigateEpaper}
              className="bg-gray-50 border border-gray-200 shadow-xs p-2 mx-auto w-32 h-40 flex flex-col items-center justify-center text-xs text-gray-500 mb-3 cursor-pointer hover:border-red-400 transition-colors rounded group"
            >
              <div className="w-full h-full bg-white border border-gray-200 flex flex-col items-center justify-center p-2 text-center">
                <span className="font-bold text-red-700 text-xs font-bengali-display">বার্তাচিত্র</span>
                <span className="text-[9px] text-gray-400 mt-1">আজকের সংস্করণ</span>
                <span className="text-[8px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded mt-2 group-hover:bg-red-700 group-hover:text-white transition-colors">
                  বই সংস্করণ
                </span>
              </div>
            </div>
            <button 
              onClick={onNavigateEpaper}
              className="w-full bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 rounded transition-colors text-center cursor-pointer"
            >
              ই-পত্রিকা পড়ুন
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
