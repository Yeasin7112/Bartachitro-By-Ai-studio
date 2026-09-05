import React from 'react';
import { ChevronRight, CircleDot } from 'lucide-react';
import { NewsArticle } from '../types';
import { limitWords, timeAgoBn } from '../utils/bengaliHelpers';

interface CategoryBlockProps {
  title: string;
  categorySlug: string;
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onViewCategory: (slug: string) => void;
}

export const CategoryBlock: React.FC<CategoryBlockProps> = ({
  title,
  categorySlug,
  articles,
  onOpenArticle,
  onViewCategory
}) => {
  if (!articles || articles.length === 0) return null;

  const lead = articles[0];
  const listItems = articles.slice(1);

  return (
    <div className="bg-white border border-gray-200 rounded p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex justify-between items-center border-b-2 border-red-700 pb-1.5 mb-3">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 font-bengali-display">
            {title}
          </h3>
          <button 
            onClick={() => onViewCategory(categorySlug)}
            className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-0.5 cursor-pointer"
          >
            আরও <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Lead Story for this Category */}
        <div 
          onClick={() => onOpenArticle(lead)}
          className="group cursor-pointer mb-3"
        >
          <div className="aspect-[16/10] w-full rounded-xs overflow-hidden mb-2 bg-gray-100">
            <img 
              src={lead.featured_image} 
              alt={lead.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy" 
            />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-gray-950 group-hover:text-red-700 transition-colors leading-snug">
            {lead.title}
          </h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {limitWords(lead.summary, 18)}
          </p>
          <span className="text-[10px] text-gray-400 block mt-1">
            {timeAgoBn(lead.published_at)}
          </span>
        </div>
      </div>

      {/* Other Stories in list (BBC Bangla / Banglavision style horizontal items on mobile) */}
      {listItems.length > 0 && (
        <div className="border-t border-gray-200 pt-1 flex flex-col divide-y divide-gray-100">
          {listItems.map((story) => (
            <article
              key={story.id}
              onClick={() => onOpenArticle(story)}
              className="py-2.5 flex gap-2.5 items-center group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-16 h-12 shrink-0 bg-gray-100 rounded-xs overflow-hidden">
                <img 
                  src={story.featured_image} 
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <h5 className="text-xs font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                  {story.title}
                </h5>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  {timeAgoBn(story.published_at)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
