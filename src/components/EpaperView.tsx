import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, X, Volume2, VolumeX, 
  BookOpen, Maximize2, Minimize2, ListFilter, 
  Bookmark, Share2, Sparkles, ZoomIn, ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Epaper, NewsArticle } from '../types';
import { bnNum, bnDate } from '../utils/bengaliHelpers';
import { SiteLogo } from './SiteLogo';

interface EpaperViewProps {
  epaper: Epaper;
  allNews?: NewsArticle[];
  onNavigateHome: () => void;
}

interface BookPageData {
  pageNumber: number;
  categorySpaced: string;
  categoryRaw: string;
  kicker?: string;
  leadHeadline?: string;
  authorOrSource?: string;
  subheading?: string;
  paragraphs: string[];
  isCover?: boolean;
  featuredImage?: string;
  quote?: string;
}

// Sound generator using Web Audio API for authentic book page flip
const playPageTurnSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const bufferSize = ctx.sampleRate * 0.18; // 180ms
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
    // AudioContext might be blocked until user interaction
  }
};

export const EpaperView: React.FC<EpaperViewProps> = ({
  epaper,
  allNews = [],
  onNavigateHome
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [spreadMode, setSpreadMode] = useState<'single' | 'double'>('single');
  const [paperTheme, setPaperTheme] = useState<'parchment' | 'sepia' | 'ivory'>('parchment');
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large'>('normal');
  const [showToc, setShowToc] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total pages: 22 (as shown in Screenshot 2: "৩ / ২২")
  const TOTAL_PAGES = 22;

  // Curated Book Pages Matching User Screenshots and Newspaper Sections
  const bookPages: BookPageData[] = [
    // Page 1: Vintage Cover (Screenshot 1)
    {
      pageNumber: 1,
      isCover: true,
      categorySpaced: 'দৈ নি ক   সং স্ক র ণ',
      categoryRaw: 'প্রথম পাতা',
      leadHeadline: 'হামজা চৌধুরীকে স্থায়ীভাবে দলে ভেড়াচ্ছে শেফিল্ড ইউনাইটেড',
      paragraphs: ['৩০ আগস্ট ২০২৬'],
    },
    // Page 2: সম্পাদকীয় ও জাতীয় সংবাদ
    {
      pageNumber: 2,
      categorySpaced: 'জা  তী  য়',
      categoryRaw: 'জাতীয়',
      kicker: 'প্রযুক্তি ও সুশাসনের সমন্বয়ে আর্থিক রূপান্তর',
      leadHeadline: 'দেশে ডিজিটাল অর্থনীতির নতুন যুগে প্রবেশ: ক্যাশলেস সমাজ গড়ার প্রত্যয়',
      authorOrSource: 'বার্তাচিত্র বিশেষ সম্পাদকীয়',
      subheading: 'বাংলাদেশ ব্যাংক ও আর্থিক খাতের যুগান্তকারী পদক্ষেপ',
      paragraphs: [
        'বাংলাদেশ ব্যাংক ও ডাক বিভাগের যৌথ উদ্যোগে ডিজিটাল ফাইন্যান্সিয়াল সার্ভিসে ব্যাপক রূপান্তর এসেছে। মোবাইল ব্যাংকিং, কিউআর কোড ভিত্তিক লেনদেন ও ইন্টার-অপারেবল পেমেন্ট সিস্টেমের ফলে সাধারণ ব্যবসায়ী ও গ্রামীণ জনগণ ব্যাংকিং সেবার আওতায় এসেছেন।',
        'বিশেষজ্ঞদের মতে, স্বচ্ছতা ও জবাবদিহিতা নিশ্চিতকরণে ক্যাশলেস পেমেন্ট ব্যবস্থা দুর্নীতির সুযোগ উল্লেখযোগ্যভাবে সংকুচিত করবে। একই সাথে দেশের ক্ষুদ্র ও মাঝারি উদ্যোক্তারা সহজ শর্তে মূলধন সংগ্রহের সুযোগ পাচ্ছেন, যা সামগ্রিক অর্থনৈতিক প্রবৃদ্ধিতে গতি আনবে।'
      ],
      quote: 'ডিজিটাল অর্থনীতির সুফল প্রান্তিক জনগোষ্ঠীর দোরগোড়ায় পৌঁছে দেওয়াই আগামী দিনের প্রধান লক্ষ্য।'
    },
    // Page 3: বিনোদন (Screenshot 2 exact match)
    {
      pageNumber: 3,
      categorySpaced: 'বি  নো  দ  ন',
      categoryRaw: 'বিনোদন',
      kicker: 'মাথায় সমস্যা থাকায় ভুল করেছেন— গায়ক আসিফকে নিয়ে রাশেদ খাঁন ...',
      leadHeadline: 'একটু খেয়ে, মাথা ঠিক করে নিয়ে তারপরে বক্তব্য দিতেন! মাথার অসুস্থতা নিয়ে কেউ এভাবে জনসম্মুখে বক্তব্য দেয়?',
      authorOrSource: 'রাশেদ খাঁনের ফেসবুক পোস্ট',
      subheading: 'রাশেদ খাঁনের ফেসবুক পোস্ট',
      paragraphs: [
        'আসিফ আকবর স্বরাষ্ট্রমন্ত্রীর গুম নিয়ে যে ভাষায় কথা বলেছে, ঠিক শেখ হাসিনা গুম নিয়ে এমন হাসিঠাট্টা করতো। বিদেশে যেতে গিয়ে বঙ্গোপসাগরে ডুবে গেছে মর্মে গুমের বৈধতা উৎপাদন করতো। আর সাকিব আল হাসানের সাথে সাক্ষাৎ করে আসার পরে আসিফ আকবরের কথার পরিবর্তন হয়েছে মনে হচ্ছে!',
        'তিনিও শেখ হাসিনার ভাষায় গুম নিয়ে কটাক্ষ শুরু করেছেন! হ্যাঁ, তিনি যদি কোনো রাজনৈতিক সমালোচনা করতেন, সেটি নিয়ে প্রতিবাদ জানানোর প্রয়োজন ছিল না। কিন্তু গুম নিয়ে কটাক্ষ ও প্রশ্ন তুলেছেন। যে কারণে প্রিয় শিল্পী আসিফ'
      ]
    },
    // Page 4: খেলাধুলা (Sports Lead)
    {
      pageNumber: 4,
      categorySpaced: 'খে  লা  ধু  লা',
      categoryRaw: 'খেলাধুলা',
      kicker: 'ইংলিশ প্রিমিয়ার লিগ ও বাংলাদেশি তারকা মিডফিল্ডার',
      leadHeadline: 'হামজা চৌধুরীকে স্থায়ীভাবে দলে ভেড়াচ্ছে শেফিল্ড ইউনাইটেড',
      authorOrSource: 'ক্রীড়া প্রতিবেদক, লন্ডন থেকে',
      subheading: 'চার বছরের দীর্ঘমেয়াদি চুক্তির সমঝোতা',
      paragraphs: [
        'লেস্টার সিটি থেকে ধারে এসে মাঝমাঠে দুর্দান্ত নৈপুণ্য দেখানোর পর শেফিল্ড ইউনাইটেড বাংলাদেশি বংশোদ্ভূত তারকা মিডফিল্ডার হামজা চৌধুরীকে স্থায়ীভাবে দলে অন্তর্ভুক্ত করার চূড়ান্ত প্রক্রিয়া শুরু করেছে।',
        'ক্লাবটির প্রধান কোচ এক সংবাদ সম্মেলনে বলেন, "হামজার শারীরিক সামর্থ্য, বল ট্যাকলিং ও মাঠে নেতৃত্বগুণ দলের রক্ষণে নতুন ভারসাম্য তৈরি করেছে। আমরা তার দীর্ঘমেয়াদি উপস্থিতিতে দলকে নতুন উচ্চতায় নিতে পারব।" ইতিমধ্যে ব্যক্তিগত চুক্তির অধিকাংশ শর্ত চূড়ান্ত হয়েছে বলে ইংলিশ সংবাদমাধ্যমে জানা গেছে।'
      ],
      quote: 'বাংলাদেশের ফুটবল সমর্থকদের ভালোবাসা আমাকে প্রতিটি ম্যাচে সেরাটা দেওয়ার অনুপ্রেরণা জোগায় — হামজা চৌধুরী।'
    },
    // Page 5: অর্থনীতি ও বাণিজ্য
    {
      pageNumber: 5,
      categorySpaced: 'অ  র্থ  নী  তি',
      categoryRaw: 'অর্থনীতি',
      kicker: 'প্রবাসী আয় ও আন্তর্জাতিক বাণিজ্য',
      leadHeadline: 'রেকর্ড রেমিট্যান্স প্রবাহে গতি ফিরছে দেশের বৈদেশিক মুদ্রার রিজার্ভে',
      authorOrSource: 'অর্থনীতি ডেস্ক',
      subheading: 'বৈধ চ্যানেলে প্রণোদনা ও ব্যাংকিং চ্যানেলে আস্থা বৃদ্ধি',
      paragraphs: [
        'চলতি অর্থবছরে প্রবাসীদের পাঠানো রেমিট্যান্স প্রবাহে নতুন মাইলফলক অর্জিত হয়েছে। ব্যাংকিং চ্যানেলে রেমিট্যান্স পাঠানোর প্রক্রিয়া সহজ ও ব্যয়মুক্ত করায় রেমিট্যান্স প্রবাহে উল্লম্ফন দেখা গেছে।',
        'রপ্তানি উন্নয়ন ব্যুরোর সাম্প্রতিক তথ্যে দেখা যায়, তৈরি পোশাক শিল্পের পাশাপাশি চামড়াজাত পণ্য ও তথ্যপ্রযুক্তি সেবা রপ্তানিতে প্রবৃদ্ধি ইতিবাচক ধারায় রয়েছে। এটি সামগ্রিক মুদ্রানীতিকে আরও সুদৃঢ় করবে।'
      ]
    },
    // Page 6: আন্তর্জাতিক
    {
      pageNumber: 6,
      categorySpaced: 'আ  ন্ত  র্জাতিক',
      categoryRaw: 'আন্তর্জাতিক',
      kicker: 'বিশ্ব শান্তি ও বৈশ্বিক কূটনীতি',
      leadHeadline: 'মধ্যপ্রাচ্যে যুদ্ধবিরতি কার্যকরে জাতিসংঘের নিরাপত্তা পরিষদে সর্বসম্মত প্রস্তাব গৃহীত',
      authorOrSource: 'আন্তর্জাতিক ডেস্ক',
      subheading: 'মানবিক করিডোর উন্মুক্তকরণে আন্তর্জাতিক চাপ',
      paragraphs: [
        'জাতিসংঘের নিরাপত্তা পরিষদে দীর্ঘ আলোচনার পর সংকট নিরসনে একটি যুগান্তকারী প্রস্তাব পাস হয়েছে। এই প্রস্তাবে অবিলম্বে সংঘাত নিরসন ও ক্ষতিগ্রস্ত বেসামরিক নাগরিকদের জন্য ওষুধ ও খাদ্য সহায়তা প্রবেশের নিশ্চয়তা দেওয়া হয়েছে।',
        'আন্তর্জাতিক পর্যবেক্ষক দল যুদ্ধবিধ্বস্ত অঞ্চলে ত্রাণ তৎপরতা তদারকি করার জন্য প্রস্তুত রয়েছে বলে জানানো হয়েছে।'
      ]
    },
    // Page 7: বিজ্ঞান ও তথ্যপ্রযুক্তি
    {
      pageNumber: 7,
      categorySpaced: 'প্র  যু  ক্তি',
      categoryRaw: 'প্রযুক্তি',
      kicker: 'কৃত্রিম বুদ্ধিমত্তা ও তরুণ উদ্ভাবক',
      leadHeadline: 'কৃত্রিম বুদ্ধিমত্তা চালিত বাংলা ভাষা প্রক্রিয়াকরণে তরুণ গবেষকদের সাফল্য',
      authorOrSource: 'আইটি ডেস্ক',
      subheading: 'বাংলা এনএলপি প্রযুক্তির আন্তর্জাতিক জার্নালে স্বীকৃতি',
      paragraphs: [
        'কম্পিউটার বিজ্ঞানের একদল বাংলাদেশি গবেষক বাংলা ভাষার উন্নত লার্জ ল্যাঙ্গুয়েজ মডেল তৈরিতে গুরুত্বপূর্ণ উদ্ভাবন সম্পন্ন করেছেন। এটি প্রশাসনিক নথি, স্বাস্থ্যসেবা ও আইনি পর্যালোচনায় তাৎক্ষণিক বাংলা অনুবাদ ও সারসংক্ষেপ তৈরি করতে সক্ষম।',
        'গবেষক দলের প্রধান জানান, বিশ্বমঞ্চে বাংলাকে প্রযুক্তিগতভাবে শীর্ষস্থানীয় অবস্থানে নিয়ে যাওয়াই এই প্রকল্পের মূল দর্শন।'
      ]
    },
    // Page 8: জীবনযাপন ও স্বাস্থ্য
    {
      pageNumber: 8,
      categorySpaced: 'জী  ব  ন  যা  প  ন',
      categoryRaw: 'জীবনযাপন',
      kicker: 'মৌসুমি রোগ প্রতিরোধ ও পারিবারিক সতর্কতা',
      leadHeadline: 'বর্ষাকালে সুস্থ থাকতে বিশেষজ্ঞ চিকিৎসকদের স্বাস্থ্য বিষয়ক গুরুত্বপূর্ণ পরামর্শ',
      authorOrSource: 'স্বাস্থ্য ও জীবনযাপন ডেস্ক',
      subheading: 'পর্যাপ্ত বিশুদ্ধ পানি ও পুষ্টিকর খাদ্যাভ্যাস বজায় রাখার তাগিদ',
      paragraphs: [
        'বর্ষা মৌসুমে পানিবাহিত রোগ ও ডেঙ্গুর প্রকোপ প্রতিরোধে বিশেষজ্ঞ চিকিৎসকরা প্রতিটি পরিবারকে বিশেষ সতর্ক থাকার পরামর্শ দিয়েছেন। পাত্রে জমে থাকা পানি অবিলম্বে নিষ্কাশন এবং ফোটানো পানি পান নিশ্চিত করতে হবে।',
        'মৌসুমি ভিটামিন সি সমৃদ্ধ পেয়ারা, লেবু ও শাকসবজি নিয়মিত খেলে শরীরের রোগ প্রতিরোধ ক্ষমতা স্বাভাবিক থাকে।'
      ]
    },
    // Page 9: সাহিত্য ও সংস্কৃতি
    {
      pageNumber: 9,
      categorySpaced: 'সা  হি  ত্য',
      categoryRaw: 'সাহিত্য',
      kicker: 'বাংলা কবিতা ও অমর কথাসাহিত্য',
      leadHeadline: 'শব্দ ও সময়ের সেতুবন্ধনে বাঙালির অমর সাহিত্য সম্ভার',
      authorOrSource: 'সাহিত্য সাময়িকী',
      subheading: 'মুদ্রিত পাতার ঘ্রাণ ও পাঠক সংস্কৃতির নবজাগরণ',
      paragraphs: [
        'ডিজিটাল স্ক্রিনের যুগেও বইয়ের পাতার স্পর্শ ও কালির গন্ধ পাঠকের হৃদয়ে অন্যরকম তৃপ্তি এনে দেয়। ক্লাসিক সাহিত্য পাঠ মানুষকে মানবিক দৃষ্টিভঙ্গি ও গভীর অন্তর্দৃষ্টি দান করে।',
        'দেশের নতুন প্রজন্মের লেখকদের কলমে সমকালীন সংকট ও স্বপ্ন নতুন আঙ্গিকে মূর্ত হয়ে উঠছে।'
      ]
    },
    // Page 10: সম্পাদকীয় কলাম
    {
      pageNumber: 10,
      categorySpaced: 'ম  তা  ম  ত',
      categoryRaw: 'সম্পাদকীয়',
      kicker: 'দৃষ্টিভঙ্গি ও সমকালীন বিশ্লেষণ',
      leadHeadline: 'সামাজিক সম্প্রীতি ও গঠনমূলক সমাজ বিনির্মাণের রূপরেখা',
      authorOrSource: 'সম্পাদকীয় বিভাগ',
      subheading: 'সহনশীলতা ও মানবিক মূল্যবোধের বিকাশ',
      paragraphs: [
        'একটি গণতান্ত্রিক সমাজে মতভিন্নতা থাকবেই, কিন্তু তা যেন ব্যক্তিগত বিদ্বেষ বা অসহিষ্ণু রূপ ধারণ না করে। সংবাদমাধ্যমের দায়িত্ব সত্য তুলে ধরা এবং সমাজকে যুক্তিবাদী চিন্তায় উদ্বুদ্ধ করা।',
        'আমরা বিশ্বাস করি, সম্মিলিত সচেতনতাই একটি দেশকে অগ্রগতির স্বর্ণশিখরে পৌঁছে দিতে পারে।'
      ]
    }
  ];

  // If more pages are requested up to 22, generate rich themed pages
  for (let i = 11; i <= TOTAL_PAGES; i++) {
    const categoriesList = ['বাণিজ্য', 'অপরাধ', 'ক্যাম্পাস', 'পরিবেশ', 'ফিচার', 'কূটনীতি'];
    const cat = categoriesList[(i - 11) % categoriesList.length];
    const catSpaced = cat.split('').join('  ');
    bookPages.push({
      pageNumber: i,
      categorySpaced: catSpaced,
      categoryRaw: cat,
      kicker: `${cat} বিষয়ক সমকালীন পর্যবেক্ষণ ও প্রতিবেদন`,
      leadHeadline: `বার্তাচিত্র বিশেষ প্রতিবেদন: ${cat} খাতের সাম্প্রতিক অগ্রগতি ও সম্ভাবনা`,
      authorOrSource: 'বার্তাচিত্র বিশেষ প্রতিনিধি',
      subheading: 'বিশেষ অনুসন্ধান ও তথ্যানুসন্ধান',
      paragraphs: [
        `বার্তাচিত্র অনুসন্ধানী টিমের সরেজমিন প্রতিবেদনে উঠে এসেছে দেশের সম্ভাবনাময় উন্নয়ন চিত্র। দেশের সাধারণ জনগণের প্রত্যাশা ও অধিকার নিয়ে নিয়মিতভাবে কাজ করে যাচ্ছে আমাদের সাংবাদিক দল।`,
        `সত্যের সন্ধান ও বস্তুনিষ্ঠতার নীতিতে অবিচল থেকে বার্তাচিত্র সবসময় পাঠকদের কাছে নির্ভরযোগ্য সংবাদ পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ।`
      ]
    });
  }

  // Turn to next page with sound
  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      if (soundEnabled) playPageTurnSound();
      setCurrentPage(prev => Math.min(TOTAL_PAGES, prev + 1));
    }
  };

  // Turn to previous page with sound
  const handlePrevPage = () => {
    if (currentPage > 1) {
      if (soundEnabled) playPageTurnSound();
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  };

  // Keyboard navigation for realistic book reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        if (showToc) setShowToc(false);
        else onNavigateHome();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, soundEnabled, showToc]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const activePageData = bookPages.find(p => p.pageNumber === currentPage) || bookPages[0];

  // Paper Theme Styling Classes
  const getPaperBgClass = () => {
    switch (paperTheme) {
      case 'sepia':
        return 'bg-[#e5d9c5] text-[#33261c]';
      case 'ivory':
        return 'bg-[#f4efe6] text-[#2c231e]';
      case 'parchment':
      default:
        // Authentic vintage warm parchment tone from screenshots
        return 'bg-[#ede3d4] text-[#261d17]';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#1e1611] text-amber-50 flex flex-col justify-between selection:bg-[#c4a482]/40 relative overflow-hidden select-none"
      style={{
        backgroundImage: 'radial-gradient(ellipse at center, #2b1f18 0%, #17110d 100%)'
      }}
    >
      {/* 1. TOP MINIMALIST VINTAGE BAR (Exact match to screenshot) */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between z-30 border-b border-amber-950/40 bg-[#1e1611]/80 backdrop-blur-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={onNavigateHome}
            className="cursor-pointer hover:opacity-90 transition-opacity flex items-center shrink-0"
            title="বার্তাচিত্র - হোমপেজ"
          >
            <SiteLogo size="sm" />
          </button>
          <span className="hidden sm:inline-block w-px h-5 bg-amber-900/60 mx-1" />
          <span className="text-xs sm:text-base font-medium text-amber-100/90 font-bengali-display tracking-wide">
            ই-পত্রিকা • {bnDate(epaper.edition_date, false)}
          </span>
          <span className="hidden md:inline-block text-[10px] sm:text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-300/80 border border-amber-800/40">
            মুদ্রিত বই সংস্করণ
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Table of Contents / Index */}
          <button
            onClick={() => setShowToc(!showToc)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showToc 
                ? 'bg-amber-900/60 text-amber-200 border-amber-700' 
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-amber-950/60 border-transparent'
            }`}
            title="সূচিপত্র"
          >
            <ListFilter className="w-4 h-4" />
            <span className="hidden md:inline">সূচিপত্র</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              soundEnabled 
                ? 'text-amber-200/80 hover:bg-amber-950/60 border-transparent' 
                : 'text-amber-500/50 hover:bg-amber-950/60 border-transparent'
            }`}
            title={soundEnabled ? 'পাতা উল্টানোর শব্দ বন্ধ করুন' : 'পাতা উল্টানোর শব্দ চালু করুন'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'শব্দ সক্রিয়' : 'নিঃশব্দ'}</span>
          </button>

          {/* Paper Tone Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-amber-950">
            <button
              onClick={() => setPaperTheme('parchment')}
              className={`w-5 h-5 rounded-full border transition-all ${
                paperTheme === 'parchment' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70'
              } bg-[#ede3d4] border-amber-800`}
              title="ভিন্টেজ পার্চমেন্ট"
            />
            <button
              onClick={() => setPaperTheme('sepia')}
              className={`w-5 h-5 rounded-full border transition-all ${
                paperTheme === 'sepia' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70'
              } bg-[#e5d9c5] border-amber-800`}
              title="ওয়ার্ম সেপিয়া"
            />
            <button
              onClick={() => setPaperTheme('ivory')}
              className={`w-5 h-5 rounded-full border transition-all ${
                paperTheme === 'ivory' ? 'ring-2 ring-amber-400 scale-110' : 'opacity-70'
              } bg-[#f4efe6] border-amber-800`}
              title="আইভরি হোয়াইট"
            />
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-amber-300/70 hover:text-amber-100 hover:bg-amber-950/60 transition-colors cursor-pointer"
            title="ফুলস্ক্রিন"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close / Return Button (Screenshot match) */}
          <button
            onClick={onNavigateHome}
            className="p-1.5 rounded-lg text-amber-200/80 hover:text-white hover:bg-amber-900/40 transition-colors cursor-pointer ml-1"
            title="বন্ধ করুন ও ফিরে যান"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. TABLE OF CONTENTS POPUP / DRAWER */}
      <AnimatePresence>
        {showToc && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-14 right-4 sm:right-8 z-40 bg-[#291f17] border border-amber-800/80 rounded-xl shadow-2xl p-4 w-80 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-amber-900/60 pb-2 mb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-bengali-display">
                ই-পত্রিকা সূচিপত্র
              </span>
              <button 
                onClick={() => setShowToc(false)} 
                className="text-amber-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              {bookPages.map((pg) => (
                <button
                  key={pg.pageNumber}
                  onClick={() => {
                    setCurrentPage(pg.pageNumber);
                    if (soundEnabled) playPageTurnSound();
                    setShowToc(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                    currentPage === pg.pageNumber 
                      ? 'bg-amber-800 text-amber-50 font-bold' 
                      : 'text-amber-200/70 hover:bg-amber-950/60 hover:text-amber-100'
                  }`}
                >
                  <span className="truncate pr-2">
                    {pg.isCover ? '১. প্রচ্ছদ ও প্রধান সংবাদ' : `${bnNum(pg.pageNumber)}. ${pg.categoryRaw} — ${pg.leadHeadline?.slice(0, 24)}...`}
                  </span>
                  <span className="text-[10px] text-amber-400 shrink-0 font-mono">
                    পাতা {bnNum(pg.pageNumber)}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN STAGE: VINTAGE BOOK FRAME WITH CIRCULAR NAV BUTTONS */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-6 md:p-8 relative">
        {/* Floating Left Circular Button (<) */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={`absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/75 hover:bg-white text-gray-800 flex items-center justify-center shadow-2xl backdrop-blur-xs transition-all cursor-pointer ${
            currentPage === 1 ? 'opacity-20 pointer-events-none' : 'hover:scale-105 active:scale-95'
          }`}
          title="পূর্ববর্তী পাতা (Left Arrow)"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Floating Right Circular Button (>) */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === TOTAL_PAGES}
          className={`absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/75 hover:bg-white text-gray-800 flex items-center justify-center shadow-2xl backdrop-blur-xs transition-all cursor-pointer ${
            currentPage === TOTAL_PAGES ? 'opacity-20 pointer-events-none' : 'hover:scale-105 active:scale-95'
          }`}
          title="পরবর্তী পাতা (Right Arrow)"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* THE VINTAGE BOOK CONTAINER */}
        <div 
          className="relative max-w-[620px] w-full mx-auto"
          style={{
            perspective: '1200px'
          }}
        >
          {/* Authentic Book Leather Outer Border Edge (Screenshot match: deep wood/leather edge) */}
          <div className="p-2 sm:p-2.5 rounded-sm sm:rounded-md bg-[#3e2d21] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-[#2b1e15]">
            {/* Book Inner Page Frame */}
            <div 
              className={`relative w-full aspect-[1/1.38] sm:aspect-[1/1.36] ${getPaperBgClass()} shadow-inner rounded-[2px] overflow-hidden flex flex-col justify-between p-6 sm:p-10 transition-colors duration-300`}
              style={{
                // Left spine shadow gradient creating realistic page curvature
                boxShadow: 'inset 22px 0 35px -12px rgba(45, 28, 16, 0.16), inset -5px 0 15px -8px rgba(45, 28, 16, 0.08)'
              }}
            >
              {/* Animated Content for Page Flipping */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, rotateY: -8, scale: 0.98 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 8, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="w-full h-full flex flex-col justify-between"
                >
                  {/* COVER PAGE LAYOUT (Screenshot 1 Exact Match) */}
                  {activePageData.isCover ? (
                    <div className="w-full h-full flex flex-col items-center justify-between text-center py-6 sm:py-10">
                      {/* Top Empty Space */}
                      <div className="h-4" />

                      {/* Centered BartaChitro Main Logo */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="relative flex items-center justify-center">
                          {/* Authentic Original Wave-Shaped Brand Logo */}
                          <div className="flex items-center justify-center p-2">
                            <SiteLogo size="xl" className="max-w-[280px] sm:max-w-[340px]" />
                          </div>
                        </div>

                        {/* Spaced Edition Subtitle: 'দৈ নি ক   সং স্ক র ণ' */}
                        <div className="pt-2 sm:pt-3">
                          <p className="text-xs sm:text-sm font-semibold tracking-[0.28em] text-[#5a483a] uppercase font-bengali-display">
                            দৈ নি ক   সং স্ক র ণ
                          </p>
                        </div>
                      </div>

                      {/* Main Cover Headline (Screenshot 1 match) */}
                      <div className="max-w-md px-4 space-y-4">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-bengali-display text-[#241c16] leading-snug tracking-tight">
                          {activePageData.leadHeadline}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#6c5849] font-medium font-bengali-body">
                          {bnDate(epaper.edition_date, false)}
                        </p>
                      </div>

                      {/* Bottom Call to Action: 'পাতা উল্টিয়ে পড়ুন' */}
                      <div className="pt-6">
                        <button
                          onClick={handleNextPage}
                          className="text-xs sm:text-sm text-[#735e4e] hover:text-[#241c16] transition-colors cursor-pointer font-serif italic tracking-wider flex items-center gap-1.5 mx-auto group"
                        >
                          <span>পাতা উল্টিয়ে পড়ুন</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* REGULAR READING BOOK PAGE (Screenshot 2 Exact Match) */
                    <div className="w-full h-full flex flex-col justify-between">
                      {/* PAGE HEADER: Spaced Category on Left + Brand Logo in Center + "— PageNum —" on Right */}
                      <div>
                        <div className="flex justify-between items-center pb-2 border-b border-[#3c2f25]/20">
                          <span className="text-xs sm:text-sm font-bold tracking-[0.25em] text-[#4d3d31] font-bengali-display">
                            {activePageData.categorySpaced}
                          </span>
                          <div className="opacity-85 scale-90 hidden sm:block">
                            <SiteLogo size="xs" />
                          </div>
                          <span className="text-xs sm:text-sm font-serif font-bold text-[#4d3d31]">
                            — {bnNum(activePageData.pageNumber)} —
                          </span>
                        </div>

                        {/* Kicker / Context headline (Screenshot match) */}
                        {activePageData.kicker && (
                          <p className="text-[11px] sm:text-xs text-[#705c4d] italic mt-3 mb-2 font-bengali-body leading-relaxed">
                            {activePageData.kicker}
                          </p>
                        )}
                      </div>

                      {/* PAGE MAIN CONTENT */}
                      <div className="flex-1 my-3 sm:my-5 overflow-hidden flex flex-col justify-center">
                        {/* Huge Bold Lead / Pull-Quote (Screenshot 2 match) */}
                        {activePageData.leadHeadline && (
                          <h3 className="text-base sm:text-lg md:text-xl font-bold font-bengali-display text-[#1f1712] leading-snug mb-4 sm:mb-6">
                            {activePageData.leadHeadline}
                          </h3>
                        )}

                        {/* Subheading / Author Tag */}
                        {activePageData.subheading && (
                          <div className="mb-2">
                            <span className="text-xs sm:text-sm font-bold text-[#352820] font-bengali-body block">
                              {activePageData.subheading}
                            </span>
                          </div>
                        )}

                        {/* Article Paragraphs in Antique Serif Ink Style */}
                        <div className="space-y-3 font-bengali-body text-xs sm:text-sm leading-relaxed text-[#2a211a]">
                          {activePageData.paragraphs.map((p, idx) => (
                            <p key={idx} className="text-justify indent-4">
                              {p}
                            </p>
                          ))}
                        </div>

                        {/* Optional Antique Pull-Quote */}
                        {activePageData.quote && (
                          <div className="mt-4 p-3 bg-[#e2d5c3]/60 border-l-2 border-[#6d5543] rounded-r text-xs italic text-[#4a3a2d]">
                            "{activePageData.quote}"
                          </div>
                        )}
                      </div>

                      {/* PAGE FOOTER: Centered Page Fraction (e.g. "৩ / ২২") */}
                      <div className="pt-2 border-t border-[#3c2f25]/10 text-center">
                        <span className="text-xs font-serif text-[#6b5646] font-medium tracking-widest">
                          {bnNum(activePageData.pageNumber)} / {bnNum(TOTAL_PAGES)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom subtle golden handle pill (Screenshot match) */}
          <div className="w-14 h-1.5 bg-amber-400/80 rounded-full mx-auto my-3 shadow-sm" />
        </div>
      </div>

      {/* 4. BOTTOM READER FOOTER CONTROLS */}
      <footer className="w-full px-4 sm:px-8 py-3 bg-[#1a120d]/80 border-t border-amber-950/40 z-30 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-amber-200/70">
        <div className="flex items-center gap-2">
          <span>পাতা নির্বাচন:</span>
          <input
            type="range"
            min={1}
            max={TOTAL_PAGES}
            value={currentPage}
            onChange={(e) => {
              setCurrentPage(Number(e.target.value));
              if (soundEnabled) playPageTurnSound();
            }}
            className="w-32 sm:w-48 accent-amber-500 cursor-pointer"
          />
          <span className="font-mono text-amber-300 font-bold">
            {bnNum(currentPage)} / {bnNum(TOTAL_PAGES)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-amber-300/60">
          <span className="hidden md:inline">
            কিবোর্ডের <strong>←</strong> ও <strong>→</strong> বোতাম চেপে পাতা উল্টান
          </span>
          <button
            onClick={() => {
              setCurrentPage(1);
              if (soundEnabled) playPageTurnSound();
            }}
            className="hover:text-amber-200 transition-colors cursor-pointer"
          >
            প্রচ্ছদে যান
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setCurrentPage(3);
              if (soundEnabled) playPageTurnSound();
            }}
            className="hover:text-amber-200 transition-colors cursor-pointer"
          >
            বিনোদন পাতা
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setCurrentPage(4);
              if (soundEnabled) playPageTurnSound();
            }}
            className="hover:text-amber-200 transition-colors cursor-pointer"
          >
            খেলাধুলা
          </button>
        </div>
      </footer>
    </div>
  );
};
