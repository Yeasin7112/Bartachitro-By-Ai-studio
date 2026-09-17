import React from 'react';
import { Newspaper, ChevronRight, Radio } from 'lucide-react';
import { NewsArticle, Advertisement } from '../types';
import { timeAgoBn } from '../utils/bengaliHelpers';
import { trackAdClick } from '../utils/api';

interface LeadHeroProps {
  leadStory: NewsArticle;
  subStories: NewsArticle[];
  latestArticles?: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onNavigateEpaper?: () => void;
  disableAds?: boolean;
  ads?: Advertisement[];
}

export const LeadHero: React.FC<LeadHeroProps> = ({
  leadStory,
  subStories,
  latestArticles = [],
  onOpenArticle,
  onNavigateEpaper,
  disableAds = false,
  ads = []
}) => {
  if (!leadStory) return null;

  const activeSidebarAd = ads.find(a => (a.position === 'sidebar' || a.position === 'lead_bottom') && a.status === 'active');

  // Candidate articles excluding the 1st lead story to prevent any duplication
  const candidateArticles = Array.from(
    new Map(
      [...subStories, ...latestArticles]
        .filter(a => a && a.id !== leadStory.id)
        .map(item => [item.id, item])
    ).values()
  );

  // ১. ১ম নিউজের ঠিক পরের ৩টি নিউজ পাশাপাশি
  const threeSideStories = candidateArticles.slice(0, 3);

  // ২. এরপরের নিউজগুলো নিচে নিচে (যেমন এখন আছে)
  const subsequentStories = candidateArticles.slice(3);

  return (
    <section className="mb-6 w-full" aria-label="প্রধান ও শীর্ষ সংবাদ">
      {/* ========================================================
          MOBILE VIEW:
          1. ১ম নিউজ (Lead Hero Story)
          2. ১ম নিউজের পরে ৩টি নিউজ পাশাপাশি
          3. এরপরের নিউজগুলো নিচে নিচে
          ======================================================== */}
      <div className="block md:hidden">
        {/* Mobile Lead Story (১ম নিউজ) */}
        <article 
          onClick={() => onOpenArticle(leadStory)}
          className="cursor-pointer group pb-3"
        >
          {/* Full-width clean photo on top */}
          <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100 rounded-xs mb-2.5">
            <img 
              src={leadStory.featured_image} 
              alt={leadStory.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          </div>

          {/* Headline directly below image */}
          <div className="px-0.5">
            <h2 className="text-xl sm:text-2xl font-bold font-bengali-display news-headline text-gray-950 leading-snug group-hover:text-red-700 transition-colors">
              <span className="inline-flex items-center gap-1 bg-red-700 text-white text-[10px] font-bold px-1.5 py-0.5 mr-1.5 align-middle rounded-none">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                {leadStory.category_name}
              </span>
              <span>{leadStory.title}</span>
            </h2>

            {leadStory.summary && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mt-1.5 line-clamp-2 font-news-body font-normal">
                {leadStory.summary}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-400">
              <span>{timeAgoBn(leadStory.published_at)}</span>
              <span>•</span>
              <span>{leadStory.author_name}</span>
            </div>
          </div>
        </article>

        {/* ১ম নিউজের পরে ৩টি নিউজ পাশাপাশি (User Request: make fonts size more bigger) */}
        {threeSideStories.length > 0 && (
          <div className="border-t border-b border-gray-200 py-4 my-3 bg-gray-50/50 -mx-1 px-2.5 rounded-sm">
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {threeSideStories.map((story) => (
                <article
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="flex flex-col cursor-pointer group"
                >
                  <div className="w-full aspect-[16/10] bg-gray-100 overflow-hidden rounded-xs mb-2">
                    <img
                      src={story.featured_image}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-bold text-red-700 line-clamp-1">
                    {story.category_name}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-gray-950 leading-snug line-clamp-3 group-hover:text-red-700 transition-colors mt-1 font-bengali-display news-headline">
                    {story.title}
                  </h3>
                  <span className="text-[11px] text-gray-500 mt-1 font-medium font-bengali-ui">
                    {timeAgoBn(story.published_at)}
                  </span>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* এরপরের নিউজগুলো নিচে নিচে (যেমন এখন আছে) */}
        {subsequentStories.length > 0 && (
          <div className="divide-y divide-gray-200">
            {subsequentStories.map((story) => (
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
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug line-clamp-2 sm:line-clamp-3 group-hover:text-red-700 transition-colors font-bengali-display news-headline">
                    {story.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1 font-medium font-bengali-ui">
                    <span>{timeAgoBn(story.published_at)}</span>
                    <span className="text-[10px] text-red-600 font-bold">{story.category_name}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

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
          DESKTOP VIEW: High-Density Layout
          Col 1: ১ম নিউজ + নিচে ৩টি নিউজ পাশাপাশি
          Col 2: এরপরের নিউজগুলো নিচে নিচে (সর্বশেষ সংবাদ)
          Col 3: বিজ্ঞাপন ও ই-পত্রিকা
          ======================================================== */}
      <div className="hidden md:grid md:grid-cols-12 gap-6 items-start">
        {/* Col 1 (Span 6): ১ম নিউজ + ঠিক নিচে ৩টি নিউজ পাশাপাশি */}
        <div className="md:col-span-12 lg:col-span-6 flex flex-col gap-4 lg:border-r lg:border-gray-200 lg:pr-6">
          {/* Main Story (১ম নিউজ) */}
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
                <h2 className="text-xl sm:text-2xl font-bold leading-tight mt-1 group-hover:text-red-300 transition-colors font-bengali-display news-headline">
                  {leadStory.title}
                </h2>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mt-3 font-news-body font-normal">
              {leadStory.summary}
            </p>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
              <span>{timeAgoBn(leadStory.published_at)}</span>
              <span>•</span>
              <span>{leadStory.author_name}</span>
            </div>
          </div>

          {/* ১ম নিউজের পরে ৩টি নিউজ পাশাপাশি */}
          {threeSideStories.length > 0 && (
            <div className="grid grid-cols-3 gap-3.5 border-t border-gray-200 pt-4 mt-1">
              {threeSideStories.map((story) => (
                <div 
                  key={story.id}
                  onClick={() => onOpenArticle(story)}
                  className="flex flex-col gap-1.5 cursor-pointer group"
                >
                  <div className="w-full aspect-[16/10] bg-gray-100 overflow-hidden rounded">
                    <img 
                      src={story.featured_image} 
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-red-700 text-xs font-bold line-clamp-1">
                    {story.category_name}
                  </span>
                  <h3 className="font-bold text-[15px] lg:text-base text-gray-900 group-hover:text-red-700 transition-colors line-clamp-3 leading-snug font-bengali-display news-headline">
                    {story.title}
                  </h3>
                  <span className="text-[11px] text-gray-500 mt-0.5 font-medium font-bengali-ui">
                    {timeAgoBn(story.published_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Col 2 (Span 3): এরপরের সংবাদগুলো নিচে নিচে (সর্বশেষ সংবাদ) */}
        <div className="md:col-span-6 lg:col-span-3 lg:border-r lg:border-gray-200 lg:px-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-sm text-gray-900 border-b-2 border-red-700 pb-1 font-bengali-display">
              সর্বশেষ সংবাদ
            </h4>
          </div>

          <div className="flex flex-col gap-3.5 divide-y divide-gray-100">
            {subsequentStories.slice(0, 5).map((item, idx) => (
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
                  <span className="text-[11px] text-gray-500 mt-1 font-medium font-bengali-ui">
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
            <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <div className="bg-gray-100/80 px-3 py-1 border-b border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <span>বিজ্ঞাপন</span>
                <span>{activeSidebarAd ? 'স্পন্সর' : 'স্লট: ৩০০x২৫০'}</span>
              </div>
              {activeSidebarAd ? (
                <a
                  href={activeSidebarAd.target_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAdClick(activeSidebarAd.id)}
                  className="block relative group overflow-hidden bg-slate-900"
                  title={activeSidebarAd.title}
                >
                  <img
                    src={activeSidebarAd.image_url}
                    alt={activeSidebarAd.title}
                    className="w-full h-auto max-h-48 object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </a>
              ) : (
                <div className="p-4 flex flex-col items-center justify-center text-center min-h-[120px]">
                  <div className="w-full py-5 bg-white border border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 italic text-xs px-2">
                    <span className="font-semibold text-gray-600 not-italic text-[11px] mb-0.5">স্পন্সরড বিজ্ঞাপন ব্যানার</span>
                    <span className="text-[10px]">বিজ্ঞাপনের জন্য যোগাযোগ করুন: ads@bartachitro.com</span>
                  </div>
                </div>
              )}
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
