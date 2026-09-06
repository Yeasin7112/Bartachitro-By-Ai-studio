import React, { useState, useEffect } from 'react';
import { 
  Clock, Eye, UserPen, Share2, Copy, Check, Printer, 
  Home, ChevronRight, Newspaper, ArrowLeft 
} from 'lucide-react';
import { NewsArticle } from '../types';
import { bnNum, bnDate, timeAgoBn } from '../utils/bengaliHelpers';

interface ArticleViewProps {
  article: NewsArticle;
  relatedArticles: NewsArticle[];
  latestArticles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  onSelectCategory: (slug: string) => void;
  onNavigateHome: () => void;
  onNavigateEpaper: () => void;
  disableAds?: boolean;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  relatedArticles,
  latestArticles,
  onOpenArticle,
  onSelectCategory,
  onNavigateHome,
  onNavigateEpaper,
  disableAds = false
}) => {
  const [copied, setCopied] = useState(false);

  // Dynamic SEO Page Title & Meta Tags
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = article.seo_title || `${article.title} - বার্তাচিত্র`;
    document.title = pageTitle;

    // Meta description update
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.getAttribute('content') || '';
    metaDesc.setAttribute('content', article.seo_description || article.summary || '');

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.setAttribute('content', prevDesc);
    };
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Back Button */}
      <button 
        onClick={onNavigateHome}
        className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-700 mb-4 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> প্রচ্ছদে ফিরে যান
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Article Content (Col Span 2) */}
        <article className="lg:col-span-2 bg-white border border-gray-200 rounded p-5 sm:p-6 shadow-xs">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-3" aria-label="ব্রেডক্রাম্ব">
            <button onClick={onNavigateHome} className="hover:text-red-700 flex items-center gap-1 cursor-pointer">
              <Home className="w-3.5 h-3.5" /> প্রচ্ছদ
            </button>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <button 
              onClick={() => onSelectCategory(article.category_slug || 'national')}
              className="hover:text-red-700 font-bold text-red-700 cursor-pointer"
            >
              {article.category_name}
            </button>
          </nav>

          {/* Category Tag */}
          <span className="inline-block bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-none uppercase mb-2">
            {article.category_name}
          </span>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 font-bengali-display leading-tight tracking-tight mb-3">
            {article.title}
          </h1>

          {/* Subheadline / Summary */}
          {article.summary && (
            <p className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed mb-5 border-l-3 border-red-700 pl-3 bg-gray-50 py-2 rounded-r">
              {article.summary}
            </p>
          )}

          {/* Author & Publish Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-y border-gray-200 mb-5 text-xs text-gray-600">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center">
                <UserPen className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">{article.author_name}</p>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>প্রকাশিত: {bnDate(article.published_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 text-gray-700 font-medium px-2.5 py-1 rounded text-xs border border-gray-200">
              <Eye className="w-3 h-3 text-red-700" />
              <span>{bnNum(article.views + 1)} বার পঠিত</span>
            </div>
          </div>

          {/* Featured Image */}
          <figure className="mb-5 rounded overflow-hidden bg-gray-100 border border-gray-200">
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full max-h-[440px] object-cover" 
            />
            {article.image_caption && (
              <figcaption className="bg-gray-50 text-gray-600 text-xs px-3 py-1.5 border-t border-gray-200 italic">
                {article.image_caption}
              </figcaption>
            )}
          </figure>

          {/* Social Share Strip */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-2.5 bg-gray-50 rounded border border-gray-200">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1 mr-1">
              <Share2 className="w-3.5 h-3.5" /> শেয়ার:
            </span>
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank" 
              rel="noreferrer"
              className="bg-[#1877f2] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 hover:opacity-90"
            >
              ফেসবুক
            </a>
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0f1419] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 hover:opacity-90"
            >
              টুইট
            </a>
            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
              target="_blank" 
              rel="noreferrer"
              className="bg-[#25d366] text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 hover:opacity-90"
            >
              হোয়াটসঅ্যাপ
            </a>
            <button 
              onClick={handleCopyLink}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
            </button>
            <button 
              onClick={handlePrint}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              প্রিন্ট
            </button>
          </div>

          {/* Article Main Text Content */}
          <div 
            className="prose max-w-none text-gray-900 text-base sm:text-lg leading-relaxed font-bengali-body prose-headings:font-bengali-display prose-headings:text-gray-900 prose-img:rounded-xl prose-img:border prose-img:border-gray-200 prose-img:shadow-sm prose-blockquote:border-l-4 prose-blockquote:border-red-700 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:text-gray-700 prose-figcaption:text-xs prose-figcaption:text-gray-500 prose-figcaption:text-center prose-figcaption:mt-1.5 prose-a:text-red-700 prose-a:font-semibold prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* In-Article Advertisement - completely hidden when disableAds is enabled */}
          {!disableAds && (
            <div className="my-6 p-4 bg-gray-50 border border-dashed border-gray-300 rounded text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">বিজ্ঞাপন (Article Inline)</span>
              <div className="h-16 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-700">
                বার্তাচিত্র ডিজিটাল বিজ্ঞাপন নেটওয়ার্ক • যোগাযোগ: ads@bartachitro.com
              </div>
            </div>
          )}

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="mt-8 pt-4 border-t-2 border-red-700">
              <h3 className="text-base font-bold text-gray-950 font-bengali-display mb-3">
                সম্পর্কিত সংবাদ
              </h3>
              {/* Mobile View: BBC Bangla / Banglavision horizontal items */}
              <div className="block sm:hidden divide-y divide-gray-200">
                {relatedArticles.map((rel) => (
                  <article 
                    key={rel.id}
                    onClick={() => onOpenArticle(rel)}
                    className="flex gap-3 py-3 cursor-pointer group"
                  >
                    <div className="w-24 aspect-[16/10] shrink-0 rounded-xs overflow-hidden bg-gray-100">
                      <img 
                        src={rel.featured_image} 
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 mt-1">
                        {timeAgoBn(rel.published_at)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop View: Grid */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-3.5">
                {relatedArticles.map((rel) => (
                  <article 
                    key={rel.id}
                    onClick={() => onOpenArticle(rel)}
                    className="group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-[16/10] w-full rounded overflow-hidden mb-1.5 bg-gray-100">
                      <img 
                        src={rel.featured_image} 
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {timeAgoBn(rel.published_at)}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar Column */}
        <aside className="space-y-4">
          {/* Sidebar Ad - completely hidden when disableAds is enabled */}
          {!disableAds && (
            <div className="bg-gray-100 border border-gray-200 rounded p-4 text-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2 tracking-wider">বিজ্ঞাপন (৩০০x২৫০)</span>
              <div className="aspect-square bg-white border border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-4 text-center">
                <Newspaper className="w-10 h-10 mb-2 text-red-700" />
                <h4 className="text-sm font-bold text-gray-900 font-bengali-display">বার্তাচিত্র ডিজিটাল</h4>
                <p className="text-[11px] text-gray-500 mt-1">সত্যের সংবাদ, সবার ভাষায় • প্রতিদিন আপনার সাথে</p>
              </div>
            </div>
          )}

          {/* Latest News Widget with Thumbnails */}
          <div className="bg-white border border-gray-200 rounded p-4 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 font-bengali-display border-b-2 border-red-700 pb-1.5 mb-3">
              সর্বশেষ খবর
            </h3>
            <div className="divide-y divide-gray-100">
              {latestArticles.map((lat) => (
                <article 
                  key={lat.id} 
                  onClick={() => onOpenArticle(lat)}
                  className="py-2.5 flex gap-2.5 items-center group cursor-pointer"
                >
                  <div className="w-16 h-12 shrink-0 bg-gray-100 rounded-xs overflow-hidden">
                    <img 
                      src={lat.featured_image} 
                      alt={lat.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      loading="lazy" 
                    />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-red-700 transition-colors line-clamp-2 leading-snug">
                      {lat.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {timeAgoBn(lat.published_at)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* E-Paper Teaser Widget */}
          <div className="bg-white border border-gray-200 rounded p-4 text-center shadow-xs">
            <h4 className="text-sm font-bold text-gray-900 mb-2 font-bengali-display bg-gray-50 py-1 border-b border-gray-200 rounded flex items-center justify-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-red-700" />
              আজকের ই-পত্রিকা
            </h4>
            <p className="text-xs text-gray-600 mt-1 mb-3">কাগজের পত্রিকার ডিজিটাল সংস্করণ পড়ুন বার্তাচিত্রে।</p>
            <button 
              onClick={onNavigateEpaper}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer shadow-xs"
            >
              ই-পত্রিকা পড়ুন
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
