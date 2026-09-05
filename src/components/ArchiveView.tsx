import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { NewsArticle } from '../types';
import { bnNum, bnDate, timeAgoBn } from '../utils/bengaliHelpers';

interface ArchiveViewProps {
  allNews: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onNavigateHome: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  allNews,
  onOpenArticle,
  onNavigateHome
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-08-30');

  const filtered = allNews.filter(n => n.published_at.startsWith(selectedDate));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button 
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-700 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> প্রচ্ছদে ফিরে যান
      </button>

      {/* Date Filter Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-bengali-display flex items-center gap-2">
            <Calendar className="w-6 h-6 text-red-700" />
            সংবাদ আর্কাইভ
          </h1>
          <p className="text-xs text-gray-600 mt-1">তারিখ অনুযায়ী পূর্ববর্তী সকল সংবাদ ও প্রতিবেদন খুঁজুন।</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-700">তারিখ নির্বাচন:</label>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-red-700 bg-gray-50"
          />
        </div>
      </div>

      <div className="flex justify-between items-center border-b-2 border-red-700 pb-2 mb-6">
        <h2 className="text-lg font-bold text-gray-900 font-bengali-display">
          {bnDate(selectedDate, false)}-এর প্রকাশিত সংবাদসমূহ
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          মোট {bnNum(filtered.length)}টি সংবাদ
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-base">এই তারিখে কোনো সংবাদ সংরক্ষিত নেই। অনুগ্রহ করে অন্য তারিখ নির্বাচন করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
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
                </div>
                <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {timeAgoBn(item.published_at)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
