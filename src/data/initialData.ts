import { Category, NewsArticle, Epaper, Advertisement, SiteSettings, ContactMessage } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'জাতীয়', slug: 'national', display_order: 1, status: 'active' },
  { id: 2, name: 'রাজনীতি', slug: 'politics', display_order: 2, status: 'active' },
  { id: 3, name: 'অর্থনীতি', slug: 'economy', display_order: 3, status: 'active' },
  { id: 4, name: 'আন্তর্জাতিক', slug: 'international', display_order: 4, status: 'active' },
  { id: 5, name: 'খেলাধুলা', slug: 'sports', display_order: 5, status: 'active' },
  { id: 6, name: 'বিনোদন', slug: 'entertainment', display_order: 6, status: 'active' },
  { id: 7, name: 'তথ্যপ্রযুক্তি', slug: 'technology', display_order: 7, status: 'active' },
  { id: 8, name: 'জীবনযাপন', slug: 'lifestyle', display_order: 8, status: 'active' },
  { id: 9, name: 'মতামত', slug: 'opinion', display_order: 9, status: 'active' },
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 1,
    category_id: 1,
    category_name: 'জাতীয়',
    category_slug: 'national',
    title: 'দেশে আধুনিক ডিজিটাল অর্থনীতির নতুন যুগে প্রবেশ: জাতীয় ডেটা হাব উদ্বোধন',
    slug: 'bangladesh-digital-economy-national-data-hub-launch',
    summary: 'বাংলাদেশকে স্মার্ট ও আধুনিক প্রযুক্তিনির্ভর অর্থনীতির কেন্দ্রবিন্দু হিসেবে রূপান্তরের লক্ষ্যে সর্বাধুনিক জাতীয় ডেটা হাব আনুষ্ঠানিকভাবে যাত্রা শুরু করল।',
    content: `<p>ঢাকা: দেশকে তথ্যপ্রযুক্তির পরবর্তী স্তরে নিয়ে যেতে এবং প্রশাসনিক কার্যক্রমে সর্বোচ্চ স্বচ্ছতা আনয়নে আজ আনুষ্ঠানিকভাবে উদ্বোধন করা হলো অত্যাধুনিক জাতীয় ডেটা সেন্টার ও ক্লাউড অবকাঠামো। অনুষ্ঠানে সংশ্লিষ্ট মন্ত্রণালয় ও তথ্যপ্রযুক্তি খাতের বিশেষজ্ঞগণ উপস্থিত ছিলেন।</p>
<p>প্রধান বক্তা তার বক্তব্যে বলেন, "এই ডেটা হাব শুধু সরকারি ডেটার নিরাপত্তা নিশ্চিত করবে না, বরং বাংলাদেশের স্থানীয় স্টার্টআপ ও ডিজিটাল সেবা প্রদানকারী প্রতিষ্ঠানগুলোর জন্য সাশ্রয়ী ও উচ্চগতির সার্ভার সহায়তা প্রদান করবে।"</p>
<p>পরিকল্পনা অনুযায়ী, আগামী ৬ মাসের মধ্যে দেশের সকল বিভাগীয় শহরের ডিজিটাল সংযোগ এই জাতীয় ডেটা গ্রিডের সাথে যুক্ত করা হবে। এর ফলে সরকারি সেবা গ্রহণ এখন আরও দ্রুত ও ঝামেলামুক্ত হবে।</p>`,
    author_name: 'বিশেষ প্রতিবেদক',
    featured_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
    image_caption: 'উদ্বোধনী অনুষ্ঠানে উপস্থিত জাতীয় ডেটা হাবের প্রযুক্তি বিশেষজ্ঞ দল।',
    views: 1420,
    is_featured: true,
    is_breaking: true,
    status: 'published',
    published_at: '2026-08-30 09:30:00',
    seo_title: 'দেশে ডিজিটাল অর্থনীতির নতুন যুগে প্রবেশ | বার্তাচিত্র',
    seo_description: 'বাংলাদেশকে স্মার্ট প্রযুক্তিনির্ভর অর্থনীতির কেন্দ্রবিন্দু হিসেবে রূপান্তরে সর্বাধুনিক জাতীয় ডেটা হাবের যাত্রা।'
  },
  {
    id: 2,
    category_id: 2,
    category_name: 'রাজনীতি',
    category_slug: 'politics',
    title: 'নির্বাচন ব্যবস্থা সংস্কারে রাজনৈতিক দলগুলোর সঙ্গে নির্বাচন কমিশনের ফলপ্রসূ সংলাপ',
    slug: 'election-commission-dialogue-with-political-parties-reforms',
    summary: 'একটি অবাধ, সুষ্ঠু ও নিরপেক্ষ নির্বাচন নিশ্চিত করতে রাজনৈতিক দলগুলোর সঙ্গে নির্বাচন কমিশনের দিনব্যাপী গুরুত্বপূর্ণ বৈঠক অনুষ্ঠিত হয়েছে।',
    content: `<p>রাজধানীর আগারগাঁওয়ের নির্বাচন ভবনে রাজনৈতিক দলগুলোর প্রতিনিধিদের সাথে আজ নির্বাচন কমিশনের এক উন্মুক্ত সংলাপ অনুষ্ঠিত হয়। বৈঠকে অবাধ নির্বাচনের জন্য করণীয় বিভিন্ন প্রস্তাবনা পেশ করা হয়।</p>
<p>কমিশনের পক্ষ থেকে জানানো হয়েছে, সকল দলের মতামত অত্যন্ত গুরুত্ব সহকারে বিবেচনা করা হচ্ছে এবং খুব শীঘ্রই খসড়া সুপারিশমালা জনসমক্ষে প্রকাশ করা হবে।</p>`,
    author_name: 'রাজনৈতিক প্রতিবেদক',
    featured_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80',
    views: 890,
    is_featured: false,
    is_breaking: true,
    status: 'published',
    published_at: '2026-08-30 11:15:00'
  },
  {
    id: 3,
    category_id: 3,
    category_name: 'অর্থনীতি',
    category_slug: 'economy',
    title: 'রপ্তানি আয়ে নতুন রেকর্ড: তৈরি পোশাক খাতের পাশাপাশি তথ্যপ্রযুক্তি খাতে চমক',
    slug: 'export-earnings-hit-record-rmg-and-it-sector-growth',
    summary: 'চলতি অর্থবছরে দেশের রপ্তানি আয়ে অভাবনীয় প্রবৃদ্ধি অর্জিত হয়েছে। তৈরি পোশাক খাতের প্রবৃদ্ধির পাশাপাশি আইটি ফ্রিল্যান্সিং ও সফটওয়্যার রপ্তানি নতুন ইতিহাস গড়েছে।',
    content: `<p>বাংলাদেশ ব্যাংকের হালনাগাদ তথ্য অনুসারে, গত মাসের তুলনায় সামগ্রিক রপ্তানি আয় উল্লেখযোগ্যভাবে বৃদ্ধি পেয়েছে। পোশাক শিল্পের আধুনিকায়ন ও পরিবেশবান্ধব সবুজ কারখানার সংখ্যা বৃদ্ধি পাওয়ায় আন্তর্জাতিক ক্রেতাদের আস্থা বাড়ছে।</p>
<p>একই সাথে দেশের আইসিটি ফ্রিল্যান্সার ও সফটওয়্যার প্রতিষ্ঠানগুলো বৈদেশিক মুদ্রার রিজার্ভ শক্তিশালী করতে ব্যাপক ভূমিকা রাখছে।</p>`,
    author_name: 'অর্থনীতি ব্যুরো',
    featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    views: 1150,
    is_featured: false,
    is_breaking: false,
    status: 'published',
    published_at: '2026-08-30 08:45:00'
  },
  {
    id: 4,
    category_id: 5,
    category_name: 'খেলাধুলা',
    category_slug: 'sports',
    title: 'এশিয়া কাপের ফাইনালে শ্বাসরুদ্ধকর লড়াইয়ে বাংলাদেশের ঐতিহাসিক জয়',
    slug: 'asia-cup-final-bangladesh-cricket-historic-thrilling-victory',
    summary: 'শেষ ওভারে অসাধারণ বোলিং নৈপুণ্যে চিরপ্রতিদ্বন্দ্বীকে পরাস্ত করে শিরোপা নিজেদের করে নিল টাইগাররা। সারাদেশে বিজয়োল্লাস।',
    content: `<p>মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে লাখো দর্শকের উল্লাসের মধ্য দিয়ে এশিয়া কাপের শিরোপা জিতে নিয়েছে বাংলাদেশ। শেষ ওভারে জয়ের জন্য প্রতিপক্ষের প্রয়োজন ছিল ১০ রান, তবে টাইগার পেসারদের নিয়ন্ত্রিত বোলিংয়ে মাত্র ৪ রান তুলতে সক্ষম হয় তারা।</p>
<p>ম্যান অব দ্য ম্যাচ নির্বাচিত হয়েছেন অলরাউন্ড নৈপুণ্য প্রদর্শনকারী তরুণ তারকা ক্রিকেটার।</p>`,
    author_name: 'ক্রীড়া প্রতিবেদক',
    featured_image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
    image_caption: 'ট্রফি জয়ের পর উল্লাসরত টাইগার ক্রিকেট দল।',
    views: 2450,
    is_featured: false,
    is_breaking: true,
    status: 'published',
    published_at: '2026-08-30 12:00:00'
  },
  {
    id: 5,
    category_id: 6,
    category_name: 'বিনোদন',
    category_slug: 'entertainment',
    title: 'কান চলচ্চিত্র উৎসবে প্রশংসিত বাংলাদেশের নতুন স্বাধীন চলচ্চিত্র ‘মেঘের চিঠি’',
    slug: 'cannes-film-festival-bangladeshi-film-megher-chithi-praised',
    summary: 'আন্তর্জাতিক চলচ্চিত্র অঙ্গনে ফের উজ্জ্বল লাল-সবুজের পতাকা। উৎসবে দাঁড়িয়ে করতালি দিয়ে অভিনন্দন জানান বিশ্বচলচ্চিত্রের বোদ্ধারা।',
    content: `<p>ফ্রান্সের কান চলচ্চিত্র উৎসবের সমান্তরাল বিভাগে প্রদর্শিত হয়েছে বাংলাদেশের তরুণ নির্মাতার চলচ্চিত্র ‘মেঘের চিঠি’। গ্রামীণ জীবনের বাস্তব চিত্র এবং মানুষের অন্তর্নিহিত অনুভূতির গল্প দর্শকদের হৃদয় স্পর্শ করেছে।</p>`,
    author_name: 'বিনোদন ডেস্ক',
    featured_image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    views: 670,
    is_featured: false,
    is_breaking: false,
    status: 'published',
    published_at: '2026-08-30 07:30:00'
  },
  {
    id: 6,
    category_id: 7,
    category_name: 'তথ্যপ্রযুক্তি',
    category_slug: 'technology',
    title: 'বাংলা কৃত্রিম বুদ্ধিমত্তা (AI) ভাষা মডেলে যুগান্তকারী সাফল্য গবেষকদের',
    slug: 'bangla-ai-large-language-model-breakthrough-research',
    summary: 'বাংলাদেশের তরুণ সফটওয়্যার প্রকৌশলীরা উন্মুক্ত করলেন সর্ববৃহৎ বাংলা এলএলএম, যা সরকারি ও আইনি নথিপত্র নির্ভুল অনুবাদ ও সারসংক্ষেপ করতে সক্ষম।',
    content: `<p>বাংলা ভাষার ডিজিটাল রূপান্তরকে আরও এক ধাপ এগিয়ে নিতে স্থানীয় গবেষক দল উন্মুক্ত করেছেন আধুনিক বাংলা এআই মডেল। এই মডেলটি বিভিন্ন আঞ্চলিক ভাষার উচ্চারণ ও ব্যাকরণিক নির্ভুলতা বজায় রেখে কাজ করতে পারে।</p>`,
    author_name: 'প্রযুক্তি প্রতিবেদক',
    featured_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
    views: 920,
    is_featured: false,
    is_breaking: false,
    status: 'published',
    published_at: '2026-08-30 06:15:00'
  },
  {
    id: 7,
    category_id: 4,
    category_name: 'আন্তর্জাতিক',
    category_slug: 'international',
    title: 'জলবায়ু শীর্ষ সম্মেলনে উন্নয়নশীল দেশগুলোর জন্য নতুন ক্ষতিপূরণ তহবিল ঘোষণা',
    slug: 'cop-climate-summit-loss-and-damage-fund-announced',
    summary: 'বিশ্বের সবচেয়ে ঝুঁকিপূর্ণ উপকূলীয় দেশগুলোর ক্ষয়ক্ষতি মোকাবেলায় ১০০ বিলিয়ন ডলারের আন্তর্জাতিক জলবায়ু তহবিল অনুমোদন পেল।',
    content: `<p>বৈশ্বিক জলবায়ু সম্মেলনে দীর্ঘ আলোচনার পর অবশেষে উপকূলীয় দেশগুলোর পুনর্বাসন ও দুর্যোগ মোকাবেলায় বিশেষ তহবিল গঠন করা হয়েছে। বাংলাদেশ প্রতিনিধি দল এই সিদ্ধান্তকে ঐতিহাসিক বলে অভিহিত করেছে।</p>`,
    author_name: 'আন্তর্জাতিক ডেস্ক',
    featured_image: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&q=80',
    views: 540,
    is_featured: false,
    is_breaking: false,
    status: 'published',
    published_at: '2026-08-29 18:20:00'
  },
  {
    id: 8,
    category_id: 8,
    category_name: 'জীবনযাপন',
    category_slug: 'lifestyle',
    title: 'বৃষ্টির মৌসুমে সুস্বাস্থ্য রক্ষা: চিকিৎসকদের বিশেষ পরামর্শ ও রোগ প্রতিরোধে করণীয়',
    slug: 'rainy-season-health-tips-doctors-advice-prevention',
    summary: 'বর্ষাকালে পানিবাহিত ও ডেঙ্গুর প্রকোপ প্রতিরোধে বিশেষজ্ঞ চিকিৎসকদের স্বাস্থ্য বিষয়ক গুরুত্বপূর্ণ সতর্কতা ও খাদ্যাভ্যাস।',
    content: `<p>বর্ষা মৌসুমে সুস্থ থাকতে ফুটানো পানি পান করা, আশপাশের জমে থাকা পানি নিষ্কাশন এবং পুষ্টিকর ভিটামিন সি সমৃদ্ধ ফলমূল খাওয়ার পরামর্শ দিয়েছেন চিকিৎসকরা।</p>`,
    author_name: 'জীবনযাপন ডেস্ক',
    featured_image: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&q=80',
    views: 410,
    is_featured: false,
    is_breaking: false,
    status: 'published',
    published_at: '2026-08-29 14:10:00'
  }
];

