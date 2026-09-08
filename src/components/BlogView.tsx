import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, Heart, Eye, Share2, Copy, Check, 
  ArrowLeft, Search, User, ChevronRight, Home, 
  Sparkles, MessageSquareQuote, Bookmark, Play, Video
} from 'lucide-react';
import { BlogPost } from '../types';
import { bnNum, bnDate, timeAgoBn } from '../utils/bengaliHelpers';
import { getYouTubeEmbedUrl } from './VideoUploader';

interface BlogViewProps {
  blogs: BlogPost[];
  selectedBlog: BlogPost | null;
  onSelectBlog: (blog: BlogPost) => void;
  onBackToList: () => void;
  onNavigateHome: () => void;
  onLikeBlog: (id: number) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  blogs,
  selectedBlog,
  onSelectBlog,
  onBackToList,
  onNavigateHome,
  onLikeBlog
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [likedBlogIds, setLikedBlogIds] = useState<number[]>([]);

  // Unique category tags from existing blogs
  const categoriesList = ['all', ...Array.from(new Set(blogs.map(b => b.category_tag)))];

  const handleLike = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!likedBlogIds.includes(id)) {
      setLikedBlogIds(prev => [...prev, id]);
      onLikeBlog(id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic SEO title & meta description for blog reading
  useEffect(() => {
    if (selectedBlog) {
      const originalTitle = document.title;
      document.title = selectedBlog.seo_title || `${selectedBlog.title} - বার্তাচিত্র মুক্তচিন্তা ও ব্লগ`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      const prevDesc = metaDesc.getAttribute('content') || '';
      metaDesc.setAttribute('content', selectedBlog.seo_description || selectedBlog.summary || '');

      return () => {
        document.title = originalTitle;
        if (metaDesc) metaDesc.setAttribute('content', prevDesc);
      };
    }
  }, [selectedBlog]);

  // Filtered blogs for listing
  const filteredBlogs = blogs.filter(blog => {
    const matchesCat = activeCategory === 'all' || blog.category_tag === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      blog.title.toLowerCase().includes(q) ||
      blog.summary.toLowerCase().includes(q) ||
      blog.author_name.toLowerCase().includes(q) ||
      blog.author_role.toLowerCase().includes(q) ||
      (blog.tags && blog.tags.some(t => t.toLowerCase().includes(q)));
    return matchesCat && matchesSearch;
  });

  const featuredBlog = blogs.find(b => b.is_featured) || blogs[0];

  // ----------------------------------------------------------------------
  // SINGLE BLOG READING VIEW
  // ----------------------------------------------------------------------
  if (selectedBlog) {
    const isLiked = likedBlogIds.includes(selectedBlog.id);
    const relatedBlogs = blogs
      .filter(b => b.id !== selectedBlog.id)
      .slice(0, 3);

    return (
      <div className="bg-gray-50/50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Top navigation actions */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={onBackToList}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-red-700 bg-white border border-gray-200 px-3.5 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> সকল ব্লগে ফিরে যান
            </button>

            <nav className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
              <button onClick={onNavigateHome} className="hover:text-red-700 flex items-center gap-1 cursor-pointer">
                <Home className="w-3.5 h-3.5" /> হোম
              </button>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <button onClick={onBackToList} className="hover:text-red-700 font-semibold cursor-pointer">
                ব্লগ ও চিন্তাধারা
              </button>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-red-700 font-bold truncate max-w-[150px]">{selectedBlog.category_tag}</span>
            </nav>
          </div>

          {/* Main Blog Article Card */}
          <article className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xs">
            {/* Category & Read Time Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {selectedBlog.category_tag}
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                {bnNum(selectedBlog.reading_time_min)} মিনিট পাঠ
              </span>
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full ml-auto">
                <Eye className="w-3.5 h-3.5" />
                {bnNum(selectedBlog.views)} বার পঠিত
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-gray-900 font-bengali-display leading-tight mb-5">
              {selectedBlog.title}
            </h1>

            {/* Author Profile Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 py-4 border-y border-gray-100 my-6 bg-gray-50/70 px-4 rounded-xl">
              <div className="flex items-center gap-3">
                {selectedBlog.author_avatar ? (
                  <img
                    src={selectedBlog.author_avatar}
                    alt={selectedBlog.author_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-700/20 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg">
                    {selectedBlog.author_name[0]}
                  </div>
                )}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900">
                    {selectedBlog.author_name}
                  </h4>
                  <p className="text-xs text-red-700 font-medium">
                    {selectedBlog.author_role}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    প্রকাশকাল: {bnDate(selectedBlog.published_at, false)}
                  </p>
                </div>
              </div>

              {/* Quick Interactions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLike(selectedBlog.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    isLiked
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  title="পছন্দ হয়েছে"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{bnNum(selectedBlog.likes)}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="লিঙ্ক কপি করুন"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Featured Cover Image */}
            {selectedBlog.cover_image && (
              <div className="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-xs">
                <img
                  src={selectedBlog.cover_image}
                  alt={selectedBlog.title}
                  className="w-full max-h-[420px] object-cover"
                />
              </div>
            )}

            {/* Attached Video Player (if video_url is present) */}
            {selectedBlog.video_url && (
              <div className="my-6 rounded-xl overflow-hidden bg-black border border-gray-300 shadow-sm">
                <div className="bg-gray-900 text-white text-xs px-3.5 py-2 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-2 font-bold">
                    <Play className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                    <span>ব্লগের সাথে যুক্ত ভিডিও</span>
                  </div>
                  <span className="text-[10px] text-gray-400">বার্তাচিত্র মিডিয়া প্লেয়ার</span>
                </div>
                <div className="aspect-video w-full bg-black">
                  {getYouTubeEmbedUrl(selectedBlog.video_url) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedBlog.video_url)!}
                      title={selectedBlog.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={selectedBlog.video_url}
                      controls
                      preload="metadata"
                      className="w-full h-full object-contain"
                    >
                      আপনার ব্রাউজার ভিডিওটি প্লে করতে পারছে না।
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* Summary / Lead Quote */}
            {selectedBlog.summary && (
              <div className="bg-amber-50/80 border-l-4 border-amber-600 p-4 sm:p-5 rounded-r-xl my-6">
                <div className="flex items-start gap-2.5">
                  <MessageSquareQuote className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base text-amber-950 font-medium leading-relaxed italic">
                    {selectedBlog.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Detailed Prose Content */}
            <div 
              className="font-bengali-body text-base sm:text-lg text-gray-800 leading-relaxed sm:leading-loose space-y-5 my-8"
              dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
            />

            {/* Tags */}
            {selectedBlog.tags && selectedBlog.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-100 flex items-center flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-500">ট্যাগসমূহ:</span>
                {selectedBlog.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Box Bottom */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/80 p-5 rounded-xl">
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-gray-900">ব্লগটি পড়ে আপনার কেমন লাগল?</h4>
                <p className="text-xs text-gray-600">ভালো লাগলে লাইক দিন এবং চিন্তাশীল বন্ধুদের সাথে শেয়ার করুন।</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike(selectedBlog.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs ${
                    isLiked
                      ? 'bg-rose-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-800 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                  <span>{isLiked ? 'পছন্দ করেছেন' : 'লাইক দিন'} ({bnNum(selectedBlog.likes)})</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gray-900 hover:bg-gray-800 text-white transition-colors cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copied ? 'কপি হয়েছে' : 'শেয়ার করুন'}</span>
                </button>
              </div>
            </div>

            {/* Author Biography Card */}
            <div className="mt-8 p-6 bg-linear-to-r from-red-50/50 via-gray-50 to-white border border-red-100 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              {selectedBlog.author_avatar ? (
                <img
                  src={selectedBlog.author_avatar}
                  alt={selectedBlog.author_name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-red-600 shadow-md shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                  {selectedBlog.author_name[0]}
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider bg-red-100/70 px-2 py-0.5 rounded">
                  লেখক পরিচিতি
                </span>
                <h3 className="text-base sm:text-lg font-black text-gray-900">{selectedBlog.author_name}</h3>
                <p className="text-xs text-red-700 font-semibold">{selectedBlog.author_role}</p>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  বার্তাচিত্রের নিয়মিত কলামিস্ট ও বিশ্লেষক হিসেবে সমাজ, সমকাল ও চিন্তার বিভিন্ন দিক নিয়ে নিয়মিত লেখালেখি করছেন।
                </p>
              </div>
            </div>
          </article>

          {/* Related Blogs Section */}
          {relatedBlogs.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 font-bengali-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> আরও পড়ুন — চিন্তাশীল ব্লগসমূহ
                </h3>
                <button
                  onClick={onBackToList}
                  className="text-xs font-bold text-red-700 hover:underline cursor-pointer"
                >
                  সব দেখুন →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedBlogs.map(b => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBlog(b)}
                    className="bg-white border border-gray-200 hover:border-red-300 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {b.category_tag}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-700 line-clamp-2 leading-snug mb-1">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {b.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 mt-2 border-t border-gray-100">
                      <span>{b.author_name}</span>
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <Clock className="w-3 h-3 text-red-700" /> {bnNum(b.reading_time_min)} মি. পাঠ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // BLOG PORTAL LISTING VIEW
  // ----------------------------------------------------------------------
  return (
    <div className="bg-gray-50/60 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Banner Hero: Literary & Thoughtful Editorial Header */}
        <div className="bg-linear-to-r from-gray-900 via-gray-900 to-red-950 text-white rounded-2xl p-6 sm:p-10 mb-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-red-700/80 border border-red-500/30 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>বার্তাচিত্র ব্লগ ও দৃষ্টিভঙ্গি</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-bengali-display leading-tight">
              চিন্তা, যুক্তি ও মননের মুক্ত প্রাঙ্গণ
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              সমাজ, সংস্কৃতি, প্রযুক্তি, জীবনধারা ও সমসাময়িক বৈশ্বিক ঘটনাপ্রবাহ নিয়ে দেশের বিশিষ্ট কলামিস্ট, চিন্তাবিদ ও তরুণ গবেষকদের নির্বাচিত গভীর দৃষ্টিভঙ্গি।
            </p>
          </div>

          {/* Decorative subtle element */}
          <div className="absolute right-4 -bottom-10 opacity-10 pointer-events-none hidden md:block">
            <BookOpen className="w-72 h-72 text-white" />
          </div>
        </div>

        {/* Search & Topic Filters Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ব্লগ বা লেখক অনুসন্ধান করুন..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white"
              />
            </div>

            {/* Total Blogs Badge */}
            <div className="text-xs text-gray-500 font-semibold self-end sm:self-center">
              মোট <span className="font-bold text-red-700">{bnNum(filteredBlogs.length)}</span> টি ব্লগ নিবন্ধ
            </div>
          </div>

          {/* Topic Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat === 'all' ? 'সকল বিষয়' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Blog Highlight Card (if exists and category is 'all' and no search query) */}
        {activeCategory === 'all' && !searchQuery && featuredBlog && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                সম্পাদকীয় পছন্দ • নির্বাচিত ব্লগ
              </span>
            </div>

            <div 
              onClick={() => onSelectBlog(featuredBlog)}
              className="bg-white border border-gray-200 hover:border-red-300 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer grid grid-cols-1 md:grid-cols-2 group"
            >
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img
                  src={featuredBlog.cover_image}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-red-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase shadow">
                  {featuredBlog.category_tag}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-red-700" />
                    <span>{bnNum(featuredBlog.reading_time_min)} মিনিট পাঠ</span>
                    <span>•</span>
                    <span>{bnDate(featuredBlog.published_at, false)}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 group-hover:text-red-700 font-bengali-display leading-tight transition-colors">
                    {featuredBlog.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {featuredBlog.summary}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {featuredBlog.author_avatar ? (
                      <img
                        src={featuredBlog.author_avatar}
                        alt={featuredBlog.author_name}
                        className="w-10 h-10 rounded-full object-cover border border-red-700/30 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                        {featuredBlog.author_name[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">{featuredBlog.author_name}</h4>
                      <p className="text-[11px] text-red-700 font-medium">{featuredBlog.author_role}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-red-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    পড়ুন →
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blogs Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 font-bengali-display">
              {activeCategory === 'all' ? 'সকল ব্লগ ও নিবন্ধ' : `${activeCategory} সম্পর্কিত ব্লগ`}
            </h3>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-bold text-gray-700">কোনো ব্লগ পাওয়া যায়নি!</p>
              <p className="text-xs text-gray-500 mt-1">অন্য কোনো বিষয় নির্বাচন করুন অথবা ভিন্ন শব্দ দিয়ে অনুসন্ধান করুন।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => {
                const isLiked = likedBlogIds.includes(blog.id);
                return (
                  <article
                    key={blog.id}
                    onClick={() => onSelectBlog(blog)}
                    className="bg-white border border-gray-200 hover:border-red-300 rounded-xl overflow-hidden shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Card Thumbnail */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.cover_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                          {blog.category_tag}
                        </span>
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{bnNum(blog.reading_time_min)} মিনিট পাঠ</span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-red-700 font-bengali-display leading-snug line-clamp-2 transition-colors mb-2">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {blog.summary}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Author + Views & Likes */}
                    <div className="p-5 pt-0 mt-auto">
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {blog.author_avatar ? (
                            <img
                              src={blog.author_avatar}
                              alt={blog.author_name}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                              {blog.author_name[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 leading-tight">{blog.author_name}</h4>
                            <p className="text-[10px] text-red-700 font-medium">{blog.author_role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                          <button
                            onClick={(e) => handleLike(blog.id, e)}
                            className={`flex items-center gap-0.5 p-1 rounded hover:text-rose-600 transition-colors cursor-pointer ${
                              isLiked ? 'text-rose-600 font-bold' : ''
                            }`}
                            title="পছন্দ"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                            <span>{bnNum(blog.likes)}</span>
                          </button>
                          <span className="flex items-center gap-0.5" title="পাঠক সংখ্যা">
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                            <span>{bnNum(blog.views)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
