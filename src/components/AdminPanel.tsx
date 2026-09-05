import React, { useState } from 'react';
import { 
  LayoutDashboard, FileText, PlusCircle, FolderTree, Zap, 
  Image, Sliders, Mail, User, LogOut, ExternalLink, 
  Trash2, Edit, Check, AlertCircle, Eye, Newspaper, ArrowLeft,
  Search, X
} from 'lucide-react';
import { 
  NewsArticle, Category, Advertisement, Epaper, 
  SiteSettings, ContactMessage 
} from '../types';
import { bnNum, bnDate } from '../utils/bengaliHelpers';
import { ImageUploader } from './ImageUploader';

interface AdminPanelProps {
  newsList: NewsArticle[];
  categories: Category[];
  ads: Advertisement[];
  epaper: Epaper;
  settings: SiteSettings;
  messages: ContactMessage[];
  onAddNews: (news: NewsArticle) => void;
  onUpdateNews: (news: NewsArticle) => void;
  onDeleteNews: (id: number) => void;
  onAddCategory: (cat: Category) => void;
  onUpdateCategory: (cat: Category) => void;
  onDeleteCategory: (id: number) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onCloseAdmin: () => void;
  onMarkMessageRead: (id: number) => void;
  onDeleteMessage: (id: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  newsList,
  categories,
  ads,
  epaper,
  settings,
  messages,
  onAddNews,
  onUpdateNews,
  onDeleteNews,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateSettings,
  onCloseAdmin,
  onMarkMessageRead,
  onDeleteMessage
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'add_news' | 'categories' | 'breaking' | 'ads' | 'messages' | 'settings'>('dashboard');

  // Form states for Add News
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<number>(categories[0]?.id || 1);
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('বার্তাচিত্র প্রতিবেদক');
  const [newsImage, setNewsImage] = useState('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80');
  const [newsIsFeatured, setNewsIsFeatured] = useState(false);
  const [newsIsBreaking, setNewsIsBreaking] = useState(false);
  const [newsStatus, setNewsStatus] = useState<'published' | 'draft'>('published');
  const [feedback, setFeedback] = useState('');

  // News list search & filtering
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('all');

  // Old News Editing Form States
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editNewsTitle, setEditNewsTitle] = useState('');
  const [editNewsCategory, setEditNewsCategory] = useState<number>(1);
  const [editNewsSummary, setEditNewsSummary] = useState('');
  const [editNewsContent, setEditNewsContent] = useState('');
  const [editNewsAuthor, setEditNewsAuthor] = useState('');
  const [editNewsImage, setEditNewsImage] = useState('');
  const [editNewsIsFeatured, setEditNewsIsFeatured] = useState(false);
  const [editNewsIsBreaking, setEditNewsIsBreaking] = useState(false);
  const [editNewsStatus, setEditNewsStatus] = useState<'published' | 'draft'>('published');
  const [editNewsPublishedAt, setEditNewsPublishedAt] = useState('');
  const [editNewsViews, setEditNewsViews] = useState<number>(0);

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Category Editing Form State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatSlug, setEditCatSlug] = useState('');
  const [editCatOrder, setEditCatOrder] = useState<number>(1);

  // Settings form state
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);

  // Stats calculation
  const totalNews = newsList.length;
  const publishedNews = newsList.filter(n => n.status === 'published').length;
  const breakingNewsCount = newsList.filter(n => n.is_breaking).length;
  const totalViews = newsList.reduce((acc, curr) => acc + curr.views, 0);
  const unreadMessages = messages.filter(m => !m.is_read).length;

  // Handlers for News Editing
  const handleStartEditNews = (article: NewsArticle) => {
    setEditingNews(article);
    setEditNewsTitle(article.title);
    setEditNewsCategory(article.category_id);
    setEditNewsSummary(article.summary || '');
    // Clean paragraph tags for clear, natural editing in textarea
    const cleanContent = article.content
      .replace(/^<p>/i, '')
      .replace(/<\/p>$/i, '')
      .replace(/<\/p>\s*<p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n');
    setEditNewsContent(cleanContent);
    setEditNewsAuthor(article.author_name || 'বার্তাচিত্র প্রতিবেদক');
    setEditNewsImage(article.featured_image || '');
    setEditNewsIsFeatured(!!article.is_featured);
    setEditNewsIsBreaking(!!article.is_breaking);
    setEditNewsStatus(article.status || 'published');
    setEditNewsPublishedAt(article.published_at || '');
    setEditNewsViews(article.views || 0);
  };

  const handleSaveEditNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews || !editNewsTitle.trim() || !editNewsContent.trim()) return;

    const catObj = categories.find(c => c.id === Number(editNewsCategory));
    
    // Format paragraph structure
    let formattedContent = editNewsContent.trim();
    if (!formattedContent.startsWith('<')) {
      const paragraphs = formattedContent
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      formattedContent = paragraphs.length > 0 
        ? paragraphs.map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
        : `<p>${formattedContent}</p>`;
    }

    const updatedArticle: NewsArticle = {
      ...editingNews,
      title: editNewsTitle.trim(),
      category_id: Number(editNewsCategory),
      category_name: catObj?.name || editingNews.category_name,
      category_slug: catObj?.slug || editingNews.category_slug,
      summary: editNewsSummary.trim() || editNewsTitle.slice(0, 80),
      content: formattedContent,
      author_name: editNewsAuthor.trim() || 'বার্তাচিত্র প্রতিবেদক',
      featured_image: editNewsImage.trim() || editingNews.featured_image,
      is_featured: editNewsIsFeatured,
      is_breaking: editNewsIsBreaking,
      status: editNewsStatus,
      published_at: editNewsPublishedAt.trim() || editingNews.published_at,
      views: Number(editNewsViews) >= 0 ? Number(editNewsViews) : editingNews.views
    };

    onUpdateNews(updatedArticle);
    setFeedback(`"${updatedArticle.title.slice(0, 24)}..." সংবাদটি সফলভাবে আপডেট করা হয়েছে!`);
    setEditingNews(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleCancelEditNews = () => {
    setEditingNews(null);
  };

  // Handlers for Category Editing
  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatSlug(cat.slug);
    setEditCatOrder(cat.display_order || 1);
  };

  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim() || !editCatSlug.trim()) return;

    const updatedCat: Category = {
      ...editingCategory,
      name: editCatName.trim(),
      slug: editCatSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      display_order: Number(editCatOrder) || 1
    };

    onUpdateCategory(updatedCat);
    setFeedback(`"${updatedCat.name}" ক্যাটাগরিটি সফলভাবে হালনাগাদ করা হয়েছে!`);
    setEditingCategory(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
  };

  // Filtered news list for the News List management table
  const filteredNewsList = newsList.filter((n) => {
    const query = newsSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      n.title.toLowerCase().includes(query) ||
      n.author_name.toLowerCase().includes(query) ||
      n.category_name.toLowerCase().includes(query) ||
      n.summary.toLowerCase().includes(query);

    const matchesCategory = newsCategoryFilter === 'all' || n.category_id === Number(newsCategoryFilter);

    return matchesSearch && matchesCategory;
  });

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    const catObj = categories.find(c => c.id === Number(newsCategory));
    const newArticle: NewsArticle = {
      id: Date.now(),
      title: newsTitle.trim(),
      slug: newsTitle.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 50),
      category_id: Number(newsCategory),
      category_name: catObj?.name || 'জাতীয়',
      category_slug: catObj?.slug || 'national',
      summary: newsSummary.trim() || newsTitle.slice(0, 80),
      content: `<p>${newsContent.trim()}</p>`,
      author_name: newsAuthor.trim() || 'নিজস্ব প্রতিবেদক',
      featured_image: newsImage.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      views: 1,
      is_featured: newsIsFeatured,
      is_breaking: newsIsBreaking,
      status: newsStatus,
      published_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    onAddNews(newArticle);
    setFeedback('সংবাদটি সফলভাবে ডাটাবেজে সংরক্ষণ ও প্রকাশিত হয়েছে!');
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
    setTimeout(() => {
      setFeedback('');
      setActiveTab('news');
    }, 1500);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    onAddCategory({
      id: Date.now(),
      name: newCatName.trim(),
      slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      display_order: categories.length + 1,
      status: 'active'
    });
    setNewCatName('');
    setNewCatSlug('');
    setFeedback('নতুন ক্যাটাগরি যুক্ত করা হয়েছে!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setFeedback('সাইট সেটিংস সফলভাবে আপডেট হয়েছে!');
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-bengali-body">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header Branding */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider block">বার্তাচিত্র সিএমএস</span>
              <h2 className="text-xl font-bold text-white font-bengali-display">অ্যাডমিন প্যানেল</h2>
            </div>
            <button 
              onClick={onCloseAdmin}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              title="ওয়েবসাইটে ফিরুন"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
            </button>

            <button
              onClick={() => setActiveTab('news')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'news' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" /> সংবাদ তালিকা
              </span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">{bnNum(totalNews)}</span>
            </button>

            <button
              onClick={() => setActiveTab('add_news')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'add_news' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> নতুন সংবাদ প্রকাশ
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'categories' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4" /> ক্যাটাগরি ব্যবস্থাপনা
            </button>

            <button
              onClick={() => setActiveTab('breaking')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'breaking' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Zap className="w-4 h-4" /> ব্রেকিং নিউজ
              </span>
              {breakingNewsCount > 0 && (
                <span className="bg-red-900 text-red-200 px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                  {bnNum(breakingNewsCount)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'ads' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" /> বিজ্ঞাপন ব্যবস্থাপনা
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'messages' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" /> বার্তা ইনবক্স
              </span>
              {unreadMessages > 0 && (
                <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {bnNum(unreadMessages)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" /> সাইট সেটিংস
            </button>
          </nav>
        </div>

        {/* User Info & Back Button */}
        <div className="border-t border-slate-800 pt-4 mt-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-xs">
              আ
            </div>
            <div>
              <p className="text-xs font-bold text-white">অ্যাডমিন (Editor)</p>
              <p className="text-[10px] text-slate-400">admin@bartachitro.com</p>
            </div>
          </div>
          <button 
            onClick={onCloseAdmin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> মূল সাইট দেখুন
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-emerald-900/80 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm shadow-md animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-black text-white font-bengali-display">ড্যাশবোর্ড ওভারভিউ</h1>
                <p className="text-xs text-slate-400 mt-0.5">বার্তাচিত্র অনলাইন নিউজপেপার ও ই-পত্রিকা কন্ট্রোল প্যানেল।</p>
              </div>
              <button 
                onClick={() => setActiveTab('add_news')}
                className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow"
              >
                <PlusCircle className="w-4 h-4" /> নতুন সংবাদ
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">মোট সংবাদ</span>
                <p className="text-3xl font-black text-white">{bnNum(totalNews)}</p>
                <span className="text-[11px] text-emerald-400 mt-1 block">প্রকাশিত: {bnNum(publishedNews)}</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">ব্রেকিং নিউজ</span>
                <p className="text-3xl font-black text-red-400">{bnNum(breakingNewsCount)}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">টিকারে চলমান</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">মোট পাঠক ভিউ</span>
                <p className="text-3xl font-black text-amber-400">{bnNum(totalViews)}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">অনলাইন ভিজিট</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                <span className="text-xs text-slate-400 block mb-1">ক্যাটাগরি</span>
                <p className="text-3xl font-black text-cyan-400">{bnNum(categories.length)}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">সক্রিয় বিভাগ</span>
              </div>
            </div>

            {/* Recent News Table */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-base font-bold text-white font-bengali-display">সম্প্রতি প্রকাশিত সংবাদসমূহ</h3>
                <button 
                  onClick={() => setActiveTab('news')}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  সবগুলো দেখুন →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">শিরোনাম</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">লেখক</th>
                      <th className="p-3">ভিউ</th>
                      <th className="p-3">তারিখ</th>
                      <th className="p-3">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-200">
                    {newsList.slice(0, 5).map((n) => (
                      <tr key={n.id} className="hover:bg-slate-700/50">
                        <td className="p-3 font-semibold max-w-xs truncate">{n.title}</td>
                        <td className="p-3 text-red-400 font-bold">{n.category_name}</td>
                        <td className="p-3 text-slate-400">{n.author_name}</td>
                        <td className="p-3 text-amber-400">{bnNum(n.views)}</td>
                        <td className="p-3 text-slate-400">{bnDate(n.published_at, false)}</td>
                        <td className="p-3">
                          <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px]">
                            {n.status === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEWS LIST */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-white font-bengali-display">সকল সংবাদ ব্যবস্থাপনা</h1>
                <p className="text-xs text-slate-400">
                  মোট {bnNum(totalNews)}টি সংবাদের মধ্যে {bnNum(filteredNewsList.length)}টি প্রদর্শিত হচ্ছে।
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('add_news')}
                className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow shrink-0"
              >
                <PlusCircle className="w-4 h-4" /> নতুন সংবাদ প্রকাশ
              </button>
            </div>

            {/* Search and Category Filter Controls for Old News */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  placeholder="পুরনো সংবাদ খুঁজুন (শিরোনাম, প্রতিবেদক, বিবরণ)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                {newsSearchQuery && (
                  <button 
                    onClick={() => setNewsSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    title="মুছুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 whitespace-nowrap">বিভাগ:</span>
                <select
                  value={newsCategoryFilter}
                  onChange={(e) => setNewsCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="all">সকল বিভাগ ({bnNum(totalNews)})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({bnNum(newsList.filter(n => n.category_id === c.id).length)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">ছবি</th>
                      <th className="p-3">শিরোনাম</th>
                      <th className="p-3">ক্যাটাগরি</th>
                      <th className="p-3">ভিউ</th>
                      <th className="p-3">ব্রেকিং</th>
                      <th className="p-3">লিড স্টোরি</th>
                      <th className="p-3">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 text-slate-200">
                    {filteredNewsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          কোনো সংবাদ খুঁজে পাওয়া যায়নি।
                        </td>
                      </tr>
                    ) : (
                      filteredNewsList.map((n) => (
                        <tr key={n.id} className="hover:bg-slate-700/50">
                          <td className="p-3">
                            <img src={n.featured_image} alt="" className="w-12 h-9 object-cover rounded" />
                          </td>
                          <td className="p-3 font-semibold max-w-sm">
                            <p className="line-clamp-2">{n.title}</p>
                            <span className="text-[10px] text-slate-400">{n.author_name} • {bnDate(n.published_at, false)}</span>
                          </td>
                          <td className="p-3 text-red-400 font-bold">{n.category_name}</td>
                          <td className="p-3 text-amber-400">{bnNum(n.views)}</td>
                          <td className="p-3">
                            <button
                              onClick={() => onUpdateNews({ ...n, is_breaking: !n.is_breaking })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                n.is_breaking ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {n.is_breaking ? 'হ্যাঁ' : 'না'}
                            </button>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => onUpdateNews({ ...n, is_featured: !n.is_featured })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                n.is_featured ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {n.is_featured ? 'লিড' : 'না'}
                            </button>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartEditNews(n)}
                                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="সংবাদ সম্পাদনা করুন"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>এডিট</span>
                              </button>
                              <button
                                onClick={() => onDeleteNews(n.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-700 cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADD NEW NEWS */}
        {activeTab === 'add_news' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white font-bengali-display">নতুন সংবাদ প্রকাশ করুন</h1>
              <p className="text-xs text-slate-400">ওয়েবসাইটে তাৎক্ষণিক সংবাদ প্রকাশ ও ফরম্যাটিং ফর্ম।</p>
            </div>

            <form onSubmit={handleCreateNews} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">সংবাদের শিরোনাম *</label>
                <input 
                  type="text" 
                  required
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="যেমন: দেশে ডিজিটাল অর্থনীতির নতুন যুগে প্রবেশ..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">বিভাগ / ক্যাটাগরি *</label>
                  <select 
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রতিবেদক / রিপোর্টার</label>
                  <input 
                    type="text" 
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">সংক্ষেপ / সাব-হেডলাইন</label>
                <textarea 
                  rows={2}
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  placeholder="সংবাদের মূল সারসংক্ষেপ..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">মূল সংবাদের বিবরণ *</label>
                <textarea 
                  rows={6}
                  required
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="বিস্তারিত সংবাদ লিখুন..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 font-bengali-body"
                />
              </div>

              <ImageUploader
                currentImage={newsImage}
                onImageChange={(url) => setNewsImage(url)}
                label="ফিচার্ড ছবি নির্বাচন বা আপলোড (Featured Image) *"
                helperText="কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন অথবা সরাসরি ইমেজ ইউআরএল পেস্ট করুন"
              />

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newsIsFeatured}
                    onChange={(e) => setNewsIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0"
                  />
                  <span>প্রধান লিড সংবাদ (Lead Story) হিসেবে চিহ্নিত করুন</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={newsIsBreaking}
                    onChange={(e) => setNewsIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0"
                  />
                  <span>ব্রেকিং নিউজ টিকারে যুক্ত করুন</span>
                </label>
              </div>

              <button 
                type="submit"
                className="bg-red-700 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer shadow"
              >
                <Check className="w-4 h-4" /> সংবাদটি এখনই প্রকাশ করুন
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
              <h3 className="text-base font-bold text-white font-bengali-display mb-4">নতুন ক্যাটাগরি তৈরি</h3>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ক্যাটাগরির নাম (বাংলা) *</label>
                  <input 
                    type="text" 
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="যেমন: বিজ্ঞান"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">স্লাগ (Slug / English) *</label>
                  <input 
                    type="text" 
                    required
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="যেমন: science"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer"
                >
                  ক্যাটাগরি যুক্ত করুন
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700 font-bold text-sm">
                বিদ্যমান ক্যাটাগরিসমূহ ({bnNum(categories.length)})
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">নাম</th>
                    <th className="p-3">স্লাগ</th>
                    <th className="p-3">সংবাদ সংখ্যা</th>
                    <th className="p-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-200">
                  {categories.map((c) => {
                    const count = newsList.filter(n => n.category_id === c.id).length;
                    return (
                      <tr key={c.id}>
                        <td className="p-3 font-bold text-white">{c.name}</td>
                        <td className="p-3 text-slate-400"><code>{c.slug}</code></td>
                        <td className="p-3 text-amber-400 font-bold">{bnNum(count)}টি</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleStartEditCategory(c)}
                              className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="ক্যাটাগরি সম্পাদনা করুন"
                            >
                              <Edit className="w-3 h-3" />
                              <span>এডিট</span>
                            </button>
                            <button 
                              onClick={() => onDeleteCategory(c.id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-700 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BREAKING NEWS */}
        {activeTab === 'breaking' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white font-bengali-display">ব্রেকিং নিউজ টিকার কন্ট্রোল</h1>
              <p className="text-xs text-slate-400">হেডলাইনের নিচে চলমান লাল ব্যানার টিকারের সংবাদ নিয়ন্ত্রণ করুন।</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">সংবাদ শিরোনাম</th>
                    <th className="p-3">ক্যাটাগরি</th>
                    <th className="p-3">ব্রেকিং স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-200">
                  {newsList.map((n) => (
                    <tr key={n.id}>
                      <td className="p-3 font-semibold">{n.title}</td>
                      <td className="p-3 text-red-400 font-bold">{n.category_name}</td>
                      <td className="p-3">
                        <button
                          onClick={() => onUpdateNews({ ...n, is_breaking: !n.is_breaking })}
                          className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            n.is_breaking ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {n.is_breaking ? 'টিকারে চলছে' : 'বন্ধ'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ADS */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white font-bengali-display">বিজ্ঞাপন ব্যানার ব্যবস্থাপনা</h1>
              <p className="text-xs text-slate-400">ওয়েবসাইটের বিভিন্ন স্লটের বিজ্ঞাপন ও ব্যানার প্রদর্শন নিয়ন্ত্রণ।</p>
            </div>

            {/* Global Ads Disable / Enable Master Toggle */}
            <div className={`p-5 rounded-xl border transition-all ${
              localSettings.disable_ads
                ? 'bg-amber-950/40 border-amber-500/50'
                : 'bg-emerald-950/30 border-emerald-500/40'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${localSettings.disable_ads ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                    <h3 className="text-base font-bold text-white">
                      পুরো ওয়েবসাইটে বিজ্ঞাপন নিয়ন্ত্রণ (Global Ads Master Toggle)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {localSettings.disable_ads
                      ? 'বর্তমান অবস্থা: পুরো ওয়েবসাইটে বিজ্ঞাপন, ব্যানার এবং সংশ্লিষ্ট কোনো টেক্সট প্রদর্শিত হচ্ছে না (Disabled)।'
                      : 'বর্তমান অবস্থা: পুরো ওয়েবসাইটে বিজ্ঞাপন ও ব্যানার স্বাভাবিকভাবে প্রদর্শিত হচ্ছে (Active)।'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...localSettings, disable_ads: !localSettings.disable_ads };
                    setLocalSettings(updated);
                    onUpdateSettings(updated);
                    setFeedback(updated.disable_ads ? 'পুরো ওয়েবসাইটে বিজ্ঞাপন সফলভাবে বন্ধ করা হয়েছে!' : 'পুরো ওয়েবসাইটে বিজ্ঞাপন চালু করা হয়েছে!');
                    setTimeout(() => setFeedback(''), 4000);
                  }}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow flex items-center justify-center gap-2 shrink-0 ${
                    localSettings.disable_ads
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-red-700 hover:bg-red-600 text-white'
                  }`}
                >
                  {localSettings.disable_ads ? 'বিজ্ঞাপন চালু করুন (Turn ON Ads)' : 'বিজ্ঞাপন বন্ধ করুন (Turn OFF All Ads)'}
                </button>
              </div>
            </div>

            {localSettings.disable_ads && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>বিজ্ঞাপন বন্ধ অপশন সক্রিয় থাকায় ওয়েবসাইটের কোনো পেজে (হোমপেজ, আর্টিকেল, সাইডবার ইত্যাদি) কোনো বিজ্ঞাপন ও বিজ্ঞাপন টেক্সট প্রদর্শিত হবে না।</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ads.map((ad) => (
                <div key={ad.id} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">
                      স্লট: {ad.position}
                    </span>
                    <h4 className="font-bold text-sm text-white mb-3">{ad.title}</h4>
                    <img src={ad.image_url} alt="" className="w-full h-24 object-cover rounded mb-3" />
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700">
                    <span>ভিউ: {bnNum(ad.views)}</span>
                    <span className={localSettings.disable_ads ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {localSettings.disable_ads ? 'স্থগিত (Global Off)' : 'সক্রিয়'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white font-bengali-display">পাঠকদের বার্তা ইনবক্স</h1>
              <p className="text-xs text-slate-400">যোগাযোগ ফরমের মাধ্যমে পাঠকদের পাঠানো সকল বার্তা।</p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">প্রেরক</th>
                    <th className="p-3">বিষয় ও বার্তা</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3">স্ট্যাটাস</th>
                    <th className="p-3">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-200">
                  {messages.map((m) => (
                    <tr key={m.id} className={!m.is_read ? 'bg-red-950/20' : ''}>
                      <td className="p-3">
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.email}</p>
                      </td>
                      <td className="p-3 max-w-sm">
                        <p className="font-bold text-red-300">{m.subject}</p>
                        <p className="text-slate-300 mt-1">{m.message}</p>
                      </td>
                      <td className="p-3 text-slate-400">{bnDate(m.created_at, false)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.is_read ? 'bg-slate-700 text-slate-400' : 'bg-red-900 text-red-200'
                        }`}>
                          {m.is_read ? 'পঠিত' : 'নতুন'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {!m.is_read && (
                            <button
                              onClick={() => onMarkMessageRead(m.id)}
                              className="text-emerald-400 hover:text-emerald-300 p-1 rounded hover:bg-slate-700 cursor-pointer"
                              title="পঠিত হিসেবে মার্ক করুন"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteMessage(m.id)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-700 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white font-bengali-display">সাইট সেটিংস</h1>
              <p className="text-xs text-slate-400">পত্রিকার নাম, স্লোগান, সম্পাদক ও অফিসের ঠিকানা পরিবর্তন।</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">পত্রিকার নাম</label>
                  <input 
                    type="text" 
                    value={localSettings.site_name}
                    onChange={(e) => setLocalSettings({ ...localSettings, site_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">স্লোগান</label>
                  <input 
                    type="text" 
                    value={localSettings.site_tagline}
                    onChange={(e) => setLocalSettings({ ...localSettings, site_tagline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">প্রধান সম্পাদক</label>
                  <input 
                    type="text" 
                    value={localSettings.editor_name}
                    onChange={(e) => setLocalSettings({ ...localSettings, editor_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">নির্বাহী সম্পাদক</label>
                  <input 
                    type="text" 
                    value={localSettings.executive_editor}
                    onChange={(e) => setLocalSettings({ ...localSettings, executive_editor: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">অফিসিয়াল ঠিকানা</label>
                <textarea 
                  rows={2}
                  value={localSettings.address}
                  onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Ads Toggle in Settings */}
              <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={!!localSettings.disable_ads}
                    onChange={(e) => setLocalSettings({ ...localSettings, disable_ads: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      পুরো ওয়েবসাইটে বিজ্ঞাপন বন্ধ রাখুন (Disable all ads & banners)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      এটি চালু থাকলে পুরো ওয়েবসাইটে কোনো বিজ্ঞাপন ব্যানার বা বিজ্ঞাপনের টেক্সট দৃশ্যমান হবে না।
                    </span>
                  </div>
                </label>
              </div>

              <button 
                type="submit"
                className="bg-red-700 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded text-xs transition-colors cursor-pointer shadow"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </form>
          </div>
        )}
      </main>

      {/* CATEGORY EDIT MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white font-bengali-display">ক্যাটাগরি সম্পাদনা</h3>
                <p className="text-xs text-slate-400">ক্যাটাগরির নাম ও স্লাগ পরিবর্তন করুন</p>
              </div>
              <button 
                onClick={handleCancelEditCategory}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                title="বাতিল"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ক্যাটাগরির বাংলা নাম *</label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  placeholder="যেমন: জাতীয়, রাজনীতি, খেলা..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ইংরেজি স্লাগ (Slug) *</label>
                <input
                  type="text"
                  required
                  value={editCatSlug}
                  onChange={(e) => setEditCatSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-mono text-xs"
                  placeholder="যেমন: national, politics, sports..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রদর্শন ক্রম (Order)</label>
                <input
                  type="number"
                  min="1"
                  value={editCatOrder}
                  onChange={(e) => setEditCatOrder(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelEditCategory}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-colors"
                >
                  <Check className="w-4 h-4" /> সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OLD NEWS EDIT MODAL */}
      {editingNews && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
              <div>
                <h3 className="text-lg font-black text-white font-bengali-display flex items-center gap-2">
                  <Edit className="w-5 h-5 text-amber-400" /> পুরনো সংবাদ সম্পাদনা
                </h3>
                <p className="text-xs text-slate-400">
                  সংবাদ আইডি: #{editingNews.id} • বিভাগ: <span className="text-red-400 font-bold">{editingNews.category_name}</span>
                </p>
              </div>
              <button
                onClick={handleCancelEditNews}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Form */}
            <form onSubmit={handleSaveEditNews} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">সংবাদের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={editNewsTitle}
                  onChange={(e) => setEditNewsTitle(e.target.value)}
                  placeholder="সংবাদের আকর্ষণীয় ও মূল শিরোনাম লিখুন..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">বিভাগ / ক্যাটাগরি *</label>
                  <select
                    value={editNewsCategory}
                    onChange={(e) => setEditNewsCategory(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রতিবেদকের নাম</label>
                  <input
                    type="text"
                    value={editNewsAuthor}
                    onChange={(e) => setEditNewsAuthor(e.target.value)}
                    placeholder="যেমন: নিজস্ব প্রতিবেদক..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">ভিউ সংখ্যা (Views)</label>
                  <input
                    type="number"
                    min="0"
                    value={editNewsViews}
                    onChange={(e) => setEditNewsViews(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">সংক্ষেপ বা সাব-হেডলাইন (Summary)</label>
                <textarea
                  rows={2}
                  value={editNewsSummary}
                  onChange={(e) => setEditNewsSummary(e.target.value)}
                  placeholder="সংবাদের মূল সারসংক্ষেপ বা আকর্ষণীয় অংশ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">মূল সংবাদ বিবরণ (Detailed Content) *</label>
                  <span className="text-[10px] text-slate-400">একাধিক প্যারাগ্রাফের জন্য খালি লাইন (Enter) ব্যবহার করুন</span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={editNewsContent}
                  onChange={(e) => setEditNewsContent(e.target.value)}
                  placeholder="সম্পূর্ণ সংবাদের বিস্তারিত বিবরণ লিখুন..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-bengali-body leading-relaxed"
                />
              </div>

              {/* Image Uploader for News */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-300">সংবাদের ছবি (Featured Image)</label>
                <ImageUploader 
                  currentImage={editNewsImage}
                  onImageSelected={(url) => setEditNewsImage(url)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রকাশের সময় ও তারিখ</label>
                  <input
                    type="text"
                    value={editNewsPublishedAt}
                    onChange={(e) => setEditNewsPublishedAt(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রকাশনা অবস্থা (Status)</label>
                  <select
                    value={editNewsStatus}
                    onChange={(e) => setEditNewsStatus(e.target.value as 'published' | 'draft')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="published">সরাসরি প্রকাশিত (Published)</option>
                    <option value="draft">ড্রাফট হিসেবে সংরক্ষণ (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editNewsIsBreaking}
                    onChange={(e) => setEditNewsIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-red-400">ব্রেকিং নিউজ হেডলাইন হিসেবে দেখান</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editNewsIsFeatured}
                    onChange={(e) => setEditNewsIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-400">মূল পাতার লিড বা বিশেষ সংবাদ হিসেবে রাখুন</span>
                </label>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelEditNews}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-red-700 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer shadow transition-colors"
                >
                  <Check className="w-4 h-4" /> হালনাগাদ ও সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