export const INITIAL_EPAPER: Epaper = {
  id: 1,
  title: 'দৈনিক বার্তাচিত্র',
  edition_date: '2026-08-30',
  total_pages: 4,
  status: 'published',
  pages: [
    {
      id: 1,
      epaper_id: 1,
      page_number: 1,
      page_title: 'প্রথম পাতা (প্রধান সংবাদ)',
      image_url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80'
    },
    {
      id: 2,
      epaper_id: 1,
      page_number: 2,
      page_title: 'জাতীয় ও রাজনীতি',
      image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80'
    },
    {
      id: 3,
      epaper_id: 1,
      page_number: 3,
      page_title: 'অর্থনীতি ও আন্তর্জাতিক',
      image_url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80'
    },
    {
      id: 4,
      epaper_id: 1,
      page_number: 4,
      page_title: 'খেলাধুলা ও বিনোদন',
      image_url: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=1200&q=80'
    }
  ]
};

export const INITIAL_ADS: Advertisement[] = [
  {
    id: 1,
    title: 'জাতীয় ডিজিটাল মেলা বিজ্ঞাপন',
    position: 'header_top',
    image_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=150&fit=crop&q=80',
    target_url: 'https://bartachitro.com',
    status: 'active',
    views: 3200,
    clicks: 140
  },
  {
    id: 2,
    title: 'মিডল প্রমোশন ব্যানার',
    position: 'home_middle',
    image_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&h=150&fit=crop&q=80',
    target_url: 'https://bartachitro.com',
    status: 'active',
    views: 1800,
    clicks: 85
  },
  {
    id: 3,
    title: 'সাইডবার বিজ্ঞাপন ব্যানার',
    position: 'sidebar',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=500&fit=crop&q=80',
    target_url: 'https://bartachitro.com',
    status: 'active',
    views: 2100,
    clicks: 92
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  site_name: 'বার্তাচিত্র',
  site_tagline: 'সত্যের সংবাদ, সবার ভাষায়',
  editor_name: 'আহমেদ রফিক চৌধুরী',
  executive_editor: 'শাহনেওয়াজ করিম',
  email: 'editor@bartachitro.com',
  phone: '+৮৮০ ২ ৯৮৭৬৫৪৩',
  address: 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ',
  facebook_url: 'https://facebook.com',
  twitter_url: 'https://twitter.com',
  youtube_url: 'https://youtube.com',
  meta_description: 'বার্তাচিত্র - বাংলাদেশের অন্যতম জনপ্রিয় বাংলা অনলাইন সংবাদপত্র ও ডিজিটাল ই-পত্রিকা।',
  meta_keywords: 'বার্তাচিত্র, বাংলা সংবাদ, বাংলাদেশ, ই-পত্রিকা, ব্রেকিং নিউজ',
  disable_ads: false
};

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 1,
    name: 'তানভীর আহমেদ',
    email: 'tanveer@example.com',
    phone: '০১৭১১২২৩৩৪৪',
    subject: 'আইসিটি খবরের জন্য সাধুবাদ',
    message: 'আপনাদের তথ্যপ্রযুক্তি বিভাগের সংবাদগুলো অত্যন্ত তথ্যবহুল ও সময়োপযোগী। শুভকামনা রইল বার্তাচিত্র পরিবারের জন্য।',
    is_read: true,
    created_at: '2026-08-30 10:15:00'
  },
  {
    id: 2,
    name: 'ফারহানা ইয়াসমিন',
    email: 'farhana@example.com',
    phone: '০১৮১৮৯৯৮৮৭৭',
    subject: 'বিজ্ঞাপন রেট কার্ড সংক্রান্ত',
    message: 'আমরা একটি জাতীয় কর্পোরেট ক্যাম্পেইনের জন্য বার্তাচিত্র অনলাইন ও ই-পত্রিকার বিজ্ঞাপন রেট কার্ড জানতে আগ্রহী।',
    is_read: false,
    created_at: '2026-08-30 11:45:00'
  }
];
