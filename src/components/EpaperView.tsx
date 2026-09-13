import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Epaper, NewsArticle, SiteSettings } from '../types';
import { bnNum, toBangladeshDate } from '../utils/bengaliHelpers';
import { fetchNewsList } from '../utils/api';
import { SiteLogo } from './SiteLogo';

interface EpaperViewProps {
  epaper: Epaper;
  allNews?: NewsArticle[];
  onNavigateHome: () => void;
  settings?: SiteSettings;
  onSelectDate?: (date: string) => void;
  onOpenArticle?: (article: NewsArticle) => void;
}

// Sound generator using Web Audio API for authentic book page flip
const playPageTurnSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const bufferSize = Math.floor(ctx.sampleRate * 0.18); // 180ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.sin((i / bufferSize) * Math.PI) * Math.exp(-i / (bufferSize * 0.4));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.18);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore audio failures if browser blocks autoplay before user gesture
  }
};

/**
 * Format date in short Bengali format: "৩০ আগস্ট ২০২৬"
 */
function formatBengaliDateShort(dateStr?: string | Date): string {
  const date = toBangladeshDate(dateStr || new Date());
  const bnMonths = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  return `${bnNum(date.getDate())} ${bnMonths[date.getMonth()]} ${bnNum(date.getFullYear())}`;
}

/**
 * Split Bengali syllables / grapheme clusters nicely: e.g. "বিনোদন" -> "বি নো দ ন"
 */
function formatSpacedBengali(text: string): string {
  if (!text) return '';
  try {
    const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
    return [...segmenter.segment(text)].map(s => s.segment).join(' ');
  } catch {
    return text;
  }
}

/**
 * Extract clean paragraphs from HTML or raw text
 */
function extractCleanParagraphs(htmlOrText?: string): string[] {
  if (!htmlOrText) return [];
  const text = htmlOrText
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
  const paras = text
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  return paras.length > 0 ? paras : [htmlOrText.trim()];
}

