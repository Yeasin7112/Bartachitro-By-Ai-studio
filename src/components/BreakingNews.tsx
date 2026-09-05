import React, { useState, useMemo } from 'react';
import { Zap, Pause, Play } from 'lucide-react';
import { NewsArticle } from '../types';

interface BreakingNewsProps {
  breakingArticles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
}

export const BreakingNews: React.FC<BreakingNewsProps> = ({
  breakingArticles,
  onOpenArticle
}) => {
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Replicate articles to guarantee a seamless continuous loop regardless of how few items exist
  const tickerItems = useMemo(() => {
    if (!breakingArticles || breakingArticles.length === 0) return [];
    
    // Ensure at least 6 items per half-loop for dense, continuous streaming
    let base = [...breakingArticles];
    while (base.length < 5) {
      base = [...base, ...breakingArticles];
    }
    // Return two identical sets [Set A, Set B] for infinite keyframe translateX(0%) -> translateX(-50%)
    return [...base, ...base];
  }, [breakingArticles]);

  if (!breakingArticles || breakingArticles.length === 0) return null;

  const isPaused = isManuallyPaused || isHovered;

  return (
    <div 
      className="bg-red-800 text-white flex items-center h-8 sm:h-9 overflow-hidden border-b border-red-900 shadow-2xs relative z-20 select-none"
      role="region"
      aria-label="ব্রেকিং নিউজ স্ক্রলার"
    >
      {/* 1. Left Fixed Badge - Red & Yellow News Channel style */}
      <div className="bg-yellow-400 text-red-950 px-3 sm:px-4 font-black text-[11px] sm:text-xs h-full flex items-center gap-1.5 shrink-0 uppercase tracking-wider select-none shadow-md z-10 border-r border-yellow-500">
        <Zap className="w-3.5 h-3.5 fill-current text-red-700 animate-pulse" />
        <span className="font-bengali-display tracking-tight">ব্রেকিং নিউজ</span>
      </div>

      {/* 2. Side-to-Side Auto Scrolling Marquee Track */}
      <div 
        className="flex-1 overflow-hidden relative h-full flex items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        {/* Left inner fade mask */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-red-800 to-transparent z-5 pointer-events-none" />

        {/* Continuous Marquee Stream */}
        <div 
          className={`animate-marquee ${isPaused ? 'animate-marquee-paused' : ''} flex items-center gap-8 py-1`}
          style={{ animationDuration: `${Math.max(25, tickerItems.length * 4)}s` }}
        >
          {tickerItems.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              onClick={() => onOpenArticle(item)}
              className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium whitespace-nowrap group shrink-0"
              title={item.title}
            >
              {/* Bullet divider */}
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block shrink-0 group-hover:scale-125 transition-transform" />
              <span className="group-hover:underline underline-offset-2">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* Right inner fade mask */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-red-800 to-transparent z-5 pointer-events-none" />
      </div>

      {/* 3. Right Pause / Resume Control */}
      <div className="hidden sm:flex items-center px-2 shrink-0 z-10 border-l border-red-700/60 h-full bg-red-800/90">
        <button
          onClick={() => setIsManuallyPaused(!isManuallyPaused)}
          className="text-red-200 hover:text-white p-1 rounded transition-colors cursor-pointer"
          title={isPaused ? 'স্ক্রোল চালু করুন' : 'স্ক্রোল থামান'}
          aria-label={isPaused ? 'স্ক্রোল চালু করুন' : 'স্ক্রোল থামান'}
        >
          {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
        </button>
      </div>
    </div>
  );
};

