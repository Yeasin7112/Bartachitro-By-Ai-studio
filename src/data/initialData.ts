import { Category, NewsArticle, Epaper, Advertisement, SiteSettings, ContactMessage, BlogPost, AdminUser } from '../types';

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

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    title: 'কৃত্রিম বুদ্ধিমত্তার বিপ্লব ও ভবিষ্যতের গণমাধ্যম: সত্যের অনুসন্ধানে সাংবাদিকতা কোন পথে?',
    slug: 'ai-revolution-and-future-of-journalism',
    summary: 'প্রযুক্তির অবিশ্বাস্য উৎকর্ষতায় অ্যালগরিদম যখন সংবাদ লিখছে, তখন মানবীয় সংবেদনশীলতা, অনুসন্ধানমূলক সততা এবং সাংবাদিকতার নৈতিক দায়বদ্ধতা কোথায় গিয়ে ঠেকবে?',
    content: `<p>গত দুই দশকে তথ্যপ্রযুক্তির অগ্রগতি সংবাদপত্র ও সাংবাদিকতার ধারণাকে একাধিকবার ভেঙে নতুন করে গড়েছে। তবে সম্প্রতি জেনারেটিভ আর্টিফিশিয়াল ইন্টেলিজেন্স বা এআই-এর যে প্রবল জোয়ার আমরা প্রত্যক্ষ করছি, তা অতীতের যেকোনো প্রযুক্তিগত পরিবর্তনকে ছাপিয়ে গেছে। এক ক্লিকের ব্যবধানে তৈরি হয়ে যাচ্ছে খবর, প্রতিবেদন, কিংবা নিবন্ধ।</p>
<p>প্রশ্ন হলো, এআই কি সত্যিই সংবাদের মাঠের একজন অভিজ্ঞ অনুসন্ধানী সাংবাদিকের বিকল্প হতে পারে? উত্তর খুব সহজ নয়। অ্যালগরিদম বিপুল পরিমাণ তথ্য নিমেষেই বিশ্লেষণ করতে পারে, ব্যাকরণগত নির্ভুলতায় প্রতিবেদন সাজাতে পারে। কিন্তু একটি শিশুর আর্তনাদ, দুর্গম চরাঞ্চলের কোনো অন্যায়ের পেছনের দীর্ঘশ্বাস কিংবা শাসকের ক্ষমতার অপব্যবহারের নেপথ্যের চোরাস্রোত বোঝার মানবিক প্রজ্ঞা কোনো কৃত্রিম মেধার নেই।</p>
<p>ভবিষ্যতের গণমাধ্যমকে টিকিয়ে রাখতে হলে প্রযুক্তিকে বর্জন নয়, বরং আলিঙ্গন করতে হবে নৈতিকতার পাহারা বসিয়ে। বার্তাচিত্রে আমরা বিশ্বাস করি, প্রযুক্তি হবে সংবাদকর্মীর শক্তিশালী হাতিয়ার—কিন্তু বিবেকের স্থানটি সর্বদা রক্ত-মাংসের মানুষেরই থাকবে। পাঠকও আজ সচেতন; তারা শুধু তথ্য চায় না, তথ্যের পেছনের সত্যাসত্য ও দায়বদ্ধতার অনুসন্ধান চায়।</p>`,
    author_name: 'ড. জামিলুর রহমান',
    author_role: 'প্রযুক্তি গবেষক ও কলামিস্ট',
    author_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    category_tag: 'প্রযুক্তি ও ভবিষ্যৎ',
    reading_time_min: 5,
    views: 1840,
    likes: 142,
    is_featured: true,
    status: 'published',
    published_at: '2026-08-28 10:30:00',
    tags: ['প্রযুক্তি', 'সাংবাদিকতা', 'কৃত্রিম বুদ্ধিমত্তা', 'মিডিয়া']
  },
  {
    id: 2,
    title: 'কংক্রিটের শহরে সবুজ ছোঁয়া: নাগরিক জীবনে মানসিক সুস্থতা ও ছাদবাগানের বিস্ময়',
    slug: 'urban-greenery-mental-wellness-rooftop-gardening',
    summary: 'যানজট ও ইট-পাথরের ধূসর নগরীতে এক চিলতে সবুজ কেবল চোখের তৃপ্তি নয়, নাগরিক বিষণ্নতা ও অবসাদ দূর করার সবচেয়ে শক্তিশালী প্রাকৃতিক মহৌষধ।',
    content: `<p>সকালের তীব্র হর্ন, ধোঁয়াশা আর দীর্ঘ যানজট—এই হলো আমাদের নাগরিক জীবনের প্রাত্যহিক বাস্তবতা। বহুতল ভবনের ব্যালকনি কিংবা ফাঁকা ছাদে যখন এক চিলতে কচি পাতা উঁকি দেয়, তখন যেন প্রাণহীন ধূসর শহরের মাঝেও একমুঠো তাজা নিশ্বাস জেগে ওঠে।</p>
<p>মনোবিজ্ঞানীদের মতে, মাটির সংস্পর্শে থাকা এবং উদ্ভিদের পরিচর্যা মানুষের মস্তিষ্কে ডোপামিন ও সেরোটোনিন ক্ষরণ বাড়ায়, যা মানসিক ক্লান্তি দূর করে গভীর প্রশান্তি এনে দেয়। আজকাল ঢাকার বিভিন্ন ছাদে শৌখিন ফলদ ও ভেষজ উদ্ভিদের যে উৎসব শুরু হয়েছে, তা কেবল শখ নয়—নাগরিক সভ্যতার এক নীরব আত্মরক্ষা।</p>
<p>এক পাত্র মাটিতে একটি মরিচ গাছ লাগানো কিংবা অপরাজিতার লতা বেয়ে উঠতে দেখা আমাদের শেখায় কীভাবে ছোট ছোট জিনিসের ভেতর আনন্দের বীজ লুকিয়ে থাকে। আপনার বারান্দায় আজই একটি টব বসিয়ে দেখুন, জীবনটা হঠাৎ করেই কিছুটা স্নিগ্ধ লাগবে।</p>`,
    author_name: 'সৈয়দা ফারহানা জেরিন',
    author_role: 'পরিবেশ ও জীবনধারা গবেষক',
    author_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=1200&q=80',
    category_tag: 'জীবনযাপন ও মনন',
    reading_time_min: 4,
    views: 1320,
    likes: 98,
    is_featured: false,
    status: 'published',
    published_at: '2026-08-29 16:20:00',
    tags: ['ছাদবাগান', 'জীবনযাপন', 'মানসিক স্বাস্থ্য', 'নগরজীবন']
  },
  {
    id: 3,
    title: 'ডিজিটাল পাঠাভ্যাস বনাম কাগজের বইয়ের নস্টালজিয়া: সাহিত্যের চিরন্তন আবেদন',
    slug: 'digital-reading-vs-paper-books-nostalgia-literature',
    summary: 'কিন্ডল, পিডিএফ আর স্মার্টফোনের স্ক্রিনে পাঠকরা যতই সময় কাটান না কেন, নতুন বইয়ের মলাট খোলার সৌরভ আর পাতায় আঙুল ছোঁয়ানোর অনুভূতি আজও অপূরণীয়।',
    content: `<p>আমরা এমন এক যুগে বাস করছি যেখানে শত শত বইয়ের একটি আস্ত লাইব্রেরি পকেটের ফোনে ধারণ করা যায়। ভ্রমণের পথে কিংবা অবসরে ইলেকট্রনিক বই পড়া নিঃসন্দেহেই সুবিধাজনক। কিন্তু তবুও কেন একুশে বইমেলায় লাখো মানুষ ধুলো আর ভিড় ঠেলে তাজা কালির গন্ধমাখা কাগজের বই বুক পকেটে জড়িয়ে ঘরে ফেরে?</p>
<p>কাগজের বই কেবল টেক্সট নয়, এটি একটি সামগ্রিক ইন্দ্রিয়গ্রাহ্য অভিজ্ঞতা। পাতার খসখস শব্দ, হলুদ হয়ে যাওয়া পাতার ইতিহাস, মার্জিনে পেন্সিল দিয়ে লিখে রাখা ভালোবাসার কথা—ডিজিটাল স্ক্রিন কখনোই এই আন্তরিক স্পর্শটুকু দিতে পারে না।</p>
<p>গবেষণায় দেখা গেছে, গভীর ও নিবিড় মনোযোগের ক্ষেত্রে প্রিন্টেড বই ডিজিটাল মাধ্যমের চেয়ে অনেক বেশি কার্যকর। স্ক্রিন আমাদের দ্রুত পড়ার বা স্কিমিং করার প্ররোচনা দেয়, আর কাগজের পাতা আমাদের থামতে বাধ্য করে, ভাবতে শেখায়। তাই প্রযুক্তি যতই বিকশিত হোক, বইয়ের পাতার চিরকালীন আবেদন চিরকাল অম্লান থাকবে।</p>`,
    author_name: 'হাসনাত আব্দুল্লাহ',
    author_role: 'সাহিত্য সমালোচক ও প্রাবন্ধিক',
    author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
    category_tag: 'সাহিত্য ও সংস্কৃতি',
    reading_time_min: 5,
    views: 950,
    likes: 85,
    is_featured: false,
    status: 'published',
    published_at: '2026-08-27 14:10:00',
    tags: ['সাহিত্য', 'বইপড়া', 'সংস্কৃতি', 'ভাবনা']
  },
  {
    id: 4,
    title: 'চতুর্থ শিল্পবিপ্লব ও তরুণ প্রজন্মের ক্যারিয়ার ভাবনা: কী শিখবেন, কোথায় দাঁড়াবেন?',
    slug: 'fourth-industrial-revolution-and-youth-career-readiness',
    summary: 'কেবল ডিগ্রি নয়, সমস্যা সমাধানের দক্ষতা, যোগাযোগ নৈপুণ্য এবং অভিযোজন ক্ষমতাই হবে একবিংশ শতাব্দীর কর্মবাজারে সবচেয়ে মূল্যবান মুদ্রা।',
    content: `<p>বিশ্বজুড়ে চাকরির বাজার এখন এক গভীর রূপান্তরের মধ্য দিয়ে যাচ্ছে। প্রচলিত অনেক পেশা বিলুপ্তির পথে, অন্যদিকে প্রতি বছর এমন সব পদের জন্ম হচ্ছে যা দশ বছর আগেও মানুষ কল্পনা করতে পারত না। ক্লাউড আর্কিটেক্ট, এআই প্রম্পট ইঞ্জিনিয়ার, ডেটা স্টোরিটেলার—এগুলো এখন বাস্তব পেশা।</p>
<p>বাংলাদেশের বিপুল তরুণ জনগোষ্ঠীর সামনে এটি এক বিরাট সম্ভাবনার জানালা। তবে সেজন্য আমাদের শিক্ষাব্যবস্থা ও ব্যক্তিগত মানসিকতার দ্রুত সংস্কার প্রয়োজন। শুধু সার্টিফিকেট নিয়ে চাকরির জন্য বসে থাকার দিন শেষ।</p>
<p>আজকের দিনে তিনটি বিষয় যেকোনো তরুণের জন্য অপরিহার্য: প্রথমত, প্রতিনিয়ত নতুন প্রযুক্তি শেখার কৌতূহল; দ্বিতীয়ত, মানুষের সাথে কার্যকর যোগাযোগের সফট স্কিল; এবং তৃতীয়ত, যেকোনো সংকটে দ্রুত সিদ্ধান্ত নেওয়ার সক্ষমতা। যারা নিজেদের নিয়মিত আপডেট করবেন, বিশ্ববাজার তাদের জন্যই উন্মুক্ত।</p>`,
    author_name: 'মেহজাবীন চৌধুরী',
    author_role: 'ক্যারিয়ার পরামর্শক ও উদ্যোক্তা',
    author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
    category_tag: 'ক্যারিয়ার ও শিক্ষা',
    reading_time_min: 4,
    views: 1610,
    likes: 120,
    is_featured: false,
    status: 'published',
    published_at: '2026-08-26 18:00:00',
    tags: ['ক্যারিয়ার', 'তরুণ প্রজন্ম', 'দক্ষতা', 'উদ্যোক্তা']
  },
  {
    id: 5,
    title: 'জলবায়ু পরিবর্তনের অভিঘাত ও বাংলাদেশের উপকূল: বাঁচার লড়াইয়ে লোকায়ত প্রতিরোধ',
    slug: 'climate-change-impact-and-bangladesh-coastal-resilience',
    summary: 'লবণাক্ত পানি যখন কৃষিজমি গ্রাস করছে, তখন সুন্দরবনের কোলঘেঁষা জনপদ কীভাবে নিজেদের উদ্ভাবনী শক্তিতে নতুন লড়াইয়ের ইতিহাস রচনা করছে।',
    content: `<p>বঙ্গোপসাগরের বুক চিরে ধেয়ে আসা প্রতিটি ঘূর্ণিঝড় আমাদের উপকূলবাসীকে নতুন করে পরীক্ষার মুখে ফেলে। তবে বারবার বিধ্বংসী আঘাত সত্ত্বেও তারা হার মানেননি। সাতক্ষীরা, খুলনা কিংবা ভোলার প্রান্তিক মানুষগুলোর বেঁচে থাকার এই লড়াই বিশ্ববাসীর জন্য জলবায়ু সহনশীলতার এক অনন্য পাঠশালা।</p>
<p>আজ উপকূলীয় এলাকায় ভাসমান কৃষিপদ্ধতি (ধাপ), লবণাক্ততা সহনশীল ধানের জাত এবং সৌরবিদ্যুৎচালিত বিশুদ্ধ পানির প্ল্যান্টের মাধ্যমে টিকে থাকার অভূতপূর্ব দৃষ্টান্ত তৈরি হয়েছে।</p>
<p>বার্তাচিত্রের বিশেষ সরেজমিন প্রতিবেদনে আমরা তুলে ধরতে চেয়েছি এই সংগ্রামী মানুষদের কথা। বৈশ্বিক কার্বন নির্গমনে বাংলাদেশের ভূমিকা নগণ্য হলেও ক্ষতির বোঝায় আমরাই শীর্ষে। বিশ্বমঞ্চে এই ক্ষতিপূরণের দাবি আরও জোরালো করার পাশাপাশি স্থানীয় উদ্ভাবনকে রাষ্ট্রীয় পৃষ্ঠপোষকতা দেওয়া এখন সময়ের অনিবার্য দাবি।</p>`,
    author_name: 'সাজ্জাদ হোসেন',
    author_role: 'পরিবেশ ও জলবায়ু অধিকারকর্মী',
    author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    cover_image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80',
    category_tag: 'পরিবেশ ও প্রকৃতি',
    reading_time_min: 5,
    views: 1190,
    likes: 94,
    is_featured: false,
    status: 'published',
    published_at: '2026-08-25 11:20:00',
    tags: ['জলবায়ু', 'পরিবেশ', 'উপকূল', 'বাংলাদেশ']
  }
];

