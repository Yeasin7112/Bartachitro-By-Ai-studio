import React, { useState } from 'react';
import { Search, Clock, ArrowLeft } from 'lucide-react';
import { NewsArticle } from '../types';
import { bnNum, timeAgoBn } from '../utils/bengaliHelpers';

interface SearchViewProps {
  initialQuery: string;
  allNews: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onNavigateHome: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  initialQuery,
  allNews,
  onOpenArticle,
  onNavigateHome
}) => {
  const [query, setQuery] = useState(initialQuery);

  const trimmed = query.trim().toLowerCase();
  const searchResults = trimmed
    ? allNews.filter(n => 
        n.title.toLowerCase().includes(trimmed) || 
        n.summary.toLowerCase().includes(trimmed) ||
        (n.category_name && n.category_name.toLowerCase().includes(trimmed))
      )
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button 
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-700 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> প্রচ্ছদে ফিরে যান
      </button>

      {/* Search Input Box */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-bengali-display mb-4">
          সংবাদ অনুসন্ধান
        </h1>
        <div className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="যেকোনো খবরের বিষয়বস্তু বা কি-ওয়ার্ড লিখুন..."
              className="w-full border border-gray-300 rounded pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-700"
            />
          </div>
        </div>
      </div>

      {/* Search Results Meta */}
      <div className="flex justify-between items-center border-b-2 border-red-700 pb-2 mb-6">
        <h2 className="text-lg font-bold text-gray-900 font-bengali-display">
          ‘{query}’ সম্পর্কিত অনুসন্ধান ফলাফল
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          মোট {bnNum(searchResults.length)}টি সংবাদ পাওয়া গেছে
        </span>
      </div>

      {/* Results List */}
      {searchResults.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-base">আপনার অনুসন্ধানের সাথে কোনো সংবাদ মেলেনি। অন্য শব্দ দিয়ে চেষ্টা করুন।</p>
        </div>
      ) : (
        <>
          {/* Mobile View: BBC Bangla / Banglavision style stream */}
          <div className="block sm:hidden divide-y divide-gray-200">
            {searchResults.map((item) => (
              <article 
                key={item.id}
                onClick={() => onOpenArticle(item)}
                className="flex gap-3 py-3 cursor-pointer group"
              >
                <div className="w-28 aspect-[16/10] shrink-0 bg-gray-100 overflow-hidden rounded-xs">
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

          {/* Desktop View: Cards Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((item) => (
              <article 
                key={item.id}
                onClick={() => onOpenArticle(item)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  <img 
                    src={item.featured_image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-xs font-bold text-red-700 block mb-1">{item.category_name}</span>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgoBn(item.published_at)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
