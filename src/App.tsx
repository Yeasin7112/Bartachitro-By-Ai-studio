import React, { useState } from 'react';
import { 
  INITIAL_CATEGORIES, INITIAL_NEWS, INITIAL_ADS, 
  INITIAL_EPAPER, INITIAL_SETTINGS, INITIAL_MESSAGES,
  INITIAL_BLOGS, INITIAL_USERS
} from './data/initialData';
import { NewsArticle, Category, SiteSettings, ContactMessage, BlogPost, AdminUser } from './types';
import { BackupData } from './utils/zipExporter';
import { Header } from './components/Header';
import { BreakingNews } from './components/BreakingNews';
import { LeadHero } from './components/LeadHero';
import { LatestGrid } from './components/LatestGrid';
import { CategoryBlock } from './components/CategoryBlock';
import { ArticleView } from './components/ArticleView';
import { CategoryView } from './components/CategoryView';
import { EpaperView } from './components/EpaperView';
import { SearchView } from './components/SearchView';
import { ArchiveView } from './components/ArchiveView';
import { ContactView } from './components/ContactView';
import { AboutView } from './components/AboutView';
import { BlogView } from './components/BlogView';
import { HomeBlogSection } from './components/HomeBlogSection';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { downloadPhpProjectZip } from './utils/zipExporter';
import { Newspaper } from 'lucide-react';

