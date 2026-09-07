import React, { useState, useEffect, useCallback } from 'react';
import { 
  INITIAL_CATEGORIES, INITIAL_NEWS, INITIAL_ADS, 
  INITIAL_EPAPER, INITIAL_SETTINGS, INITIAL_MESSAGES,
  INITIAL_BLOGS, INITIAL_USERS
} from './data/initialData';
import { NewsArticle, Category, SiteSettings, ContactMessage, BlogPost, AdminUser, Advertisement, Epaper } from './types';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { Newspaper } from 'lucide-react';
import { 
  fetchSiteSettings, saveSiteSettings,
  fetchNewsList, createNewsArticle, updateNewsArticle, deleteNewsArticle, recordNewsView,
  fetchCategoriesList, createCategoryItem, updateCategoryItem, deleteCategoryItem,
  fetchAdvertisements,
  fetchEpaperData,
  fetchContactMessages, submitContactMessage, markMessageAsRead, deleteContactMessage,
  fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, likeBlogPost,
  fetchAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser
} from './utils/api';

export default function App() {
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [ads, setAds] = useState<Advertisement[]>(INITIAL_ADS);
  const [epaper, setEpaper] = useState<Epaper>(INITIAL_EPAPER);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_MESSAGES);
  const [blogs, setBlogs] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);

  // View routing state
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

  // 1. Initial Data Fetch from PHP API / MySQL
  useEffect(() => {
    let isMounted = true;

    // Load Settings
    fetchSiteSettings()
      .then(dbSettings => {
        if (isMounted && dbSettings && dbSettings.site_name) {
          setSettings(prev => ({ ...prev, ...dbSettings }));
        }
      })
      .catch(() => {
        // Fallback to local storage if available
        try {
          const saved = localStorage.getItem('bartachitro_settings');
          if (saved && isMounted) {
            setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
          }
        } catch {}
      });

    // Load News
    fetchNewsList()
      .then(dbNews => {
        if (isMounted && Array.isArray(dbNews) && dbNews.length > 0) {
          setNewsList(dbNews);
        }
      })
      .catch(err => console.warn('News API fetch fallback to defaults:', err));

    // Load Categories
    fetchCategoriesList()
      .then(dbCats => {
        if (isMounted && Array.isArray(dbCats) && dbCats.length > 0) {
          setCategories(dbCats);
        }
      })
      .catch(err => console.warn('Categories API fetch fallback to defaults:', err));

    // Load Ads
    fetchAdvertisements()
      .then(dbAds => {
        if (isMounted && Array.isArray(dbAds) && dbAds.length > 0) {
          setAds(dbAds);
        }
      })
      .catch(() => {});

    // Load Epaper
    fetchEpaperData()
      .then(dbEpaper => {
        if (isMounted && dbEpaper && dbEpaper.pages) {
          setEpaper(dbEpaper);
        }
      })
      .catch(() => {});

    // Load Messages
    fetchContactMessages()
      .then(dbMsgs => {
        if (isMounted && Array.isArray(dbMsgs)) {
          setMessages(dbMsgs);
        }
      })
      .catch(() => {});

    // Load Blogs
    fetchBlogPosts()
      .then(dbBlogs => {
        if (isMounted && Array.isArray(dbBlogs) && dbBlogs.length > 0) {
          setBlogs(dbBlogs);
        }
      })
      .catch(() => {});

    // Load Users
    fetchAdminUsers()
      .then(dbUsers => {
        if (isMounted && Array.isArray(dbUsers) && dbUsers.length > 0) {
          setUsers(dbUsers);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sync Document Title and Favicon with Settings
  useEffect(() => {
    const siteName = settings.site_name || 'বার্তাচিত্র';
    const tagline = settings.site_tagline || 'সত্যের সংবাদ, সবার ভাষায়';
    document.title = `${siteName} - ${tagline}`;

    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings.site_name, settings.site_tagline, settings.favicon_url]);

  // 3. Handle cPanel friendly URL routing & Popstate (Back/Forward)
  const handleUrlRoute = useCallback(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentView('admin');
    } else if (path.startsWith('/epaper')) {
      setCurrentView('epaper');
    } else if (path.startsWith('/blog') || path.startsWith('/opinion')) {
      setCurrentView('blog');
    } else if (path.startsWith('/archive')) {
      setCurrentView('archive');
    } else if (path.startsWith('/contact')) {
      setCurrentView('contact');
    } else if (path.startsWith('/about')) {
      setCurrentView('about');
    } else if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '').replace(/\/$/, '');
      setActiveCategorySlug(slug);
      setCurrentView('category');
    } else if (path.startsWith('/news/')) {
      const idStr = path.replace('/news/', '').replace(/\/$/, '');
      const id = parseInt(idStr, 10);
      if (!isNaN(id)) {
        const found = newsList.find(n => n.id === id);
        if (found) {
          setSelectedArticle(found);
          setCurrentView('article');
        }
      }
    }
  }, [newsList]);

  useEffect(() => {
    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [handleUrlRoute]);

  const navigateTo = (view: typeof currentView, urlPath: string) => {
    setCurrentView(view);
    if (window.location.pathname !== urlPath) {
      window.history.pushState(null, '', urlPath);
    }
    scrollToTop();
  };

  const handleOpenArticle = (article: NewsArticle) => {
    recordNewsView(article.id).catch(() => {});
    setNewsList(prev => prev.map(n => n.id === article.id ? { ...n, views: n.views + 1 } : n));
    setSelectedArticle(article);
    navigateTo('article', `/news/${article.id}`);
  };

  const handleSelectCategory = (slug: string) => {
    setActiveCategorySlug(slug);
    navigateTo('category', `/category/${slug}`);
  };

  const handleNavigateHome = () => {
    setActiveCategorySlug('home');
    setSelectedArticle(null);
    navigateTo('home', '/');
  };

  const handleNavigateEpaper = () => {
    navigateTo('epaper', '/epaper');
  };

  const handleNavigateSearch = (query: string) => {
    setSearchQuery(query);
    navigateTo('search', `/search?q=${encodeURIComponent(query)}`);
  };

  const handleNavigateArchive = () => {
    navigateTo('archive', '/archive');
  };

  const handleNavigateContact = () => {
    navigateTo('contact', '/contact');
  };

  const handleNavigateAbout = () => {
    navigateTo('about', '/about');
  };

  const handleOpenAdmin = () => {
    navigateTo('admin', '/admin');
  };

  const handleCloseAdmin = () => {
    handleNavigateHome();
  };

  const handleNavigateBlog = () => {
    setSelectedBlog(null);
    navigateTo('blog', '/blog');
  };

  const handleOpenBlog = (blog: BlogPost) => {
    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, views: b.views + 1 } : b));
    setSelectedBlog(blog);
    navigateTo('blog', `/blog/${blog.id}`);
  };

  const handleLikeBlog = async (id: number) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
    try {
      await likeBlogPost(id);
    } catch {}
  };

  // CRUD Handlers connected to PHP MySQL Backend
  const handleAddBlog = async (newBlog: BlogPost) => {
    try {
      const saved = await createBlogPost(newBlog);
      setBlogs(prev => [saved, ...prev]);
    } catch (err) {
      console.warn('Backend add blog failed, using fallback:', err);
      setBlogs(prev => [newBlog, ...prev]);
    }
  };

  const handleUpdateBlog = async (updated: BlogPost) => {
    try {
      const saved = await updateBlogPost(updated);
      setBlogs(prev => prev.map(b => b.id === saved.id ? saved : b));
    } catch (err) {
      console.warn('Backend update blog failed, using fallback:', err);
      setBlogs(prev => prev.map(b => b.id === updated.id ? updated : b));
    }
  };

  const handleDeleteBlog = async (id: number) => {
    try {
      await deleteBlogPost(id);
    } catch {}
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const handleAddNews = async (newArticle: NewsArticle) => {
    try {
      const saved = await createNewsArticle(newArticle);
      setNewsList(prev => [saved, ...prev]);
    } catch (err) {
      console.warn('Backend add news failed, adding locally:', err);
      setNewsList(prev => [newArticle, ...prev]);
    }
  };

  const handleUpdateNews = async (updated: NewsArticle) => {
    try {
      const saved = await updateNewsArticle(updated);
      setNewsList(prev => prev.map(n => n.id === saved.id ? saved : n));
    } catch (err) {
      console.warn('Backend update news failed, updating locally:', err);
      setNewsList(prev => prev.map(n => n.id === updated.id ? updated : n));
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      await deleteNewsArticle(id);
    } catch {}
    setNewsList(prev => prev.filter(n => n.id !== id));
  };

  const handleAddCategory = async (cat: Category) => {
    try {
      const saved = await createCategoryItem(cat);
      setCategories(prev => [...prev, saved]);
    } catch (err) {
      console.warn('Backend add category failed, adding locally:', err);
      setCategories(prev => [...prev, cat]);
    }
  };

  const handleUpdateCategory = async (updatedCat: Category) => {
    try {
      const saved = await updateCategoryItem(updatedCat);
      setCategories(prev => prev.map(c => c.id === saved.id ? saved : c));
    } catch (err) {
      console.warn('Backend update category failed, updating locally:', err);
      setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
    }
    setNewsList(prev => prev.map(n => n.category_id === updatedCat.id ? {
      ...n,
      category_name: updatedCat.name,
      category_slug: updatedCat.slug
    } : n));
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategoryItem(id);
    } catch {}
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('bartachitro_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.warn('localStorage quota warning:', e);
    }
    try {
      const saved = await saveSiteSettings(newSettings);
      if (saved) {
        setSettings(prev => ({ ...prev, ...saved }));
      }
    } catch (err) {
      console.warn('Backend save settings failed:', err);
    }
  };

  const handleSubmitContactMessage = async (msg: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>) => {
    try {
      const saved = await submitContactMessage(msg);
      setMessages(prev => [saved, ...prev]);
    } catch (err) {
      const fallback: ContactMessage = {
        ...msg,
        id: Date.now(),
        is_read: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [fallback, ...prev]);
    }
  };

  const handleMarkMessageRead = async (id: number) => {
    try {
      await markMessageAsRead(id);
    } catch {}
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      await deleteContactMessage(id);
    } catch {}
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleAddUser = async (user: AdminUser) => {
    try {
      const saved = await createAdminUser(user);
      setUsers(prev => [saved, ...prev]);
    } catch {
      setUsers(prev => [user, ...prev]);
    }
  };

  const handleUpdateUser = async (user: AdminUser) => {
    try {
      await updateAdminUser(user);
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } catch {
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteAdminUser(id);
    } catch {}
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // If in Admin Panel view
  if (currentView === 'admin') {
    return (
      <ErrorBoundary title="অ্যাডমিন প্যানেল লোড হতে সমস্যা হয়েছে" onReset={handleCloseAdmin}>
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
        />
      </ErrorBoundary>
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
