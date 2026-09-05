import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { NewsArticle } from '../types';
import { timeAgoBn } from '../utils/bengaliHelpers';

interface LatestGridProps {
  news: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onViewAll: () => void;
}

export const LatestGrid: React.FC<LatestGridProps> = ({
  news,
  onOpenArticle,
  onViewAll
}) => {
  if (!news || news.length === 0) return null;

  return (
    <section className="mb-8" aria-label="সর্বশেষ সংবাদ">
      <div className="flex justify-between items-center border-b-2 border-red-700 pb-1.5 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-xl font-bold text-gray-900 font-bengali-display">
          সর্বশেষ সংবাদ
        </h2>
        <button 
          onClick={onViewAll}
          className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-0.5 cursor-pointer"
        >
          সব খবর <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* MOBILE VIEW: BBC Bangla & Banglavision style horizontal list feed */}
      <div className="block sm:hidden divide-y divide-gray-200">
        {news.map((item) => (
          <article 
            key={item.id}
            onClick={() => onOpenArticle(item)}
            className="flex gap-3 py-3 cursor-pointer group"
          >
            {/* Left: Rectangular photo thumbnail */}
            <div className="w-28 aspect-[16/10] shrink-0 bg-gray-100 overflow-hidden rounded-xs">
              <img 
                src={item.featured_image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                loading="lazy" 
              />
            </div>

            {/* Right: Bold Bengali Headline + Timestamp below */}
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

      {/* TABLET & DESKTOP VIEW: High-Density 4-Column Card Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((item) => (
          <article 
            key={item.id}
            onClick={() => onOpenArticle(item)}
            className="bg-white border border-gray-200 rounded overflow-hidden hover:border-red-300 transition-colors flex flex-col group cursor-pointer"
          >
            <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
              <img 
                src={item.featured_image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="p-3 flex flex-col justify-between flex-1">
              <div>
                <span className="text-[10px] font-bold text-red-700 block mb-1">
                  {item.category_name}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>
              <div className="text-[11px] text-gray-400 mt-2.5 pt-1.5 border-t border-gray-100 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgoBn(item.published_at)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
