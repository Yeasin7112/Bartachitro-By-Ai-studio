import React from 'react';
import { BookOpen, Clock, Heart, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { BlogPost } from '../types';
import { bnNum } from '../utils/bengaliHelpers';

interface HomeBlogSectionProps {
  blogs: BlogPost[];
  onOpenBlog: (blog: BlogPost) => void;
  onViewAllBlogs: () => void;
}

export const HomeBlogSection: React.FC<HomeBlogSectionProps> = ({
  blogs,
  onOpenBlog,
  onViewAllBlogs
}) => {
  const publishedBlogs = blogs.filter(b => b.status === 'published');
  if (publishedBlogs.length === 0) return null;

  const leadBlog = publishedBlogs.find(b => b.is_featured) || publishedBlogs[0];
  const otherBlogs = publishedBlogs.filter(b => b.id !== leadBlog.id).slice(0, 3);

  return (
    <section className="my-10 bg-linear-to-b from-stone-50 via-white to-stone-50/80 border border-stone-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-stone-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-red-700 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            <BookOpen className="w-3 h-3" />
            <span>বার্তাচিত্র ব্লগ ও দৃষ্টিভঙ্গি</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-bengali-display flex items-center gap-2">
            আমাদের ব্লগ ও মুক্তচিন্তা
            <Sparkles className="w-4 h-4 text-amber-500 hidden sm:inline" />
          </h2>
          <p className="text-xs text-gray-600">
            সমাজ, প্রযুক্তি, সাহিত্য ও জীবনধারা নিয়ে বিশিষ্ট কলামিস্ট ও চিন্তকদের নির্বাচিত লেখালেখি পড়ুন।
          </p>
        </div>

        <button
          onClick={onViewAllBlogs}
          className="self-start sm:self-center inline-flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer group"
        >
          <span>সকল ব্লগ পড়ুন</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Editorial Layout: Left Lead Story + Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Featured / Lead Blog (7 cols) */}
        {leadBlog && (
          <div
            onClick={() => onOpenBlog(leadBlog)}
            className="lg:col-span-7 bg-white border border-stone-200 hover:border-red-300 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-60 sm:h-72 overflow-hidden">
                <img
                  src={leadBlog.cover_image}
                  alt={leadBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-red-700 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase shadow">
                  {leadBlog.category_tag}
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{bnNum(leadBlog.reading_time_min)} মিনিট পাঠ</span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-2xl font-black text-gray-900 group-hover:text-red-700 font-bengali-display leading-tight mb-2.5 transition-colors">
                  {leadBlog.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {leadBlog.summary}
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-0 mt-auto">
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {leadBlog.author_avatar ? (
                    <img
                      src={leadBlog.author_avatar}
                      alt={leadBlog.author_name}
                      className="w-10 h-10 rounded-full object-cover border border-red-700/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                      {leadBlog.author_name[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                      {leadBlog.author_name}
                    </h4>
                    <p className="text-[11px] text-red-700 font-medium">
                      {leadBlog.author_role}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-red-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  পড়ুন →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Right 3 Blogs Stacked (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {otherBlogs.map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBlog(b)}
              className="flex-1 bg-white border border-stone-200 hover:border-red-300 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex gap-4 items-center group"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0">
                <img
                  src={b.cover_image}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                    {b.category_tag}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {bnNum(b.reading_time_min)} মি.
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-red-700 line-clamp-2 leading-snug transition-colors">
                  {b.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span className="truncate max-w-[140px] font-medium text-gray-700">
                    {b.author_name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Eye className="w-3 h-3 text-gray-400" />
                    {bnNum(b.views)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