export const INITIAL_USERS: AdminUser[] = [
  {
    id: 1,
    name: 'আহমেদ রফিক চৌধুরী',
    username: 'admin',
    email: 'admin@bartachitro.com',
    role: 'super_admin',
    role_title: 'প্রধান সম্পাদক ও প্রকাশক',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    created_at: '2026-01-01 10:00:00',
    last_login: '২০২৬-০৯-০৬ ১২:৩০',
    phone: '০১৭১১০০০০০০'
  },
  {
    id: 2,
    name: 'নাসরিন আক্তার',
    username: 'editor_nasrin',
    email: 'nasrin@bartachitro.com',
    role: 'editor',
    role_title: 'বার্তা সম্পাদক (News Editor)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    created_at: '2026-02-15 14:20:00',
    last_login: '২০২৬-০৯-০৫ ১৮:৪৫',
    phone: '০১৭২২১১১২২২'
  },
  {
    id: 3,
    name: 'তানভীর হাসান',
    username: 'mod_tanveer',
    email: 'tanveer@bartachitro.com',
    role: 'moderator',
    role_title: 'কমিউনিটি ও বার্তা মডারেটর',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'active',
    created_at: '2026-03-10 11:30:00',
    last_login: '২০২৬-০৯-০৪ ০৯:১৫',
    phone: '০১৭৩৩৩৩৪৪৫৫'
  }
];