export default function App() {
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [ads] = useState(INITIAL_ADS);
  const [epaper] = useState(INITIAL_EPAPER);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);

  // View state
  const [currentView, setCurrentView] = useState<
    'home' | 'article' | 'category' | 'epaper' | 'search' | 'archive' | 'contact' | 'about' | 'admin' | 'blog'
  >('home');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArticle = (article: NewsArticle) => {
    // Increment view count
    setNewsList(prev => prev.map(n => n.id === article.id ? { ...n, views: n.views + 1 } : n));
    setSelectedArticle(article);
    setCurrentView('article');
    scrollToTop();
  };

  const handleSelectCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    setCurrentView('category');
    scrollToTop();
  };

  const handleNavigateHome = () => {
    setActiveCategorySlug('home');
    setSelectedArticle(null);
    setCurrentView('home');
    scrollToTop();
  };

  const handleNavigateEpaper = () => {
    setCurrentView('epaper');
    scrollToTop();
  };

  const handleNavigateSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView('search');
    scrollToTop();
  };

  const handleNavigateArchive = () => {
    setCurrentView('archive');
    scrollToTop();
  };

  const handleNavigateContact = () => {
    setCurrentView('contact');
    scrollToTop();
  };

  const handleNavigateAbout = () => {
    setCurrentView('about');
    scrollToTop();
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    scrollToTop();
  };

  const handleCloseAdmin = () => {
    setCurrentView('home');
    scrollToTop();
  };

  const handleDownloadZip = async () => {
    await downloadPhpProjectZip();
  };

  // Blog Handlers
  const handleNavigateBlog = () => {
    setSelectedBlog(null);
    setCurrentView('blog');
    scrollToTop();
  };

  const handleOpenBlog = (blog: BlogPost) => {
    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, views: b.views + 1 } : b));
    setSelectedBlog(blog);
    setCurrentView('blog');
    scrollToTop();
  };

  const handleLikeBlog = (id: number) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
  };

  const handleAddBlog = (newBlog: BlogPost) => {
    setBlogs(prev => [newBlog, ...prev]);
  };

  const handleUpdateBlog = (updated: BlogPost) => {
    setBlogs(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const handleDeleteBlog = (id: number) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  // CRUD Handlers for Admin
  const handleAddNews = (newArticle: NewsArticle) => {
    setNewsList(prev => [newArticle, ...prev]);
  };

  const handleUpdateNews = (updated: NewsArticle) => {
    setNewsList(prev => prev.map(n => n.id === updated.id ? updated : n));
  };

  const handleDeleteNews = (id: number) => {
    setNewsList(prev => prev.filter(n => n.id !== id));
  };

  const handleAddCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
    // Also sync existing news items that belong to this category
    setNewsList(prev => prev.map(n => n.category_id === updatedCat.id ? {
      ...n,
      category_name: updatedCat.name,
      category_slug: updatedCat.slug
    } : n));
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
  };

  const handleSubmitContactMessage = (msg: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: Date.now(),
      is_read: false,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [newMsg, ...prev]);
  };

  const handleMarkMessageRead = (id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleAddUser = (user: AdminUser) => {
    setUsers(prev => [user, ...prev]);
  };

  const handleUpdateUser = (user: AdminUser) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleImportBackup = (backup: BackupData) => {
    if (backup.news && Array.isArray(backup.news) && backup.news.length > 0) {
      setNewsList(backup.news);
    }
    if (backup.blogs && Array.isArray(backup.blogs) && backup.blogs.length > 0) {
      setBlogs(backup.blogs);
    }
    if (backup.categories && Array.isArray(backup.categories) && backup.categories.length > 0) {
      setCategories(backup.categories);
    }
    if (backup.settings) {
      setSettings(backup.settings);
    }
    if (backup.users && Array.isArray(backup.users) && backup.users.length > 0) {
      setUsers(backup.users);
    }
  };

  // If in Admin Panel view
  if (currentView === 'admin') {
    return (
      <AdminPanel
        newsList={newsList}
        categories={categories}
        ads={ads}
        epaper={epaper}
        settings={settings}
        messages={messages}
        blogs={blogs}
        users={users}
        onAddNews={handleAddNews}
        onUpdateNews={handleUpdateNews}
        onDeleteNews={handleDeleteNews}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateSettings={handleUpdateSettings}
        onCloseAdmin={handleCloseAdmin}
        onMarkMessageRead={handleMarkMessageRead}
        onDeleteMessage={handleDeleteMessage}
        onAddBlog={handleAddBlog}
        onUpdateBlog={handleUpdateBlog}
        onDeleteBlog={handleDeleteBlog}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onImportBackup={handleImportBackup}
      />
    );
  }

  // Filter for Homepage
  const publishedNews = newsList.filter(n => n.status === 'published');
  const breakingNews = publishedNews.filter(n => n.is_breaking);
  const leadStory = publishedNews.find(n => n.is_featured) || publishedNews[0];
  const subStories = publishedNews.filter(n => n.id !== leadStory?.id).slice(0, 3);
  const latestNews = publishedNews.slice(0, 8);

  const nationalNews = publishedNews.filter(n => n.category_slug === 'national');
  const politicsNews = publishedNews.filter(n => n.category_slug === 'politics');
  const sportsNews = publishedNews.filter(n => n.category_slug === 'sports');
  const entertainmentNews = publishedNews.filter(n => n.category_slug === 'entertainment');

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-bengali-body">
      {/* 1. Header */}
      <Header
        categories={categories}
        activeCategory={activeCategorySlug}
        onSelectCategory={handleSelectCategory}
        onNavigateHome={handleNavigateHome}
        onNavigateEpaper={handleNavigateEpaper}
        onNavigateSearch={handleNavigateSearch}
        onNavigateArchive={handleNavigateArchive}
        onNavigateBlog={handleNavigateBlog}
        isBlogActive={currentView === 'blog'}
        onOpenArticle={handleOpenArticle}
        onOpenAdmin={handleOpenAdmin}
        onDownloadZip={handleDownloadZip}
        allNews={publishedNews}
        settings={settings}
        disableAds={settings.disable_ads}
      />

      {/* 2. Breaking News Marquee Ticker */}
      <BreakingNews
        breakingArticles={breakingNews}
        onOpenArticle={handleOpenArticle}
      />

      {/* 3. Main Views Container */}
      <main className="flex-1">
        {/* HOMEPAGE VIEW */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            {/* Lead Hero + Sub-lead stories */}
            {leadStory && (
              <LeadHero
                leadStory={leadStory}
                subStories={subStories}
                latestArticles={latestNews}
                onOpenArticle={handleOpenArticle}
                onNavigateEpaper={handleNavigateEpaper}
                disableAds={settings.disable_ads}
              />
            )}

            {/* Middle Ad Banner - Completely hidden if disable_ads is true */}
            {!settings.disable_ads && (
              <div className="my-6 p-3.5 bg-gray-50 border border-gray-200 rounded text-center flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    স্পন্সরড বিজ্ঞাপন (Home Middle - ৭২৮x৯০)
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">
                    বাংলাদেশ প্রিমিয়ার লিগ ও আন্তর্জাতিক ক্রীড়া লাইভ কভারেজ
                  </p>
                </div>
                <button 
                  onClick={handleNavigateEpaper}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2 rounded transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  বিস্তারিত দেখুন
                </button>
              </div>
            )}

            {/* Latest News Grid */}
            <LatestGrid
              news={latestNews}
              onOpenArticle={handleOpenArticle}
              onViewAll={() => handleSelectCategory('all')}
            />

            {/* 2-Column Category Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <CategoryBlock
                title="জাতীয়"
                categorySlug="national"
                articles={nationalNews}
                onOpenArticle={handleOpenArticle}
                onViewCategory={handleSelectCategory}
              />
              <CategoryBlock
                title="রাজনীতি"
                categorySlug="politics"
                articles={politicsNews}
                onOpenArticle={handleOpenArticle}
                onViewCategory={handleSelectCategory}
              />
              <CategoryBlock
                title="খেলাধুলা"
                categorySlug="sports"
                articles={sportsNews}
                onOpenArticle={handleOpenArticle}
                onViewCategory={handleSelectCategory}
              />
              <CategoryBlock
                title="বিনোদন"
                categorySlug="entertainment"
                articles={entertainmentNews}
                onOpenArticle={handleOpenArticle}
                onViewCategory={handleSelectCategory}
              />
            </div>

            {/* Editorial / Thought Blog Section */}
            <HomeBlogSection
              blogs={blogs}
              onOpenBlog={handleOpenBlog}
              onViewAllBlogs={handleNavigateBlog}
            />

            {/* E-Paper Teaser Card - High Density */}
            <div className="bg-gray-900 text-white rounded p-5 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-800 mb-8 shadow-xs">
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  <Newspaper className="w-3 h-3" />
                  ডিজিটাল সংস্করণ
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-bengali-display">
                  দৈনিক বার্তাচিত্র ই-পত্রিকা
                </h3>
                <p className="text-xs text-gray-300 max-w-xl">
                  কাগজের পত্রিকার মতোই পাতা উল্টে এবং জুম করে পড়ুন বার্তাচিত্রের আজকের মুদ্রিত সংস্করণ।
                </p>
              </div>
              <button
                onClick={handleNavigateEpaper}
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-2 rounded text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                আজকের ই-পত্রিকা খুলুন →
              </button>
            </div>
          </div>
        )}

        {/* BLOGS AND ESSAYS VIEW */}
        {currentView === 'blog' && (
          <BlogView
            blogs={blogs.filter(b => b.status === 'published')}
            selectedBlog={selectedBlog}
            onSelectBlog={handleOpenBlog}
            onBackToList={() => { setSelectedBlog(null); scrollToTop(); }}
            onNavigateHome={handleNavigateHome}
            onLikeBlog={handleLikeBlog}
          />
        )}

        {/* SINGLE ARTICLE VIEW */}
        {currentView === 'article' && selectedArticle && (
          <ArticleView
            article={selectedArticle}
            relatedArticles={publishedNews.filter(n => n.id !== selectedArticle.id && n.category_id === selectedArticle.category_id).slice(0, 3)}
            latestArticles={publishedNews.filter(n => n.id !== selectedArticle.id).slice(0, 5)}
            onOpenArticle={handleOpenArticle}
            onSelectCategory={handleSelectCategory}
            onNavigateHome={handleNavigateHome}
            onNavigateEpaper={handleNavigateEpaper}
            disableAds={settings.disable_ads}
          />
        )}

        {/* CATEGORY LISTING VIEW */}
        {currentView === 'category' && (
          <CategoryView
            categorySlug={activeCategorySlug}
            categories={categories}
            allNews={publishedNews}
            onOpenArticle={handleOpenArticle}
          />
        )}

        {/* EPAPER VIEWER */}
        {currentView === 'epaper' && (
          <EpaperView
            epaper={epaper}
            allNews={publishedNews}
            onNavigateHome={handleNavigateHome}
            settings={settings}
          />
        )}

        {/* SEARCH RESULTS VIEW */}
        {currentView === 'search' && (
          <SearchView
            initialQuery={searchQuery}
            allNews={publishedNews}
            onOpenArticle={handleOpenArticle}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* ARCHIVE VIEW */}
        {currentView === 'archive' && (
          <ArchiveView
            allNews={publishedNews}
            onOpenArticle={handleOpenArticle}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* CONTACT VIEW */}
        {currentView === 'contact' && (
          <ContactView
            settings={settings}
            onNavigateHome={handleNavigateHome}
            onSubmitMessage={handleSubmitContactMessage}
          />
        )}

        {/* ABOUT VIEW */}
        {currentView === 'about' && (
          <AboutView
            settings={settings}
            onNavigateHome={handleNavigateHome}
          />
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onNavigateHome={handleNavigateHome}
        onNavigateEpaper={handleNavigateEpaper}
        onNavigateContact={handleNavigateContact}
        onNavigateAbout={handleNavigateAbout}
        onNavigateBlog={handleNavigateBlog}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
}