export const EpaperView: React.FC<EpaperViewProps> = ({
  epaper,
  allNews = [],
  onNavigateHome,
  settings,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articles, setArticles] = useState<NewsArticle[]>(allNews);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Synchronize when prop changes
  useEffect(() => {
    if (allNews && allNews.length > 0) {
      setArticles(allNews);
    }
  }, [allNews]);

  // Auto-fetch latest news from backend to ensure immediate arrival of newly created news
  useEffect(() => {
    fetchNewsList().then(fresh => {
      if (Array.isArray(fresh) && fresh.length > 0) {
        setArticles(fresh);
      }
    }).catch(() => {});
  }, []);

  // Filter published articles and sort newest-first so new news automatically appears at the front
  const publishedArticles = useMemo(() => {
    return [...articles]
      .filter(n => n.status === 'published')
      .sort((a, b) => {
        const timeA = new Date(a.published_at || 0).getTime();
        const timeB = new Date(b.published_at || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.id || 0) - (a.id || 0);
      });
  }, [articles]);

  // Lead article for cover: featured article or the newest published article
  const leadArticle = useMemo(() => {
    return publishedArticles.find(n => n.is_featured) || publishedArticles[0];
  }, [publishedArticles]);

  // Total pages: Cover (Page 1) + each published article automatically
  const TOTAL_PAGES = Math.max(1, 1 + publishedArticles.length);

  // Edition date string: defaults to newest article publication date, epaper date, or today
  const editionDateFormatted = useMemo(() => {
    const latestDate = publishedArticles[0]?.published_at || epaper?.edition_date || new Date();
    return formatBengaliDateShort(latestDate);
  }, [publishedArticles, epaper?.edition_date]);

  // Current inside page article (Page 2 maps to index 0 - the newest news, Page 3 to index 1, etc.)
  const currentArticle = useMemo(() => {
    if (currentPage <= 1) return null;
    return publishedArticles[currentPage - 2] || null;
  }, [currentPage, publishedArticles]);

  // Turn page forward
  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      playPageTurnSound();
      setCurrentPage(prev => Math.min(TOTAL_PAGES, prev + 1));
    }
  };

  // Turn page backward
  const handlePrevPage = () => {
    if (currentPage > 1) {
      playPageTurnSound();
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onNavigateHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, TOTAL_PAGES]);

  const cleanParagraphs = useMemo(() => {
    if (!currentArticle) return [];
    return extractCleanParagraphs(currentArticle.content);
  }, [currentArticle]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#1c1510] text-stone-100 flex flex-col justify-between items-center select-none overflow-hidden font-bengali-body"
      style={{
        backgroundImage: 'radial-gradient(ellipse at center, #241a13 0%, #17100b 100%)'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. MINIMAL TOP BAR */}
      <header className="w-full flex items-center justify-between px-5 pt-4 pb-2 z-20">
        <span className="text-stone-200/95 text-sm sm:text-base font-normal tracking-wide font-bengali-body">
          ই-পত্রিকা • {editionDateFormatted}
        </span>
        <button
          onClick={onNavigateHome}
          className="text-stone-300 hover:text-white transition-colors cursor-pointer p-1"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>
      </header>

      {/* 2. CENTER BOOK CARD CONTAINER */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 w-full max-w-lg relative">
        {/* Left Arrow Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ded6c9]/80 hover:bg-[#ebe3d7] text-[#2c1e15] shadow-md flex items-center justify-center transition-all cursor-pointer ${
            currentPage === 1 ? 'opacity-20 pointer-events-none' : 'active:scale-95'
          }`}
          title="পূর্ববর্তী পাতা"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === TOTAL_PAGES}
          className={`absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ded6c9]/80 hover:bg-[#ebe3d7] text-[#2c1e15] shadow-md flex items-center justify-center transition-all cursor-pointer ${
            currentPage === TOTAL_PAGES ? 'opacity-20 pointer-events-none' : 'active:scale-95'
          }`}
          title="পরবর্তী পাতা"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Outer Wooden/Leather Bevel Frame */}
        <div className="relative w-[92vw] max-w-[420px] sm:max-w-[460px] bg-[#342419] p-2.5 sm:p-3 rounded-md shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-[#24170f]">
          {/* Inner Paper Page */}
          <div 
            className="relative w-full h-[74vh] max-h-[620px] min-h-[500px] bg-[#eae1d2] text-[#241a13] rounded-xs shadow-inner p-5 sm:p-8 flex flex-col justify-between overflow-hidden"
            style={{
              boxShadow: 'inset 12px 0 25px -10px rgba(45, 28, 16, 0.15), inset -5px 0 15px -8px rgba(45, 28, 16, 0.08)'
            }}
          >
            <AnimatePresence mode="wait">
              {currentPage === 1 ? (
                /* COVER PAGE (PAGE 1) - EXACTLY LIKE SCREENSHOT 1 */
                <motion.div
                  key="cover-page"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex flex-col justify-between items-center text-center select-none"
                >
                  {/* Top / Center Masthead and Headline */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full px-2">
                    {/* Site Logo */}
                    <div className="mb-6 sm:mb-8 flex items-center justify-center">
                      <SiteLogo size="xl" className="max-w-[210px] sm:max-w-[240px]" logoUrl={settings?.logo_url} />
                    </div>

                    {/* Tagline: দৈ নি ক   সং স্ক র ণ */}
                    <p className="text-xs sm:text-sm text-[#554133] font-serif tracking-widest mb-5 sm:mb-6 font-medium">
                      {formatSpacedBengali('দৈনিক সংস্করণ')}
                    </p>

                    {/* Lead Headline */}
                    <h1 className="text-base sm:text-lg md:text-xl font-bold font-bengali-display text-[#1c130b] leading-relaxed max-w-[340px] mx-auto mb-4">
                      {leadArticle?.title || 'হামজা চৌধুরীকে স্থায়ীভাবে দলে ভেড়াচ্ছে শেফিল্ড ইউনাইটেড'}
                    </h1>

                    {/* Edition Date */}
                    <p className="text-xs sm:text-sm text-[#4c3729] font-serif font-medium">
                      {editionDateFormatted}
                    </p>
                  </div>

                  {/* Bottom Prompt */}
                  <div className="pb-3 sm:pb-6">
                    <p className="text-xs text-[#705948] font-serif">
                      পাতা উল্টিয়ে পড়ুন
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* INSIDE STORY PAGE (PAGES 2..N) - EXACTLY LIKE SCREENSHOT 2 */
                <motion.div
                  key={`inside-page-${currentPage}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full flex flex-col justify-between text-left select-none"
                >
                  {/* Page Top Header */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#4a3729] font-serif pb-1.5">
                      <span className="font-medium tracking-wide">
                        {formatSpacedBengali(currentArticle?.category_name || 'বিনোদন')}
                      </span>
                      <span className="font-medium">
                        — {bnNum(currentPage)} —
                      </span>
                    </div>
                    {/* Subtle Divider Line */}
                    <div className="w-full h-px bg-[#3e2e21]/15 mb-3" />
                  </div>

                  {/* Page Main Content */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-start space-y-2.5">
                    {/* Kicker / Summary in subtle font */}
                    {currentArticle?.summary && (
                      <p className="text-xs sm:text-[13px] text-[#746050] font-serif leading-normal line-clamp-2">
                        {currentArticle.summary}
                      </p>
                    )}

                    {/* Main Headline */}
                    <h2 className="text-sm sm:text-base md:text-lg font-bold font-bengali-display text-[#1c130b] leading-snug">
                      {currentArticle?.title}
                    </h2>

                    {/* Source / Author Line */}
                    <p className="text-xs sm:text-[13px] font-semibold text-[#3d2c1f]">
                      {currentArticle?.author_name || 'রাশেদ খাঁনের ফেসবুক পোস্ট'}
                    </p>

                    {/* Body Paragraphs */}
                    <div className="space-y-2.5 text-xs sm:text-[13.5px] leading-relaxed text-[#2c2017] font-bengali-body">
                      {cleanParagraphs.length > 0 ? (
                        cleanParagraphs.map((p, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {p}
                          </p>
                        ))
                      ) : (
                        <p className="leading-relaxed">
                          {currentArticle?.summary || 'বিস্তারিত সংবাদ মুদ্রিত সংস্করণে সংরক্ষিত আছে।'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Page Bottom Counter */}
                  <div className="pt-2 text-center text-[11px] sm:text-xs text-[#6c5645] font-serif">
                    {currentPage} / {TOTAL_PAGES}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 3. SLEEK GOLDEN HANDLE AT BOTTOM */}
      <div className="w-14 h-1 bg-[#c99a3a] rounded-full mx-auto mb-3 opacity-90" />
    </div>
  );
};
