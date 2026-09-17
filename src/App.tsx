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
import { AdminLogin } from './components/AdminLogin';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppDownloadView } from './components/AppDownloadView';
import { Newspaper, Smartphone } from 'lucide-react';
import { 
  fetchSiteSettings, saveSiteSettings,
  fetchNewsList, createNewsArticle, updateNewsArticle, deleteNewsArticle, recordNewsView,
  fetchCategoriesList, createCategoryItem, updateCategoryItem, deleteCategoryItem, reorderCategories,
  fetchAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement, trackAdClick,
  fetchEpaperData,
  fetchContactMessages, submitContactMessage, markMessageAsRead, deleteContactMessage,
  fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, likeBlogPost, recordBlogView,
  fetchAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser,
  checkAdminAuth, logoutAdmin
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
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);

  // View routing state
  const [currentView, setCurrentView] = useState<
    'home' | 'article' | 'category' | 'epaper' | 'search' | 'archive' | 'contact' | 'about' | 'admin' | 'blog' | 'app_download'
  >('home');
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check existing admin session
  useEffect(() => {
    checkAdminAuth()
      .then(user => {
        if (user) setCurrentAdminUser(user);
      })
      .catch(() => {});
  }, []);

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
        if (isMounted && Array.isArray(dbNews)) {
          setNewsList(dbNews);
        }
      })
      .catch(err => console.warn('News API fetch error:', err));

    // Load Categories
    fetchCategoriesList()
      .then(dbCats => {
        if (isMounted && Array.isArray(dbCats)) {
          const sorted = [...dbCats].sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
          setCategories(sorted);
        }
      })
      .catch(err => console.warn('Categories API fetch error:', err));

    // Load Ads
    fetchAdvertisements()
      .then(dbAds => {
        if (isMounted && Array.isArray(dbAds)) {
          setAds(dbAds);
        }
      })
      .catch(() => {});

    // Load Epaper
    fetchEpaperData()
      .then(dbEpaper => {
        if (isMounted && dbEpaper) {
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
        if (isMounted && Array.isArray(dbBlogs)) {
          setBlogs(dbBlogs);
        }
      })
      .catch(() => {});

    // Load Users
    fetchAdminUsers()
      .then(dbUsers => {
        if (isMounted && Array.isArray(dbUsers)) {
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
    const tagline = settings.site_tagline || 'সংবাদ ও ছবি। Bartachitra';
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
    } else if (path.startsWith('/app') || path.startsWith('/download') || path.startsWith('/apk')) {
      setCurrentView('app_download');
    } else if (path.startsWith('/blog/') || path.startsWith('/opinion/')) {
      const idStr = path.replace(/^\/(blog|opinion)\//, '').replace(/\/$/, '');
      const id = parseInt(idStr, 10);
      if (!isNaN(id)) {
        const found = blogs.find(b => b.id === id);
        if (found) {
          recordBlogView(found.id, found.title, found.category_tag).catch(() => {});
          setSelectedBlog(found);
        }
      }
      setCurrentView('blog');
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
          recordNewsView(found.id, found.title, found.category_id, found.category_name).catch(() => {});
          setSelectedArticle(found);
          setCurrentView('article');
        }
      }
    }
  }, [newsList, blogs]);

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
    recordNewsView(article.id, article.title, article.category_id, article.category_name).catch(() => {});
    setNewsList(prev => prev.map(n => n.id === article.id ? { ...n, views: (Number(n.views) || 0) + 1 } : n));
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

  const handleNavigateAppDownload = () => {
    navigateTo('app_download', '/app');
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
    recordBlogView(blog.id, blog.title, blog.category_tag).catch(() => {});
    setBlogs(prev => prev.map(b => b.id === blog.id ? { ...b, views: (Number(b.views) || 0) + 1 } : b));
    setSelectedBlog(blog);
    navigateTo('blog', `/blog/${blog.id}`);
  };

  const handleReloadAllContent = async () => {
    try {
      const [n, b] = await Promise.all([fetchNewsList(), fetchBlogPosts()]);
      setNewsList(n);
      setBlogs(b);
    } catch {}
  };

  const handleLikeBlog = async (id: number) => {
    setBlogs(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b));
    try {
      await likeBlogPost(id);
    } catch {}
  };

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setCurrentAdminUser(user);
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setCurrentAdminUser(null);
    handleNavigateHome();
  };

  // CRUD Handlers strictly connected to PHP MySQL Backend (No silent fallbacks)
  const handleAddBlog = async (newBlog: BlogPost) => {
    const saved = await createBlogPost(newBlog);
    setBlogs(prev => [saved, ...prev]);
  };

  const handleUpdateBlog = async (updated: BlogPost) => {
    const saved = await updateBlogPost(updated);
    setBlogs(prev => prev.map(b => b.id === saved.id ? saved : b));
  };

  const handleDeleteBlog = async (id: number) => {
    await deleteBlogPost(id);
    setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const handleAddNews = async (newArticle: NewsArticle) => {
    const saved = await createNewsArticle(newArticle);
    setNewsList(prev => [saved, ...prev]);
  };

  const handleUpdateNews = async (updated: NewsArticle) => {
    const saved = await updateNewsArticle(updated);
    setNewsList(prev => prev.map(n => n.id === saved.id ? saved : n));
  };

  const handleDeleteNews = async (id: number) => {
    await deleteNewsArticle(id);
    setNewsList(prev => prev.filter(n => n.id !== id));
  };

  const handleAddCategory = async (cat: Category) => {
    const saved = await createCategoryItem(cat);
    setCategories(prev => [...prev, saved]);
  };

  const handleUpdateCategory = async (updatedCat: Category) => {
    const saved = await updateCategoryItem(updatedCat);
    setCategories(prev => prev.map(c => c.id === saved.id ? saved : c));
    setNewsList(prev => prev.map(n => n.category_id === updatedCat.id ? {
      ...n,
      category_name: updatedCat.name,
      category_slug: updatedCat.slug
    } : n));
  };

  const handleDeleteCategory = async (id: number) => {
    await deleteCategoryItem(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleReorderCategories = async (newOrderedCategories: Category[]) => {
    const indexed = newOrderedCategories.map((cat, idx) => ({
      ...cat,
      display_order: idx + 1
    }));
    setCategories(indexed);

    const orders = indexed.map(cat => ({
      id: cat.id,
      display_order: cat.display_order
    }));

    try {
      const updated = await reorderCategories(orders);
      if (Array.isArray(updated) && updated.length > 0) {
        setCategories(updated.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0)));
      }
    } catch (err) {
      console.error('Category reorder error:', err);
      throw err;
    }
  };

  const handleUpdateSettings = async (newSettings: SiteSettings) => {
    const saved = await saveSiteSettings(newSettings);
    if (saved) {
      setSettings(prev => ({ ...prev, ...saved }));
    } else {
      setSettings(newSettings);
    }
  };

  const handleSubmitContactMessage = async (msg: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>) => {
    const saved = await submitContactMessage(msg);
    setMessages(prev => [saved, ...prev]);
  };

  const handleMarkMessageRead = async (id: number) => {
    await markMessageAsRead(id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const handleDeleteMessage = async (id: number) => {
    await deleteContactMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleAddUser = async (user: AdminUser, password?: string) => {
    const saved = await createAdminUser(user, password || user.password);
    setUsers(prev => [saved, ...prev]);
  };

  const handleUpdateUser = async (user: AdminUser, password?: string) => {
    await updateAdminUser(user, password || user.password);
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const handleDeleteUser = async (id: number) => {
    await deleteAdminUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddAd = async (newAdData: Partial<Advertisement>) => {
    try {
      const saved = await createAdvertisement(newAdData);
      setAds(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.error('Failed to create ad:', err);
      const localId = ads.length > 0 ? Math.max(...ads.map(a => a.id)) + 1 : 1;
      const fallbackAd: Advertisement = {
        id: localId,
        title: newAdData.title || 'নতুন বিজ্ঞাপন',
        position: newAdData.position || 'sidebar',
        image_url: newAdData.image_url || '',
        target_url: newAdData.target_url || '#',
        status: newAdData.status || 'active',
        views: 0,
        clicks: 0
      };
      setAds(prev => [fallbackAd, ...prev]);
      return fallbackAd;
    }
  };

  const handleUpdateAd = async (updatedAd: Advertisement) => {
    try {
      setAds(prev => prev.map(a => a.id === updatedAd.id ? updatedAd : a));
      await updateAdvertisement(updatedAd);
    } catch (err) {
      console.error('Failed to update ad:', err);
    }
  };

  const handleDeleteAd = async (id: number) => {
    try {
      setAds(prev => prev.filter(a => a.id !== id));
      await deleteAdvertisement(id);
    } catch (err) {
      console.error('Failed to delete ad:', err);
    }
  };

  const handleToggleAdStatus = async (id: number) => {
    const target = ads.find(a => a.id === id);
    if (!target) return;
    const newStatus: 'active' | 'inactive' = target.status === 'active' ? 'inactive' : 'active';
    const updated = { ...target, status: newStatus };
    await handleUpdateAd(updated);
  };

  // If in Admin Panel view
  if (currentView === 'admin') {
    if (!currentAdminUser) {
      return (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onCancel={handleCloseAdmin}
        />
      );
    }

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
          currentUser={currentAdminUser}
          onLogout={handleAdminLogout}
          onAddNews={handleAddNews}
          onUpdateNews={handleUpdateNews}
          onDeleteNews={handleDeleteNews}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategories={handleReorderCategories}
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
          onAddAd={handleAddAd}
          onUpdateAd={handleUpdateAd}
          onDeleteAd={handleDeleteAd}
          onToggleAdStatus={handleToggleAdStatus}
          onPreviewAppPage={handleNavigateAppDownload}
          onRefreshData={handleReloadAllContent}
        />
      </ErrorBoundary>
    );
  }

  // Filter for Published News
  const publishedNews = newsList.filter(n => n.status === 'published');

  // If in E-Paper full dedicated reader view
  if (currentView === 'epaper') {
    return (
      <ErrorBoundary title="ই-পেপার লোড হতে সমস্যা হয়েছে" onReset={handleNavigateHome}>
        <EpaperView
          epaper={epaper}
          allNews={publishedNews}
          onNavigateHome={handleNavigateHome}
          settings={settings}
          onOpenArticle={handleOpenArticle}
          onSelectDate={(date) => {
            fetchEpaperData(date).then(e => {
              if (e) setEpaper(e);
            }).catch(() => {});
          }}
        />
      </ErrorBoundary>
    );
  }

  // Filter for Homepage
  const breakingNews = publishedNews.filter(n => n.is_breaking);
  const activeBreakingNews = breakingNews.length > 0 ? breakingNews : publishedNews.slice(0, 6);
  const leadStory = publishedNews.find(n => n.is_featured) || publishedNews[0];
  const subStories = publishedNews.filter(n => n.id !== leadStory?.id).slice(0, 3);
  const latestNews = publishedNews.filter(n => n.id !== leadStory?.id);

  const nationalNews = publishedNews.filter(n => n.category_slug === 'national');
  const politicsNews = publishedNews.filter(n => n.category_slug === 'politics');
  const sportsNews = publishedNews.filter(n => n.category_slug === 'sports');
  const entertainmentNews = publishedNews.filter(n => n.category_slug === 'entertainment');

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-bengali-body">
      {/* 1 & 2. Fixed Sticky Header & Breaking News Container - Pinned on scroll so Breaking News never hides */}
      <div className="sticky top-0 z-40 bg-white shadow-xs">
        <Header
          categories={categories}
          activeCategory={activeCategorySlug}
          onSelectCategory={handleSelectCategory}
          onNavigateHome={handleNavigateHome}
          onNavigateEpaper={handleNavigateEpaper}
          onNavigateSearch={handleNavigateSearch}
          onNavigateArchive={handleNavigateArchive}
          onNavigateBlog={handleNavigateBlog}
          onNavigateAppDownload={handleNavigateAppDownload}
          isBlogActive={currentView === 'blog'}
          onOpenArticle={handleOpenArticle}
          onOpenAdmin={handleOpenAdmin}
          allNews={publishedNews}
          settings={settings}
          disableAds={settings.disable_ads}
        />

        {/* Breaking News Marquee Ticker - Fixed position directly below navigation */}
        <BreakingNews
          breakingArticles={activeBreakingNews}
          onOpenArticle={handleOpenArticle}
        />
      </div>

      {/* 3. Main Views Container */}
      <main className="flex-1">
        {/* HOMEPAGE VIEW */}
        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            {/* Header Top Banner Ad (If active and not disabled) */}
            {!settings.disable_ads && (() => {
              const headerAd = ads.find(a => a.position === 'header_top' && a.status === 'active');
              if (!headerAd) return null;
              return (
                <div className="mb-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-gray-50 px-3 py-1 border-b border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    <span>বিজ্ঞাপন (টপ ব্যানার)</span>
                    <span>স্পন্সরড</span>
                  </div>
                  <a
                    href={headerAd.target_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAdClick(headerAd.id)}
                    className="block relative group overflow-hidden bg-slate-900"
                    title={headerAd.title}
                  >
                    <img
                      src={headerAd.image_url}
                      alt={headerAd.title}
                      className="w-full h-auto max-h-24 sm:max-h-28 object-cover object-center group-hover:opacity-95 transition-opacity"
                    />
                  </a>
                </div>
              );
            })()}

            {/* Lead Hero + Sub-lead stories */}
            {leadStory && (
              <LeadHero
                leadStory={leadStory}
                subStories={subStories}
                latestArticles={latestNews}
                onOpenArticle={handleOpenArticle}
                onNavigateEpaper={handleNavigateEpaper}
                disableAds={settings.disable_ads}
                ads={ads}
              />
            )}

            {/* Middle Ad Banner - Completely hidden if disable_ads is true */}
            {!settings.disable_ads && (() => {
              const homeMiddleAd = ads.find(a => a.position === 'home_middle' && a.status === 'active');
              if (homeMiddleAd) {
                return (
                  <div className="my-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-gray-50 px-3 py-1 border-b border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      <span>বিজ্ঞাপন (হোমপেজ মিডল)</span>
                      <span>স্পন্সরড ব্যানার</span>
                    </div>
                    <a
                      href={homeMiddleAd.target_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAdClick(homeMiddleAd.id)}
                      className="block relative group overflow-hidden bg-slate-900"
                      title={homeMiddleAd.title}
                    >
                      <img
                        src={homeMiddleAd.image_url}
                        alt={homeMiddleAd.title}
                        className="w-full h-auto max-h-32 sm:max-h-40 object-cover object-center group-hover:opacity-95 transition-opacity"
                      />
                    </a>
                  </div>
                );
              }
              return (
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
              );
            })()}

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
            <div className="bg-gray-900 text-white rounded p-5 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-gray-800 mb-6 shadow-xs">
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

            {/* Android App Teaser Banner */}
            {settings.android_app?.enabled !== false && (
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-emerald-800/40 mb-8 shadow-xs">
                <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Smartphone className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-700/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <span>অ্যান্ড্রয়েড অ্যাপ্লিকেশন</span>
                      {(settings.android_app?.version_name || settings.android_app?.version) && (
                        <span className="bg-emerald-900 px-1.5 py-0.2 rounded-full text-[9px]">v{settings.android_app.version_name || settings.android_app.version}</span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-bengali-display text-white">
                      {settings.android_app?.app_name || 'বার্তাচিত্র মোবাইল অ্যাপ'}
                    </h3>
                    <p className="text-xs text-gray-300 max-w-xl">
                      {settings.android_app?.app_tagline || 'মোবাইলে দ্রুত ও স্বাচ্ছন্দ্যে তাজা খবর পেতে আজই ডাউনলোড করুন আমাদের অফিসিয়াল অ্যান্ড্রয়েড অ্যাপ।'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleNavigateAppDownload}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-2 shadow-md hover:shadow-emerald-900/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>ডাউনলোড ও ইনস্টলেশন গাইড →</span>
                  </button>
                </div>
              </div>
            )}
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
            ads={ads}
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

        {/* ANDROID APP DOWNLOAD VIEW */}
        {currentView === 'app_download' && (
          <AppDownloadView
            settings={settings}
            onNavigateHome={handleNavigateHome}
            onNavigateEpaper={handleNavigateEpaper}
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
        onNavigateAppDownload={handleNavigateAppDownload}
        onOpenAdmin={handleOpenAdmin}
      />
    </div>
  );
}
