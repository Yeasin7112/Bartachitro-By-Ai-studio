import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, PlusCircle, FolderTree, Zap, 
  Image, Sliders, Mail, User, LogOut, ExternalLink, 
  Trash2, Edit, Check, AlertCircle, Eye, Newspaper, ArrowLeft,
  Search, X, BookOpen, PenTool, Heart, Clock, Sparkles,
  Database, ShieldCheck, UserCheck, RefreshCw, Upload, Globe,
  GripVertical, ArrowUp, ArrowDown, ListOrdered, KeyRound,
  BarChart3, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, Download,
  Menu
} from 'lucide-react';
import { 
  NewsArticle, Category, Advertisement, Epaper, 
  SiteSettings, ContactMessage, BlogPost, AdminUser, AdminRole 
} from '../types';
import { bnNum, bnDate } from '../utils/bengaliHelpers';
import { ImageUploader } from './ImageUploader';
import { VideoUploader } from './VideoUploader';
import { RichTextEditor } from './RichTextEditor';
import { SeoMetaHelper } from './SeoMetaHelper';
import { AdminUserManagement } from './admin/AdminUserManagement';
import { AdminBackupRestore } from './admin/AdminBackupRestore';
import { UpdatePasswordModal } from './admin/UpdatePasswordModal';
import { AdminMediaLibrary } from './admin/AdminMediaLibrary';
import { AdminAnalyticsDashboard } from './admin/AdminAnalyticsDashboard';
import { AdminExportImport } from './admin/AdminExportImport';
import { AdminAdsManagement } from './admin/AdminAdsManagement';
import { AdminMessagesInbox } from './admin/AdminMessagesInbox';
import { DeleteConfirmModal } from './common/DeleteConfirmModal';
import { BackupData } from '../utils/zipExporter';
import { SiteLogo } from './SiteLogo';

interface AdminPanelProps {
  newsList: NewsArticle[];
  categories: Category[];
  ads: Advertisement[];
  epaper: Epaper;
  settings: SiteSettings;
  messages: ContactMessage[];
  blogs?: BlogPost[];
  users?: AdminUser[];
  currentUser?: AdminUser | null;
  onLogout?: () => void;
  onAddNews: (news: NewsArticle) => Promise<void> | void;
  onUpdateNews: (news: NewsArticle) => Promise<void> | void;
  onDeleteNews: (id: number) => Promise<void> | void;
  onAddCategory: (cat: Category) => Promise<void> | void;
  onUpdateCategory: (cat: Category) => Promise<void> | void;
  onDeleteCategory: (id: number) => Promise<void> | void;
  onReorderCategories?: (categories: Category[]) => Promise<void> | void;
  onUpdateSettings: (settings: SiteSettings) => Promise<void> | void;
  onCloseAdmin: () => void;
  onMarkMessageRead: (id: number) => Promise<void> | void;
  onDeleteMessage: (id: number) => Promise<void> | void;
  onAddBlog?: (blog: BlogPost) => Promise<void> | void;
  onUpdateBlog?: (blog: BlogPost) => Promise<void> | void;
  onDeleteBlog?: (id: number) => Promise<void> | void;
  onAddUser?: (user: AdminUser, password?: string) => Promise<void> | void;
  onUpdateUser?: (user: AdminUser, password?: string) => Promise<void> | void;
  onDeleteUser?: (id: number) => Promise<void> | void;
  onImportBackup?: (backup: BackupData) => void;
  onAddAd?: (ad: Partial<Advertisement>) => Promise<Advertisement | void> | void;
  onUpdateAd?: (ad: Advertisement) => Promise<void> | void;
  onDeleteAd?: (id: number) => Promise<void> | void;
  onToggleAdStatus?: (id: number) => Promise<void> | void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  newsList,
  categories,
  ads,
  epaper,
  settings,
  messages,
  blogs = [],
  users = [],
  currentUser = null,
  onLogout,
  onAddNews,
  onUpdateNews,
  onDeleteNews,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  onUpdateSettings,
  onCloseAdmin,
  onMarkMessageRead,
  onDeleteMessage,
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onImportBackup,
  onAddAd,
  onUpdateAd,
  onDeleteAd,
  onToggleAdStatus
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'analytics' | 'news' | 'add_news' | 'media' | 'categories' | 'breaking' | 'blogs' | 'add_blog' | 'export_import' | 'ads' | 'messages' | 'settings' | 'users'
  >('dashboard');

  // Active Admin Profile User (Default to authenticated user or first)
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser>(() => {
    return currentUser || users.find(u => u.role === 'super_admin') || users[0] || {
      id: 1,
      name: 'আহমেদ রফিক চৌধুরী',
      username: 'admin',
      email: 'admin@bartachitro.com',
      role: 'super_admin',
      role_title: 'প্রধান সম্পাদক ও প্রকাশক',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      created_at: '2026-01-01 10:00:00',
      last_login: '২০২৬-০৯-০৬ ১২:৩০'
    };
  });

  // Password update modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // Mobile navigation drawer toggle
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Tab Bengali display titles for mobile header
  const tabTitles: Record<string, string> = {
    dashboard: 'ড্যাশবোর্ড',
    analytics: 'অ্যানালিটিক্স',
    news: 'সংবাদ তালিকা',
    add_news: 'নতুন সংবাদ প্রকাশ',
    media: 'মিডিয়া লাইব্রেরি',
    categories: 'ক্যাটাগরি ব্যবস্থাপনা',
    breaking: 'ব্রেকিং নিউজ',
    blogs: 'ব্লগ ও চিন্তাধারা',
    add_blog: 'নতুন ব্লগ লিখুন',
    export_import: 'এক্সপোর্ট ও ইমপোর্ট',
    ads: 'বিজ্ঞাপন ব্যবস্থাপনা',
    messages: 'বার্তা ইনবক্স',
    users: 'অ্যাডমিন রোল',
    settings: 'সাইট সেটিংস'
  };

  useEffect(() => {
    if (currentUser) {
      setCurrentAdminUser(currentUser);
    }
  }, [currentUser]);

  // Form states for Add News
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<number>(categories[0]?.id || 1);
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsAuthor, setNewsAuthor] = useState('বার্তাচিত্র প্রতিবেদক');
  const [newsImage, setNewsImage] = useState('https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80');
  const [newsVideoUrl, setNewsVideoUrl] = useState('');
  const [newsIsFeatured, setNewsIsFeatured] = useState(false);
  const [newsIsBreaking, setNewsIsBreaking] = useState(false);
  const [newsStatus, setNewsStatus] = useState<'published' | 'draft'>('published');
  const [newsSeoTitle, setNewsSeoTitle] = useState('');
  const [newsSeoDescription, setNewsSeoDescription] = useState('');
  const [newsSeoKeywords, setNewsSeoKeywords] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Blog Writing & Management States
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategoryTag, setBlogCategoryTag] = useState('মতামত ও কলাম');
  const [customBlogTag, setCustomBlogTag] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogAuthorName, setBlogAuthorName] = useState('আহমেদ রফিক চৌধুরী');
  const [blogAuthorRole, setBlogAuthorRole] = useState('সিনিয়র কলামিস্ট ও বিশ্লেষক');
  const [blogAuthorAvatar, setBlogAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face');
  const [blogCoverImage, setBlogCoverImage] = useState('https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80');
  const [blogVideoUrl, setBlogVideoUrl] = useState('');
  const [blogReadingTime, setBlogReadingTime] = useState<number>(4);
  const [blogIsFeatured, setBlogIsFeatured] = useState(false);
  const [blogStatus, setBlogStatus] = useState<'published' | 'draft'>('published');
  const [blogTagsInput, setBlogTagsInput] = useState('মতামত, চিন্তাধারা, সমসাময়িক');
  const [blogSeoTitle, setBlogSeoTitle] = useState('');
  const [blogSeoDescription, setBlogSeoDescription] = useState('');
  const [blogSeoKeywords, setBlogSeoKeywords] = useState('');

  // Blog Searching & Filtering
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('all');

  // Editing Blog Modal State
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editBlogTitle, setEditBlogTitle] = useState('');
  const [editBlogCategoryTag, setEditBlogCategoryTag] = useState('');
  const [editBlogSummary, setEditBlogSummary] = useState('');
  const [editBlogContent, setEditBlogContent] = useState('');
  const [editBlogAuthorName, setEditBlogAuthorName] = useState('');
  const [editBlogAuthorRole, setEditBlogAuthorRole] = useState('');
  const [editBlogAuthorAvatar, setEditBlogAuthorAvatar] = useState('');
  const [editBlogCoverImage, setEditBlogCoverImage] = useState('');
  const [editBlogVideoUrl, setEditBlogVideoUrl] = useState('');
  const [editBlogReadingTime, setEditBlogReadingTime] = useState<number>(4);
  const [editBlogIsFeatured, setEditBlogIsFeatured] = useState(false);
  const [editBlogStatus, setEditBlogStatus] = useState<'published' | 'draft'>('published');
  const [editBlogViews, setEditBlogViews] = useState<number>(0);
  const [editBlogLikes, setEditBlogLikes] = useState<number>(0);
  const [editBlogTagsInput, setEditBlogTagsInput] = useState('');
  const [editBlogSeoTitle, setEditBlogSeoTitle] = useState('');
  const [editBlogSeoDescription, setEditBlogSeoDescription] = useState('');
  const [editBlogSeoKeywords, setEditBlogSeoKeywords] = useState('');

  // News list advanced search, filters & pagination
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState<string>('all');
  const [newsAuthorFilter, setNewsAuthorFilter] = useState<string>('all');
  const [newsDatePreset, setNewsDatePreset] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [newsCustomStartDate, setNewsCustomStartDate] = useState<string>('');
  const [newsCustomEndDate, setNewsCustomEndDate] = useState<string>('');
  const [newsPage, setNewsPage] = useState<number>(1);
  const [newsPerPage, setNewsPerPage] = useState<number>(15);
  const [newsSortBy, setNewsSortBy] = useState<'newest' | 'oldest' | 'views'>('newest');

  // Old News Editing Form States
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [editNewsTitle, setEditNewsTitle] = useState('');
  const [editNewsCategory, setEditNewsCategory] = useState<number>(1);
  const [editNewsSummary, setEditNewsSummary] = useState('');
  const [editNewsContent, setEditNewsContent] = useState('');
  const [editNewsAuthor, setEditNewsAuthor] = useState('');
  const [editNewsImage, setEditNewsImage] = useState('');
  const [editNewsVideoUrl, setEditNewsVideoUrl] = useState('');
  const [editNewsIsFeatured, setEditNewsIsFeatured] = useState(false);
  const [editNewsIsBreaking, setEditNewsIsBreaking] = useState(false);
  const [editNewsStatus, setEditNewsStatus] = useState<'published' | 'draft'>('published');
  const [editNewsPublishedAt, setEditNewsPublishedAt] = useState('');
  const [editNewsViews, setEditNewsViews] = useState<number>(0);
  const [editNewsSeoTitle, setEditNewsSeoTitle] = useState('');
  const [editNewsSeoDescription, setEditNewsSeoDescription] = useState('');
  const [editNewsSeoKeywords, setEditNewsSeoKeywords] = useState('');

  // Category form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  // Category Editing Form State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatSlug, setEditCatSlug] = useState('');
  const [editCatOrder, setEditCatOrder] = useState<number>(1);

  // Category Drag & Drop Order State
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingCategoryOrder, setIsSavingCategoryOrder] = useState<boolean>(false);
  const [orderSavedSuccess, setOrderSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (categories && categories.length > 0) {
      const sorted = [...categories].sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
      setOrderedCategories(sorted);
    } else {
      setOrderedCategories([]);
    }
  }, [categories]);

  // Settings form state
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  // Stats calculation
  const totalNews = newsList.length;
  const publishedNews = newsList.filter(n => n.status === 'published').length;
  const breakingNewsCount = newsList.filter(n => n.is_breaking).length;
  const totalViews = newsList.reduce((acc, curr) => acc + curr.views, 0);
  const unreadMessages = messages.filter(m => !m.is_read).length;
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter(b => b.status === 'published').length;
  const totalBlogViews = blogs.reduce((acc, curr) => acc + curr.views, 0);

  // Handlers for News Editing
  const handleStartEditNews = (article: NewsArticle) => {
    setEditingNews(article);
    setEditNewsTitle(article.title);
    setEditNewsCategory(article.category_id);
    setEditNewsSummary(article.summary || '');
    setEditNewsContent(article.content);
    setEditNewsAuthor(article.author_name || 'বার্তাচিত্র প্রতিবেদক');
    setEditNewsImage(article.featured_image || '');
    setEditNewsVideoUrl(article.video_url || '');
    setEditNewsIsFeatured(!!article.is_featured);
    setEditNewsIsBreaking(!!article.is_breaking);
    setEditNewsStatus(article.status || 'published');
    setEditNewsPublishedAt(article.published_at || '');
    setEditNewsViews(article.views || 0);
    setEditNewsSeoTitle(article.seo_title || article.title);
    setEditNewsSeoDescription(article.seo_description || article.summary || '');
    setEditNewsSeoKeywords(article.seo_keywords || '');
  };

  const handleSaveEditNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews || !editNewsTitle.trim() || !editNewsContent.trim()) return;

    const catObj = categories.find(c => c.id === Number(editNewsCategory));
    
    // Format paragraph structure if not already HTML
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
      video_url: editNewsVideoUrl.trim() || undefined,
      is_featured: editNewsIsFeatured,
      is_breaking: editNewsIsBreaking,
      status: editNewsStatus,
      published_at: editNewsPublishedAt.trim() || editingNews.published_at,
      views: Number(editNewsViews) >= 0 ? Number(editNewsViews) : editingNews.views,
      seo_title: editNewsSeoTitle.trim() || editNewsTitle.trim(),
      seo_description: editNewsSeoDescription.trim() || editNewsSummary.trim(),
      seo_keywords: editNewsSeoKeywords.trim()
    };

    try {
      await onUpdateNews(updatedArticle);
      setFeedback(`"${updatedArticle.title.slice(0, 24)}..." সংবাদটি সফলভাবে আপডেট করা হয়েছে!`);
      setErrorMessage('');
      setEditingNews(null);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'সংবাদটি আপডেট করতে ব্যর্থ হয়েছে।');
    }
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

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim() || !editCatSlug.trim()) return;

    const updatedCat: Category = {
      ...editingCategory,
      name: editCatName.trim(),
      slug: editCatSlug.trim().toLowerCase().replace(/\s+/g, '-'),
      display_order: Number(editCatOrder) || 1
    };

    try {
      await onUpdateCategory(updatedCat);
      setFeedback(`"${updatedCat.name}" ক্যাটাগরিটি সফলভাবে হালনাগাদ করা হয়েছে!`);
      setErrorMessage('');
      setEditingCategory(null);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ক্যাটাগরিটি হালনাগাদ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
  };

  const handleDropCategory = async (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...orderedCategories];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    // Re-index sequentially 1, 2, 3...
    const updatedWithOrder = reordered.map((cat, idx) => ({
      ...cat,
      display_order: idx + 1
    }));

    setOrderedCategories(updatedWithOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (onReorderCategories) {
      setIsSavingCategoryOrder(true);
      try {
        await onReorderCategories(updatedWithOrder);
        setOrderSavedSuccess(true);
        setFeedback(`"${movedItem.name}" ক্যাটাগরি স্থানান্তরিত হয়েছে এবং নতুন ক্রম ওয়েবসাইটে সংরক্ষিত হয়েছে!`);
        setErrorMessage('');
        setTimeout(() => setOrderSavedSuccess(false), 3000);
        setTimeout(() => setFeedback(''), 4000);
      } catch (err: any) {
        setErrorMessage(err.message || 'ক্যাটাগরি ক্রম সংরক্ষণ করতে ব্যর্থ হয়েছে।');
      } finally {
        setIsSavingCategoryOrder(false);
      }
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedCategories.length) return;

    const reordered = [...orderedCategories];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    const updatedWithOrder = reordered.map((cat, idx) => ({
      ...cat,
      display_order: idx + 1
    }));

    setOrderedCategories(updatedWithOrder);

    if (onReorderCategories) {
      setIsSavingCategoryOrder(true);
      try {
        await onReorderCategories(updatedWithOrder);
        setOrderSavedSuccess(true);
        setFeedback(`"${movedItem.name}" ক্যাটাগরি ${direction === 'up' ? 'উপরে' : 'নিচে'} স্থানান্তরিত হয়েছে।`);
        setErrorMessage('');
        setTimeout(() => setOrderSavedSuccess(false), 3000);
        setTimeout(() => setFeedback(''), 4000);
      } catch (err: any) {
        setErrorMessage(err.message || 'ক্যাটাগরি ক্রম সংরক্ষণ করতে সমস্যা হয়েছে।');
      } finally {
        setIsSavingCategoryOrder(false);
      }
    }
  };

  const handleSaveManualCategoryOrder = async () => {
    if (!onReorderCategories) return;
    setIsSavingCategoryOrder(true);
    try {
      const updatedWithOrder = orderedCategories.map((cat, idx) => ({
        ...cat,
        display_order: idx + 1
      }));
      await onReorderCategories(updatedWithOrder);
      setOrderSavedSuccess(true);
      setFeedback('সকল ক্যাটাগরির বর্তমান ক্রম সফলভাবে ডাটাবেজে ও ওয়েবসাইটে কার্যকর হয়েছে!');
      setErrorMessage('');
      setTimeout(() => setOrderSavedSuccess(false), 3000);
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ক্যাটাগরি ক্রম সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSavingCategoryOrder(false);
    }
  };

  const handleToggleNewsBreaking = async (news: NewsArticle) => {
    try {
      await onUpdateNews({ ...news, is_breaking: !news.is_breaking });
      setFeedback(`ব্রেকিং স্ট্যাটাস ${!news.is_breaking ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'ব্রেকিং স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const handleToggleNewsFeatured = async (news: NewsArticle) => {
    try {
      await onUpdateNews({ ...news, is_featured: !news.is_featured });
      setFeedback(`লিড স্টোরি স্ট্যাটাস ${!news.is_featured ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'লিড স্টোরি স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteNewsClick = async (id: number) => {
    if (!window.confirm('আপনি কি এই সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    try {
      await onDeleteNews(id);
      setFeedback('সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।');
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'সংবাদ মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteCategoryClick = async (id: number) => {
    if (!window.confirm('আপনি কি এই ক্যাটাগরিটি মুছে ফেলতে চান?')) return;
    try {
      await onDeleteCategory(id);
      setFeedback('ক্যাটাগরিটি মুছে ফেলা হয়েছে।');
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে।');
    }
  };

  // Distinct authors list for filter dropdown
  const newsAuthors = useMemo(() => {
    const list = Array.from(new Set(newsList.map(n => n.author_name?.trim()).filter(Boolean) as string[]));
    return list.sort();
  }, [newsList]);

  // Advanced Filtered news list for the News List management table
  const filteredNewsList = useMemo(() => {
    let result = newsList.filter((n) => {
      const query = newsSearchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        n.title.toLowerCase().includes(query) ||
        (n.author_name && n.author_name.toLowerCase().includes(query)) ||
        (n.category_name && n.category_name.toLowerCase().includes(query)) ||
        (n.summary && n.summary.toLowerCase().includes(query)) ||
        (n.content && n.content.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Category filter
      if (newsCategoryFilter !== 'all' && n.category_id !== Number(newsCategoryFilter)) {
        return false;
      }

      // Author filter
      if (newsAuthorFilter !== 'all' && n.author_name?.trim() !== newsAuthorFilter) {
        return false;
      }

      // Date range filter
      if (newsDatePreset !== 'all' && n.published_at) {
        const articleTime = new Date(n.published_at).getTime();
        const now = Date.now();
        if (newsDatePreset === 'today') {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (articleTime < oneDayAgo) return false;
        } else if (newsDatePreset === '7days') {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (articleTime < sevenDaysAgo) return false;
        } else if (newsDatePreset === '30days') {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (articleTime < thirtyDaysAgo) return false;
        } else if (newsDatePreset === 'custom') {
          if (newsCustomStartDate) {
            const start = new Date(newsCustomStartDate).getTime();
            if (articleTime < start) return false;
          }
          if (newsCustomEndDate) {
            const end = new Date(newsCustomEndDate + 'T23:59:59').getTime();
            if (articleTime > end) return false;
          }
        }
      }

      return true;
    });

    if (newsSortBy === 'views') {
      result = [...result].sort((a, b) => b.views - a.views);
    } else if (newsSortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    } else {
      result = [...result].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }

    return result;
  }, [newsList, newsSearchQuery, newsCategoryFilter, newsAuthorFilter, newsDatePreset, newsCustomStartDate, newsCustomEndDate, newsSortBy]);

  // News Pagination calculation
  const totalNewsPages = Math.max(1, Math.ceil(filteredNewsList.length / newsPerPage));
  const currentNewsPage = Math.min(newsPage, totalNewsPages);
  const paginatedNewsList = useMemo(() => {
    const startIdx = (currentNewsPage - 1) * newsPerPage;
    return filteredNewsList.slice(startIdx, startIdx + newsPerPage);
  }, [filteredNewsList, currentNewsPage, newsPerPage]);

  // Filtered blog list for the Blog management table
  const filteredBlogs = blogs.filter((b) => {
    const query = blogSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      b.title.toLowerCase().includes(query) ||
      b.author_name.toLowerCase().includes(query) ||
      b.category_tag.toLowerCase().includes(query) ||
      b.summary.toLowerCase().includes(query);

    const matchesCategory = blogCategoryFilter === 'all' || b.category_tag === blogCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    const catObj = categories.find(c => c.id === Number(newsCategory));
    const finalContent = newsContent.trim().startsWith('<') 
      ? newsContent.trim() 
      : `<p>${newsContent.trim().replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;

    const newArticle: NewsArticle = {
      id: Date.now(),
      title: newsTitle.trim(),
      slug: newsTitle.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 50),
      category_id: Number(newsCategory),
      category_name: catObj?.name || 'জাতীয়',
      category_slug: catObj?.slug || 'national',
      summary: newsSummary.trim() || newsTitle.slice(0, 80),
      content: finalContent,
      author_name: newsAuthor.trim() || 'নিজস্ব প্রতিবেদক',
      featured_image: newsImage.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      video_url: newsVideoUrl.trim() || undefined,
      views: 1,
      is_featured: newsIsFeatured,
      is_breaking: newsIsBreaking,
      status: newsStatus,
      published_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      seo_title: newsSeoTitle.trim() || newsTitle.trim(),
      seo_description: newsSeoDescription.trim() || newsSummary.trim() || newsTitle.slice(0, 160),
      seo_keywords: newsSeoKeywords.trim()
    };

    try {
      await onAddNews(newArticle);
      setFeedback('সংবাদটি সফলভাবে ডাটাবেজে সংরক্ষণ ও প্রকাশিত হয়েছে!');
      setErrorMessage('');
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsVideoUrl('');
      setNewsSeoTitle('');
      setNewsSeoDescription('');
      setNewsSeoKeywords('');
      setTimeout(() => {
        setFeedback('');
        setActiveTab('news');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'সংবাদটি ডাটাবেজে সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatSlug.trim()) return;
    try {
      await onAddCategory({
        id: Date.now(),
        name: newCatName.trim(),
        slug: newCatSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        display_order: categories.length + 1,
        status: 'active'
      });
      setNewCatName('');
      setNewCatSlug('');
      setFeedback('নতুন ক্যাটাগরি যুক্ত করা হয়েছে!');
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ক্যাটাগরি যুক্ত করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateSettings(localSettings);
      setFeedback('সাইট সেটিংস সফলভাবে আপডেট হয়েছে!');
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      console.error('Settings update error:', err);
      setErrorMessage(err.message || 'সেটিংস সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  // Blog Handlers
  const handleAutoCalcReadingTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const mins = Math.max(1, Math.round(words / 150));
    setBlogReadingTime(mins);
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) {
      setFeedback('অনুগ্রহ করে ব্লগের শিরোনাম এবং বিস্তারিত কন্টেন্ট পূরণ করুন।');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const finalTag = blogCategoryTag === 'অন্যান্য' && customBlogTag.trim() 
      ? customBlogTag.trim() 
      : blogCategoryTag;

    const finalContent = blogContent.trim().startsWith('<')
      ? blogContent.trim()
      : blogContent
          .split('\n\n')
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('\n');

    const tagsArray = blogTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newBlogPost: BlogPost = {
      id: Date.now(),
      title: blogTitle.trim(),
      slug: blogTitle.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-'),
      summary: blogSummary.trim() || blogContent.trim().slice(0, 140) + '...',
      content: finalContent || `<p>${blogContent.trim()}</p>`,
      author_name: blogAuthorName.trim() || 'কলামিস্ট',
      author_role: blogAuthorRole.trim() || 'লেখক ও গবেষক',
      author_avatar: blogAuthorAvatar.trim(),
      cover_image: blogCoverImage.trim() || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
      video_url: blogVideoUrl.trim() || undefined,
      category_tag: finalTag,
      reading_time_min: Number(blogReadingTime) || 3,
      views: 0,
      likes: 0,
      is_featured: blogIsFeatured,
      status: blogStatus,
      published_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      tags: tagsArray,
      seo_title: blogSeoTitle.trim() || blogTitle.trim(),
      seo_description: blogSeoDescription.trim() || blogSummary.trim(),
      seo_keywords: blogSeoKeywords.trim()
    };

    try {
      if (onAddBlog) {
        await onAddBlog(newBlogPost);
      }
      setFeedback('অভিনন্দন! আপনার ব্লগটি সফলভাবে প্রকাশিত হয়েছে।');
      setErrorMessage('');
      setBlogTitle('');
      setBlogSummary('');
      setBlogContent('');
      setBlogVideoUrl('');
      setCustomBlogTag('');
      setBlogSeoTitle('');
      setBlogSeoDescription('');
      setBlogSeoKeywords('');
      setTimeout(() => {
        setFeedback('');
        setActiveTab('blogs');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'ব্লগ প্রকাশ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleStartEditBlog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setEditBlogTitle(blog.title);
    setEditBlogCategoryTag(blog.category_tag);
    setEditBlogSummary(blog.summary);
    setEditBlogContent(blog.content);
    setEditBlogAuthorName(blog.author_name);
    setEditBlogAuthorRole(blog.author_role);
    setEditBlogAuthorAvatar(blog.author_avatar || '');
    setEditBlogCoverImage(blog.cover_image);
    setEditBlogVideoUrl(blog.video_url || '');
    setEditBlogReadingTime(blog.reading_time_min);
    setEditBlogIsFeatured(blog.is_featured);
    setEditBlogStatus(blog.status);
    setEditBlogViews(blog.views);
    setEditBlogLikes(blog.likes);
    setEditBlogTagsInput((blog.tags || []).join(', '));
    setEditBlogSeoTitle(blog.seo_title || blog.title);
    setEditBlogSeoDescription(blog.seo_description || blog.summary || '');
    setEditBlogSeoKeywords(blog.seo_keywords || '');
  };

  const handleSaveEditBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    const finalContent = editBlogContent.trim().startsWith('<')
      ? editBlogContent.trim()
      : editBlogContent
          .split('\n\n')
          .map(p => p.trim())
          .filter(p => p.length > 0)
          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('\n');

    const tagsArray = editBlogTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const updatedBlog: BlogPost = {
      ...editingBlog,
      title: editBlogTitle.trim(),
      category_tag: editBlogCategoryTag.trim(),
      summary: editBlogSummary.trim(),
      content: finalContent || `<p>${editBlogContent.trim()}</p>`,
      author_name: editBlogAuthorName.trim(),
      author_role: editBlogAuthorRole.trim(),
      author_avatar: editBlogAuthorAvatar.trim(),
      cover_image: editBlogCoverImage.trim(),
      video_url: editBlogVideoUrl.trim() || undefined,
      reading_time_min: Number(editBlogReadingTime) || 3,
      is_featured: editBlogIsFeatured,
      status: editBlogStatus,
      views: Number(editBlogViews) || 0,
      likes: Number(editBlogLikes) || 0,
      tags: tagsArray,
      seo_title: editBlogSeoTitle.trim() || editBlogTitle.trim(),
      seo_description: editBlogSeoDescription.trim() || editBlogSummary.trim(),
      seo_keywords: editBlogSeoKeywords.trim()
    };

    try {
      if (onUpdateBlog) {
        await onUpdateBlog(updatedBlog);
      }
      setEditingBlog(null);
      setFeedback('ব্লগ পোস্টটি সফলভাবে হালনাগাদ করা হয়েছে!');
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ব্লগ হালনাগাদ করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleCancelEditBlog = () => {
    setEditingBlog(null);
  };

  const handleDeleteBlogAction = async (id: number) => {
    if (!window.confirm('আপনি কি এই ব্লগটি মুছে ফেলতে চান?')) return;
    try {
      if (onDeleteBlog) {
        await onDeleteBlog(id);
      }
      setFeedback('ব্লগটি সফলভাবে মুছে ফেলা হয়েছে।');
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'ব্লগ মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const handleToggleBlogStatus = async (blog: BlogPost) => {
    if (!onUpdateBlog) return;
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      await onUpdateBlog({ ...blog, status: newStatus });
      setFeedback(`ব্লগ স্ট্যাটাস '${newStatus === 'published' ? 'প্রকাশিত' : 'ড্রাফট'}' করা হয়েছে`);
      setErrorMessage('');
      setTimeout(() => setFeedback(''), 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'ব্লগ স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-bengali-body">
      {/* Mobile Sticky Top Header (< md screens) */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            aria-label="অ্যাডমিন মেনু খুলুন বা বন্ধ করুন"
          >
            {isMobileNavOpen ? <X className="w-5 h-5 text-red-400" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block leading-none">
              বার্তাচিত্র সিএমএস
            </span>
            <h2 className="text-sm font-bold text-white font-bengali-display flex items-center gap-1.5 mt-0.5">
              <span>{tabTitles[activeTab] || 'অ্যাডমিন প্যানেল'}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadMessages > 0 && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('messages');
                setIsMobileNavOpen(false);
              }}
              className="relative p-1.5 rounded-lg bg-amber-950/60 border border-amber-600/50 text-amber-300 transition-transform active:scale-95"
              title="অপঠিত বার্তা দেখুন"
            >
              <Mail className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center font-mono">
                {bnNum(unreadMessages)}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onCloseAdmin}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 cursor-pointer transition-colors"
            title="মূল সাইটে ফিরুন"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-semibold hidden xs:inline">সাইট</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Slide-out navigation menu for mobile screens) */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-slate-950 border-r border-slate-800 h-full flex flex-col justify-between p-4 z-10 overflow-y-auto shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">বার্তাচিত্র সিএমএস</span>
                  <h2 className="text-lg font-bold text-white font-bengali-display">অ্যাডমিন মেনু</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links for mobile drawer */}
              <nav className="space-y-1 text-xs font-semibold">
                <button
                  onClick={() => { setActiveTab('dashboard'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
                </button>
                <button
                  onClick={() => { setActiveTab('analytics'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'analytics' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> অ্যানালিটিক্স
                </button>
                <button
                  onClick={() => { setActiveTab('news'); setIsMobileNavOpen(false); }}
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
                  onClick={() => { setActiveTab('add_news'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'add_news' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> নতুন সংবাদ প্রকাশ
                </button>
                <button
                  onClick={() => { setActiveTab('media'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'media' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Image className="w-4 h-4 text-indigo-400" /> মিডিয়া লাইব্রেরি
                </button>
                <button
                  onClick={() => { setActiveTab('categories'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'categories' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FolderTree className="w-4 h-4" /> ক্যাটাগরি ব্যবস্থাপনা
                </button>
                <button
                  onClick={() => { setActiveTab('breaking'); setIsMobileNavOpen(false); }}
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
                  onClick={() => { setActiveTab('blogs'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'blogs' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" /> ব্লগ ও চিন্তাধারা
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                    {bnNum(totalBlogs)}
                  </span>
                </button>
                <button
                  onClick={() => { setActiveTab('add_blog'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'add_blog' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <PenTool className="w-4 h-4 text-amber-400" /> নতুন ব্লগ লিখুন
                </button>
                <button
                  onClick={() => { setActiveTab('export_import'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'export_import' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Database className="w-4 h-4 text-amber-400" /> এক্সপোর্ট ও ইমপোর্ট
                </button>
                <button
                  onClick={() => { setActiveTab('ads'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'ads' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Image className="w-4 h-4" /> বিজ্ঞাপন ব্যবস্থাপনা
                </button>
                <button
                  onClick={() => { setActiveTab('messages'); setIsMobileNavOpen(false); }}
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
                  onClick={() => { setActiveTab('users'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'users' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> অ্যাডমিন রোল
                  </span>
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                    {bnNum(users.length)} জন
                  </span>
                </button>
                <button
                  onClick={() => { setActiveTab('settings'); setIsMobileNavOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'settings' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sliders className="w-4 h-4" /> সাইট সেটিংস
                </button>
              </nav>
            </div>

            {/* Mobile Drawer Footer User Profile */}
            <div className="border-t border-slate-800 pt-4 mt-6">
              <div className="flex items-center gap-2.5 mb-3">
                {currentAdminUser.avatar ? (
                  <img 
                    src={currentAdminUser.avatar} 
                    alt={currentAdminUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-red-700" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-xs">
                    {currentAdminUser.name.charAt(0)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{currentAdminUser.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentAdminUser.role === 'super_admin' ? 'সুপার অ্যাডমিন' : currentAdminUser.role === 'editor' ? 'সম্পাদক' : 'মডারেটর'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => { setShowPasswordModal(true); setIsMobileNavOpen(false); }}
                className="w-full mb-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> 
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
              </button>
              <button 
                onClick={onCloseAdmin}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" /> মূল সাইট দেখুন
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="w-full mt-2 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" /> লগআউট করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="hidden md:flex md:w-64 bg-slate-950 border-r border-slate-800 p-4 shrink-0 flex-col justify-between min-h-screen sticky top-0 h-screen overflow-y-auto">
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
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" /> অ্যানালিটিক্স
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
              onClick={() => setActiveTab('media')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'media' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4 text-indigo-400" /> মিডিয়া লাইব্রেরি
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

            {/* Blogs Management Tab */}
            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'blogs' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" /> ব্লগ ও চিন্তাধারা
              </span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                {bnNum(totalBlogs)}
              </span>
            </button>

            {/* Write Blog Tab */}
            <button
              onClick={() => setActiveTab('add_blog')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'add_blog' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <PenTool className="w-4 h-4 text-amber-400" /> নতুন ব্লগ লিখুন
            </button>

            {/* Export / Import Data */}
            <button
              onClick={() => setActiveTab('export_import')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer ${
                activeTab === 'export_import' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4 text-amber-400" /> এক্সপোর্ট ও ইমপোর্ট
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

            {/* Multi-admin & Role Management */}
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-red-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> অ্যাডমিন রোল
              </span>
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                {bnNum(users.length)} জন
              </span>
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
            {currentAdminUser.avatar ? (
              <img 
                src={currentAdminUser.avatar} 
                alt={currentAdminUser.name}
                className="w-8 h-8 rounded-full object-cover border border-red-700" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-xs">
                {currentAdminUser.name.charAt(0)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentAdminUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentAdminUser.role === 'super_admin' ? 'সুপার অ্যাডমিন' : currentAdminUser.role === 'editor' ? 'সম্পাদক' : 'মডারেটর'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="w-full mb-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold shadow-xs"
            title="আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" /> 
            <span>পাসওয়ার্ড পরিবর্তন করুন</span>
          </button>
          <button 
            onClick={onCloseAdmin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" /> মূল সাইট দেখুন
          </button>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="w-full mt-2 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs py-2 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-semibold"
              title="অ্যাডমিন সেশন থেকে লগআউট করুন"
            >
              <LogOut className="w-3.5 h-3.5" /> লগআউট করুন
            </button>
          )}
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-3.5 sm:p-5 md:p-8 overflow-y-auto min-h-screen md:max-h-screen w-full min-w-0">
        {/* Top Quick Status & Actions Bar */}
        <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 rounded-xl mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-medium">
              লগইন আছেন: <strong className="text-white">{currentAdminUser.name}</strong> 
              <span className="text-slate-400 text-[11px] ml-1.5 font-mono">
                ({currentAdminUser.role === 'super_admin' ? 'সুপার অ্যাডমিন' : currentAdminUser.role === 'editor' ? 'সম্পাদক' : 'মডারেটর'})
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer font-semibold shadow-xs"
              title="পাসওয়ার্ড পরিবর্তন করুন (পুরাতন, নতুন ও নিশ্চিতকরণ পাসওয়ার্ড)"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" /> 
              <span>পাসওয়ার্ড পরিবর্তন</span>
            </button>
            <button 
              onClick={onCloseAdmin}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" /> 
              <span className="hidden sm:inline">মূল সাইট</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-emerald-900/80 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg mb-6 flex items-center justify-between gap-2 text-sm shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback('')} className="text-emerald-300 hover:text-white p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/90 border border-red-600 text-red-100 px-4 py-3 rounded-lg mb-6 flex items-center justify-between gap-2 text-sm shadow-md animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-red-300 hover:text-white p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
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

            {/* Quick Access Feature Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className="bg-gradient-to-br from-slate-850 to-slate-900 border border-emerald-500/40 hover:border-emerald-500 p-4 rounded-xl text-left transition-all hover:-translate-y-0.5 shadow-lg group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-bengali-display flex items-center justify-between">
                  <span>অ্যানালিটিক্স ড্যাশবোর্ড</span>
                  <span className="text-xs text-emerald-400">→</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  আজকের/সাপ্তাহিক ভিউ, সেরা পঠিত সংবাদ ও ক্যাটাগরি বিশ্লেষণ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className="bg-gradient-to-br from-slate-850 to-slate-900 border border-indigo-500/40 hover:border-indigo-500 p-4 rounded-xl text-left transition-all hover:-translate-y-0.5 shadow-lg group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                  <Image className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-bengali-display flex items-center justify-between">
                  <span>প্রফেশনাল মিডিয়া লাইব্রেরি</span>
                  <span className="text-xs text-indigo-400">→</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  সব আপলোড করা ছবি, সার্চ, রিইউজ, সাইজ ও অল্ট টেক্সট ব্যবস্থাপনা
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('export_import')}
                className="bg-gradient-to-br from-slate-850 to-slate-900 border border-amber-500/40 hover:border-amber-500 p-4 rounded-xl text-left transition-all hover:-translate-y-0.5 shadow-lg group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white font-bengali-display flex items-center justify-between">
                  <span>ডাটা এক্সপোর্ট ও ইমপোর্ট</span>
                  <span className="text-xs text-amber-400">→</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  ১-ক্লিকে সকল সংবাদ ও ব্লগের ব্যাকআপ ডাউনলোড ও ডাটাবেজ রিস্টোর
                </p>
              </button>
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
                <table className="w-full min-w-[550px] text-left text-xs">
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

            {/* Advanced Search & Filtering Controls */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow space-y-3.5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">উন্নত অনুসন্ধান ও ফিল্টার (Advanced Search)</span>
                </div>
                {(newsSearchQuery || newsCategoryFilter !== 'all' || newsAuthorFilter !== 'all' || newsDatePreset !== 'all' || newsSortBy !== 'newest') && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewsSearchQuery('');
                      setNewsCategoryFilter('all');
                      setNewsAuthorFilter('all');
                      setNewsDatePreset('all');
                      setNewsCustomStartDate('');
                      setNewsCustomEndDate('');
                      setNewsSortBy('newest');
                      setNewsPage(1);
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>সব ফিল্টার মুছুন</span>
                  </button>
                )}
              </div>

              {/* Filter inputs row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Keyword search */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">কীওয়ার্ড / শিরোনাম / বিবরণ</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={newsSearchQuery}
                      onChange={(e) => {
                        setNewsSearchQuery(e.target.value);
                        setNewsPage(1);
                      }}
                      placeholder="অনুসন্ধান করুন..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8.5 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                    {newsSearchQuery && (
                      <button 
                        onClick={() => {
                          setNewsSearchQuery('');
                          setNewsPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                        title="মুছুন"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">ক্যাটাগরি</label>
                  <select
                    value={newsCategoryFilter}
                    onChange={(e) => {
                      setNewsCategoryFilter(e.target.value);
                      setNewsPage(1);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="all">সকল ক্যাটাগরি ({bnNum(totalNews)})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({bnNum(newsList.filter(n => n.category_id === c.id).length)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Author */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">প্রতিবেদক / লেখক</label>
                  <select
                    value={newsAuthorFilter}
                    onChange={(e) => {
                      setNewsAuthorFilter(e.target.value);
                      setNewsPage(1);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="all">সকল লেখক / প্রতিবেদক</option>
                    {newsAuthors.map((author, idx) => (
                      <option key={idx} value={author}>
                        {author} ({bnNum(newsList.filter(n => n.author_name?.trim() === author).length)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Date range presets */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">তারিখ পরিসীমা (Date Range)</label>
                  <select
                    value={newsDatePreset}
                    onChange={(e) => {
                      setNewsDatePreset(e.target.value as any);
                      setNewsPage(1);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="all">সব সময়</option>
                    <option value="today">আজকের প্রকাশিত (২৪ ঘণ্টা)</option>
                    <option value="7days">গত ৭ দিন</option>
                    <option value="30days">গত ৩০ দিন</option>
                    <option value="custom">নির্দিষ্ট তারিখ নির্বাচন...</option>
                  </select>
                </div>
              </div>

              {/* Custom Date Range Row (If selected) */}
              {newsDatePreset === 'custom' && (
                <div className="pt-2 border-t border-slate-700/50 flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">কাস্টম রেঞ্জ:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">শুরু:</span>
                    <input
                      type="date"
                      value={newsCustomStartDate}
                      onChange={(e) => {
                        setNewsCustomStartDate(e.target.value);
                        setNewsPage(1);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">শেষ:</span>
                    <input
                      type="date"
                      value={newsCustomEndDate}
                      onChange={(e) => {
                        setNewsCustomEndDate(e.target.value);
                        setNewsPage(1);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Sorting and result count */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/40 text-xs">
                <span className="text-slate-400 text-[11px]">
                  ফিল্টারে মোট <strong className="text-emerald-400">{bnNum(filteredNewsList.length)}</strong> টি ফলাফল পাওয়া গেছে
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">সাজান:</span>
                    <select
                      value={newsSortBy}
                      onChange={(e) => setNewsSortBy(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="newest">সর্বশেষ প্রকাশিত</option>
                      <option value="oldest">সবচেয়ে পুরাতন</option>
                      <option value="views">সর্বাধিক পঠিত (Most Read)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">প্রতি পৃষ্ঠায়:</span>
                    <select
                      value={newsPerPage}
                      onChange={(e) => {
                        setNewsPerPage(Number(e.target.value));
                        setNewsPage(1);
                      }}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value={10}>১০টি</option>
                      <option value={15}>১৫টি</option>
                      <option value={25}>২৫টি</option>
                      <option value={50}>৫০টি</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
              {/* Mobile View: Cards Feed (< sm) */}
              <div className="block sm:hidden divide-y divide-slate-700">
                {paginatedNewsList.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    কোনো সংবাদ খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                  </div>
                ) : (
                  paginatedNewsList.map((n) => (
                    <div key={n.id} className="p-3.5 space-y-2.5">
                      <div className="flex gap-3">
                        <img 
                          src={n.featured_image} 
                          alt="" 
                          className="w-20 h-16 object-cover rounded-lg shrink-0 border border-slate-700" 
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-red-400 block mb-0.5">
                            {n.category_name}
                          </span>
                          <h3 className="font-bold text-white text-xs line-clamp-2 leading-snug">
                            {n.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {n.author_name} • {bnDate(n.published_at, false)}
                          </p>
                        </div>
                      </div>

                      {/* Meta badges and Quick toggles */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-750 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-mono text-[11px]">
                            {bnNum(n.views)} ভিউ
                          </span>
                          <button
                            onClick={() => handleToggleNewsBreaking(n)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              n.is_breaking ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            ব্রেকিং: {n.is_breaking ? 'হ্যাঁ' : 'না'}
                          </button>
                          <button
                            onClick={() => handleToggleNewsFeatured(n)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                              n.is_featured ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {n.is_featured ? '★ লিড' : 'সাধারণ'}
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditNews(n)}
                            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="সংবাদ সম্পাদনা করুন"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>এডিট</span>
                          </button>
                          <button
                            onClick={() => handleDeleteNewsClick(n.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-700 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View: Table (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
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
                    {paginatedNewsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          কোনো সংবাদ খুঁজে পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                        </td>
                      </tr>
                    ) : (
                      paginatedNewsList.map((n) => (
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
                              onClick={() => handleToggleNewsBreaking(n)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                n.is_breaking ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {n.is_breaking ? 'হ্যাঁ' : 'না'}
                            </button>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleNewsFeatured(n)}
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
                                onClick={() => handleDeleteNewsClick(n.id)}
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

              {/* Search Result Pagination Bar */}
              {totalNewsPages > 1 && (
                <div className="p-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 text-xs">
                  <span className="text-slate-400">
                    পৃষ্ঠা <strong className="text-white">{bnNum(currentNewsPage)}</strong> এর <strong className="text-white">{bnNum(totalNewsPages)}</strong> (মোট {bnNum(filteredNewsList.length)}টি সংবাদ)
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setNewsPage(prev => Math.max(1, prev - 1))}
                      disabled={currentNewsPage === 1}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 border border-slate-700"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>পূর্ববর্তী</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalNewsPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalNewsPages || Math.abs(p - currentNewsPage) <= 1)
                        .map((page, idx, arr) => {
                          const prev = arr[idx - 1];
                          return (
                            <React.Fragment key={page}>
                              {prev && page - prev > 1 && (
                                <span className="px-1 text-slate-500">...</span>
                              )}
                              <button
                                onClick={() => setNewsPage(page)}
                                className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
                                  page === currentNewsPage
                                    ? 'bg-red-700 text-white shadow'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                }`}
                              >
                                {bnNum(page)}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => setNewsPage(prev => Math.min(totalNewsPages, prev + 1))}
                      disabled={currentNewsPage === totalNewsPages}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 border border-slate-700"
                    >
                      <span>পরবর্তী</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
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
                <RichTextEditor
                  value={newsContent}
                  onChange={setNewsContent}
                  label="মূল সংবাদের বিবরণ (এম এস অফিসের মতো ছবি, ফন্ট, কালার ও ফরম্যাটিং যোগ করুন) *"
                  placeholder="এখানে সংবাদের পূর্ণাঙ্গ বিস্তারিত বিবরণ লিখুন। আপনি টুলবারের ছবি আইকনে ক্লিক করে সংবাদের ভেতরেও ছবি যুক্ত করতে পারেন..."
                />
              </div>

              <ImageUploader
                currentImage={newsImage}
                onImageChange={(url) => setNewsImage(url)}
                label="ফিচার্ড ছবি নির্বাচন বা আপলোড (Featured Image) *"
                helperText="কম্পিউটার বা মোবাইল থেকে ছবি আপলোড করুন অথবা সরাসরি ইমেজ ইউআরএল পেস্ট করুন"
              />

              <VideoUploader
                currentVideo={newsVideoUrl}
                onVideoChange={(url) => setNewsVideoUrl(url)}
                label="সংবাদের ভিডিও সংযুক্ত করুন (ঐচ্ছিক - Video Upload / YouTube Link)"
                helperText="কম্পিউটার বা মোবাইল থেকে সরাসরি ভিডিও আপলোড করুন (MP4, WebM) অথবা ইউটিউব ভিডিও লিংক পেস্ট করুন"
              />

              {/* SEO Friendly Optimization Section */}
              <div className="bg-slate-900/90 border border-slate-700/80 p-4 sm:p-5 rounded-xl space-y-4">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    এসইও ফ্রেন্ডলি সেটিংস (Google Search & Social Share SEO)
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      এসইও মেটা টাইটেল (SEO Title)
                    </label>
                    <input
                      type="text"
                      value={newsSeoTitle}
                      onChange={(e) => setNewsSeoTitle(e.target.value)}
                      placeholder={newsTitle || "গুগল সার্চ ফলাফলের টাইটেল..."}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      মেটা ডেসক্রিপশন (Meta Description - সার্চ ও ফেসবুকে দেখাবে)
                    </label>
                    <textarea
                      rows={2}
                      value={newsSeoDescription}
                      onChange={(e) => setNewsSeoDescription(e.target.value)}
                      placeholder={newsSummary || "সংবাদের সারসংক্ষেপ..."}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      এসইও কীওয়ার্ডস (Keywords - কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={newsSeoKeywords}
                      onChange={(e) => setNewsSeoKeywords(e.target.value)}
                      placeholder="যেমন: বাংলাদেশ সংবাদ, জাতীয়, রাজনীতি, অর্থনীতি"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <SeoMetaHelper
                  title={newsSeoTitle || newsTitle}
                  description={newsSeoDescription || newsSummary}
                  keywords={newsSeoKeywords}
                  slug={newsTitle ? newsTitle.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 45) : undefined}
                />
              </div>

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
          <div className="space-y-6">
            {/* Header & Instructions */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FolderTree className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-white font-bengali-display">ক্যাটাগরি ব্যবস্থাপনা ও ক্রম নিয়ন্ত্রণ</h2>
                  </div>
                  <p className="text-xs text-slate-300">
                    ক্যাটাগরিগুলো টেনে (<span className="text-cyan-400 font-bold">Drag & Drop</span>) উপরে-নিচে নামিয়ে পছন্দমতো ক্রম নির্ধারণ করুন। এডমিন প্যানেল থেকে যেভাবে ক্রম নির্ধারণ করবেন, হুবহু সেভাবেই ওয়েবসাইটের মেনু ও হোমপেজে প্রদর্শিত হবে।
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSavingCategoryOrder && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-3 py-1.5 rounded-lg shadow animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>ক্রম সংরক্ষণ হচ্ছে...</span>
                    </span>
                  )}
                  {orderSavedSuccess && !isSavingCategoryOrder && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg shadow">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>ক্রম ওয়েবসাইটে কার্যকর হয়েছে!</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveManualCategoryOrder}
                    disabled={isSavingCategoryOrder}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-600"
                    title="বর্তমান ক্রম ডাটাবেজে স্থায়ীভাবে নিশ্চিত করুন"
                  >
                    <ListOrdered className="w-4 h-4 text-cyan-400" />
                    <span>ক্রম নিশ্চিত ও সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span><strong className="text-slate-200">⠿ আইকন ধরে টানুন:</strong> যেকোনো ক্যাটাগরি উপরে বা নিচে নিয়ে যেতে বামের গ্রিপ ধরে টানুন</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span><strong className="text-slate-200">তীর বোতাম:</strong> এক ধাপ উপরে বা নিচে সরাতে তীর চিহ্নে ক্লিক করুন</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span><strong className="text-slate-200">শীর্ষ ৮টি:</strong> হেডারের মূল মেনুতে সরাসরি প্রদর্শিত হয়, বাকিগুলো 'আরও বিভাগ' মেনুতে</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add / Edit Category Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 h-fit shadow">
                <h3 className="text-base font-bold text-white font-bengali-display mb-3 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-red-500" />
                  <span>নতুন ক্যাটাগরি তৈরি</span>
                </h3>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ক্যাটাগরির নাম (বাংলা) *</label>
                    <input 
                      type="text" 
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="যেমন: বিজ্ঞান ও তথ্যপ্রযুক্তি"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">স্লাগ (Slug / English URL) *</label>
                    <input 
                      type="text" 
                      required
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="যেমন: tech-science"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 placeholder-slate-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 নতুন যুক্ত করা ক্যাটাগরি স্বয়ংক্রিয়ভাবে তালিকার শেষে অবস্থান করবে এবং পরবর্তীতে ইচ্ছামতো টেনে উপরে স্থানান্তর করা যাবে।
                  </p>
                  <button 
                    type="submit"
                    className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>ক্যাটাগরি যুক্ত করুন</span>
                  </button>
                </form>
              </div>

              {/* Category Order Table */}
              <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
                <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/40">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>বিদ্যমান ক্যাটাগরিসমূহ ({bnNum(orderedCategories.length)})</span>
                    <span className="text-xs text-slate-400 font-normal">| টেনে উপরে-নিচে নিয়ে সাজান</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    টেনে নামালে সাথে সাথে ওয়েবসাইটের মেনু ও হোমপেজে পরিবর্তন প্রযোজ্য হবে
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3 w-14 text-center">ক্রম</th>
                        <th className="p-3 w-28 text-center">স্থানান্তর</th>
                        <th className="p-3">ক্যাটাগরির নাম ও স্লাগ</th>
                        <th className="p-3 w-24">সংবাদ</th>
                        <th className="p-3 w-28 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 text-slate-200">
                      {orderedCategories.map((c, idx) => {
                        const count = newsList.filter(n => n.category_id === c.id).length;
                        const isDragging = draggedIndex === idx;
                        const isOver = dragOverIndex === idx;
                        const isTopMenu = idx < 8;

                        return (
                          <tr 
                            key={c.id}
                            draggable={true}
                            onDragStart={(e) => {
                              setDraggedIndex(idx);
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', String(idx));
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              if (dragOverIndex !== idx) {
                                setDragOverIndex(idx);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverIndex === idx) {
                                setDragOverIndex(null);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              handleDropCategory(idx);
                            }}
                            onDragEnd={() => {
                              setDraggedIndex(null);
                              setDragOverIndex(null);
                            }}
                            className={`transition-all duration-150 select-none ${
                              isDragging 
                                ? 'opacity-40 bg-slate-900 border-2 border-dashed border-cyan-500 scale-[0.99]' 
                                : isOver 
                                  ? 'bg-cyan-950/40 border-t-2 border-cyan-400' 
                                  : 'hover:bg-slate-750'
                            }`}
                          >
                            {/* 1. Order Position Badge */}
                            <td className="p-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`inline-block font-mono text-[11px] font-black px-2 py-0.5 rounded border ${
                                  isTopMenu 
                                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' 
                                    : 'bg-slate-900 text-slate-400 border-slate-700'
                                }`}>
                                  #{idx + 1}
                                </span>
                              </div>
                            </td>

                            {/* 2. Drag handle & Up/Down Arrows */}
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span 
                                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-cyan-400 p-1.5 rounded hover:bg-slate-700/80 transition-colors"
                                  title="মাউস দিয়ে চেপে ধরে উপরে বা নিচে টানুন"
                                >
                                  <GripVertical className="w-4 h-4" />
                                </span>

                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCategory(idx, 'up')}
                                    disabled={idx === 0 || isSavingCategoryOrder}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                                    title="এক ধাপ উপরে তুলুন"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveCategory(idx, 'down')}
                                    disabled={idx === orderedCategories.length - 1 || isSavingCategoryOrder}
                                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20 disabled:hover:text-slate-400 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                                    title="এক ধাপ নিচে নামান"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* 3. Name & Slug */}
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm font-bengali-display">{c.name}</span>
                                {isTopMenu ? (
                                  <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded font-semibold">
                                    মেনু বার
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded">
                                    আরও বিভাগ
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                slug: <span className="text-slate-300">{c.slug}</span>
                              </div>
                            </td>

                            {/* 4. News count */}
                            <td className="p-3">
                              <span className="text-amber-400 font-bold font-mono text-xs">
                                {bnNum(count)}টি
                              </span>
                            </td>

                            {/* 5. Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  type="button"
                                  onClick={() => handleStartEditCategory(c)}
                                  className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="ক্যাটাগরি সম্পাদনা করুন"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>এডিট</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleDeleteCategoryClick(c.id)}
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
              {/* Mobile View: Cards (< sm) */}
              <div className="block sm:hidden divide-y divide-slate-700">
                {newsList.map((n) => (
                  <div key={n.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-red-400 block mb-0.5">{n.category_name}</span>
                      <p className="font-semibold text-white text-xs line-clamp-2">{n.title}</p>
                    </div>
                    <button
                      onClick={() => handleToggleNewsBreaking(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                        n.is_breaking ? 'bg-red-700 text-white shadow-sm' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {n.is_breaking ? 'টিকারে চলছে' : 'বন্ধ'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop View: Table (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[500px] text-left text-xs">
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
                            onClick={() => handleToggleNewsBreaking(n)}
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
          </div>
        )}

        {/* TAB: BLOGS LIST */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-white font-bengali-display flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-red-500" />
                  ব্লগ ও চিন্তাধারা ব্যবস্থাপনা
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  মোট {bnNum(totalBlogs)}টি ব্লগের মধ্যে {bnNum(filteredBlogs.length)}টি প্রদর্শিত হচ্ছে | প্রকাশিত: {bnNum(publishedBlogs)} | মোট পাঠক ভিউ: {bnNum(totalBlogViews)}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('add_blog')}
                className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-md shrink-0"
              >
                <PenTool className="w-4 h-4 text-amber-300" /> নতুন ব্লগ লিখুন
              </button>
            </div>

            {/* Filter and Search Bar for Blogs */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={blogSearchQuery}
                  onChange={(e) => setBlogSearchQuery(e.target.value)}
                  placeholder="ব্লগের শিরোনাম, লেখক বা বিষয় দিয়ে খুঁজুন..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white focus:outline-none focus:border-red-500 placeholder-slate-500"
                />
                {blogSearchQuery && (
                  <button 
                    onClick={() => setBlogSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={blogCategoryFilter}
                  onChange={(e) => setBlogCategoryFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="all">সকল বিষয় / ট্যাগ</option>
                  <option value="মতামত ও কলাম">মতামত ও কলাম</option>
                  <option value="প্রযুক্তি ও ভবিষ্যৎ">প্রযুক্তি ও ভবিষ্যৎ</option>
                  <option value="জীবনযাপন ও মনন">জীবনযাপন ও মনন</option>
                  <option value="সাহিত্য ও সংস্কৃতি">সাহিত্য ও সংস্কৃতি</option>
                  <option value="ক্যারিয়ার ও শিক্ষা">ক্যারিয়ার ও শিক্ষা</option>
                  <option value="পরিবেশ ও প্রকৃতি">পরিবেশ ও প্রকৃতি</option>
                  <option value="আন্তর্জাতিক ভাবনা">আন্তর্জাতিক ভাবনা</option>
                </select>

                {(blogSearchQuery || blogCategoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setBlogSearchQuery('');
                      setBlogCategoryFilter('all');
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    রিসেট
                  </button>
                )}
              </div>
            </div>

            {/* Blogs Table / Card Feed */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden shadow">
              {/* Mobile View: Cards Feed (< sm) */}
              <div className="block sm:hidden divide-y divide-slate-700">
                {filteredBlogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-300 mb-1">কোনো ব্লগ পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-500 mb-3">আপনার সার্চ বা ফিল্টারের সাথে কোনো ব্লগের মিল নেই।</p>
                    <button
                      onClick={() => setActiveTab('add_blog')}
                      className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold"
                    >
                      <PlusCircle className="w-4 h-4" /> প্রথম ব্লগ লিখুন
                    </button>
                  </div>
                ) : (
                  filteredBlogs.map((b) => (
                    <div key={b.id} className="p-3.5 space-y-2.5">
                      <div className="flex gap-3">
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-20 h-16 object-cover rounded-lg shrink-0 border border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="bg-red-950 text-red-300 border border-red-800/80 px-1.5 py-0.2 rounded text-[10px] font-bold">
                              {b.category_tag}
                            </span>
                            {b.is_featured && (
                              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                                ★ ফিচার্ড
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-white text-xs line-clamp-2 leading-snug" title={b.title}>
                            {b.title}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {b.author_name} ({b.author_role})
                          </p>
                        </div>
                      </div>

                      {/* Meta stats and action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-750 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-mono text-[11px]">
                            {bnNum(b.views)} ভিউ
                          </span>
                          <button
                            onClick={() => handleToggleBlogStatus(b)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                              b.status === 'published'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                                : 'bg-slate-800 text-slate-400 border-slate-600'
                            }`}
                          >
                            {b.status === 'published' ? '● প্রকাশিত' : '○ ড্রাফট'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditBlog(b)}
                            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="সম্পাদনা করুন"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>এডিট</span>
                          </button>
                          <button
                            onClick={() => handleDeleteBlogAction(b.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-700 cursor-pointer transition-colors"
                            title="ব্লগ মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop View: Table (>= sm) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">কাভার ও শিরোনাম</th>
                      <th className="p-3.5">বিষয় / ট্যাগ</th>
                      <th className="p-3.5">লেখক ও পদবী</th>
                      <th className="p-3.5 text-center">পড়ার সময়</th>
                      <th className="p-3.5 text-center">পাঠক ও লাইক</th>
                      <th className="p-3.5 text-center">স্ট্যাটাস</th>
                      <th className="p-3.5 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/80 text-slate-200">
                    {filteredBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">
                          <p className="font-bold text-sm text-slate-300 mb-1">কোনো ব্লগ পাওয়া যায়নি</p>
                          <p className="text-xs text-slate-500 mb-3">আপনার সার্চ বা ফিল্টারের সাথে কোনো ব্লগের মিল নেই।</p>
                          <button
                            onClick={() => setActiveTab('add_blog')}
                            className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                          >
                            <PlusCircle className="w-4 h-4" /> প্রথম ব্লগ লিখুন
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredBlogs.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-700/40 transition-colors">
                          <td className="p-3.5 max-w-sm">
                            <div className="flex items-center gap-3">
                              <img
                                src={b.cover_image}
                                alt={b.title}
                                className="w-14 h-11 object-cover rounded-lg shrink-0 border border-slate-700"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-white text-xs leading-snug truncate" title={b.title}>
                                  {b.title}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {b.summary}
                                </p>
                                {b.is_featured && (
                                  <span className="inline-block mt-1 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded">
                                    ★ ফিচার্ড ব্লগ
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="bg-red-950/80 text-red-300 border border-red-800/80 px-2 py-1 rounded text-[11px] font-bold inline-block">
                              {b.category_tag}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {b.author_avatar ? (
                                <img
                                  src={b.author_avatar}
                                  alt={b.author_name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs">
                                  {b.author_name[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-200 text-xs leading-tight">{b.author_name}</p>
                                <p className="text-[10px] text-slate-400">{b.author_role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-center text-slate-300 text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {bnNum(b.reading_time_min)} মিনিট
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="space-y-0.5">
                              <span className="text-amber-400 text-xs font-bold block">
                                {bnNum(b.views)} ভিউ
                              </span>
                              <span className="text-rose-400 text-[10px] font-medium flex items-center justify-center gap-0.5">
                                <Heart className="w-2.5 h-2.5 fill-rose-400" />
                                {bnNum(b.likes)}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => handleToggleBlogStatus(b)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                                b.status === 'published'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                                  : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700'
                              }`}
                              title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                            >
                              {b.status === 'published' ? '● প্রকাশিত' : '○ ড্রাফট'}
                            </button>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEditBlog(b)}
                                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="সম্পাদনা করুন"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>এডিট</span>
                              </button>
                              <button
                                onClick={() => handleDeleteBlogAction(b.id)}
                                className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-slate-700 cursor-pointer transition-colors"
                                title="ব্লগ মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
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

        {/* TAB: ADD BLOG WRITING STUDIO */}
        {activeTab === 'add_blog' && (
          <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-white font-bengali-display flex items-center gap-2">
                  <PenTool className="w-6 h-6 text-amber-400" />
                  নতুন চিন্তাশীল ব্লগ ও কলাম লিখুন
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  মতামত, সমসাময়িক বিশ্লেষণ বা মুক্তচিন্তার নিবন্ধ তৈরি ও প্রকাশ করুন।
                </p>
              </div>
              <button
                onClick={() => setActiveTab('blogs')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> সকল ব্লগ তালিকায় ফিরুন
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Main Writing Canvas (8 cols) */}
                <div className="lg:col-span-8 space-y-5">
                  {/* Blog Title */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 sm:p-5 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      ব্লগের আকর্ষণীয় শিরোনাম (Blog Headline / Title) *
                    </label>
                    <input
                      type="text"
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="যেমন: কৃত্রিম বুদ্ধিমত্তা ও আগামীর কর্মসংস্থান: আশাবাদ বনাম শঙ্কা..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-bengali-display focus:outline-none focus:border-red-500 font-bold"
                    />
                  </div>

                  {/* Summary / Excerpt */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 sm:p-5 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      সংক্ষেপ বা ভূমিকা (Short Excerpt / Intro) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={blogSummary}
                      onChange={(e) => setBlogSummary(e.target.value)}
                      placeholder="ব্লগের মূল সুর বা পাঠকের দৃষ্টি আকর্ষণকারী সূচনা (২-৩ বাক্য)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 leading-relaxed"
                    />
                  </div>

                  {/* Full Content */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 sm:p-5 rounded-xl space-y-2">
                    <RichTextEditor
                      value={blogContent}
                      onChange={(val) => {
                        setBlogContent(val);
                        handleAutoCalcReadingTime(val.replace(/<[^>]*>/g, ' '));
                      }}
                      label="বিস্তারিত ব্লগ কন্টেন্ট (এম এস অফিসের মতো ছবি, ফন্ট, কালার ও ফরম্যাটিং যোগ করুন) *"
                      placeholder="এখানে আপনার ব্লগের পূর্ণাঙ্গ লেখাটি লিখুন। ইমেজ বাটন দিয়ে লেখার মাঝে যেকোনো জায়গায় ছবি যুক্ত করতে পারেন..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 sm:p-5 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      ব্লগের ট্যাগসমূহ (Tags - কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={blogTagsInput}
                      onChange={(e) => setBlogTagsInput(e.target.value)}
                      placeholder="যেমন: মতামত, প্রযুক্তি, বিজ্ঞান, আগামী"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* SEO Friendly Optimization Section for Blog */}
                  <div className="bg-slate-900/90 border border-slate-700/80 p-4 sm:p-5 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        এসইও অপটিমাইজেশন (Google Search & Social Share SEO)
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          এসইও মেটা টাইটেল (SEO Title)
                        </label>
                        <input
                          type="text"
                          value={blogSeoTitle}
                          onChange={(e) => setBlogSeoTitle(e.target.value)}
                          placeholder={blogTitle || "গুগল সার্চ ফলাফলের টাইটেল..."}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          মেটা ডেসক্রিপশন (Meta Description - সার্চে দেখাবে)
                        </label>
                        <textarea
                          rows={2}
                          value={blogSeoDescription}
                          onChange={(e) => setBlogSeoDescription(e.target.value)}
                          placeholder={blogSummary || "ব্লগের সারসংক্ষেপ..."}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          কীওয়ার্ডস (Keywords - কমা দিয়ে আলাদা করুন)
                        </label>
                        <input
                          type="text"
                          value={blogSeoKeywords}
                          onChange={(e) => setBlogSeoKeywords(e.target.value)}
                          placeholder="যেমন: মতামত, বিশ্লেষণ, সাহিত্য, মুক্তচিন্তা"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <SeoMetaHelper
                      title={blogSeoTitle || blogTitle}
                      description={blogSeoDescription || blogSummary}
                      keywords={blogSeoKeywords}
                      slug={blogTitle ? blogTitle.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').slice(0, 45) : undefined}
                    />
                  </div>
                </div>

                {/* Right: Author, Cover & Publication Metadata (4 cols) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Category / Topic */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-2.5">
                    <label className="block text-xs font-bold text-slate-200">
                      বিষয় / ক্যাটাগরি ট্যাগ *
                    </label>
                    <select
                      value={blogCategoryTag}
                      onChange={(e) => setBlogCategoryTag(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="মতামত ও কলাম">মতামত ও কলাম</option>
                      <option value="প্রযুক্তি ও ভবিষ্যৎ">প্রযুক্তি ও ভবিষ্যৎ</option>
                      <option value="জীবনযাপন ও মনন">জীবনযাপন ও মনন</option>
                      <option value="সাহিত্য ও সংস্কৃতি">সাহিত্য ও সংস্কৃতি</option>
                      <option value="ক্যারিয়ার ও শিক্ষা">ক্যারিয়ার ও শিক্ষা</option>
                      <option value="পরিবেশ ও প্রকৃতি">পরিবেশ ও প্রকৃতি</option>
                      <option value="আন্তর্জাতিক ভাবনা">আন্তর্জাতিক ভাবনা</option>
                      <option value="অন্যান্য">অন্যান্য (নিজে লিখুন)</option>
                    </select>

                    {blogCategoryTag === 'অন্যান্য' && (
                      <input
                        type="text"
                        value={customBlogTag}
                        onChange={(e) => setCustomBlogTag(e.target.value)}
                        placeholder="কাস্টম বিষয়ের নাম লিখুন..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    )}
                  </div>

                  {/* Author Details */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      লেখকের তথ্য ও পরিচিতি
                    </h3>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        লেখকের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        value={blogAuthorName}
                        onChange={(e) => setBlogAuthorName(e.target.value)}
                        placeholder="লেখকের পূর্ণ নাম"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        লেখকের পদবী বা পরিচয় *
                      </label>
                      <input
                        type="text"
                        required
                        value={blogAuthorRole}
                        onChange={(e) => setBlogAuthorRole(e.target.value)}
                        placeholder="যেমন: সিনিয়র কলামিস্ট, প্রযুক্তি গবেষক"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        লেখকের ছবি / অবতার URL
                      </label>
                      <input
                        type="url"
                        value={blogAuthorAvatar}
                        onChange={(e) => setBlogAuthorAvatar(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 text-[11px]"
                      />
                      {/* Quick Avatar Presets */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-slate-400">দ্রুত নির্বাচন:</span>
                        {[
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face'
                        ].map((preset, idx) => (
                          <img
                            key={idx}
                            src={preset}
                            alt="avatar"
                            onClick={() => setBlogAuthorAvatar(preset)}
                            className="w-6 h-6 rounded-full object-cover border border-slate-600 hover:border-red-400 cursor-pointer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
                    <label className="block text-xs font-bold text-slate-200">
                      ব্লগের কাভার ছবি (Cover Image)
                    </label>
                    <ImageUploader
                      currentImage={blogCoverImage}
                      onImageChange={(url) => setBlogCoverImage(url)}
                      onImageSelected={(url) => setBlogCoverImage(url)}
                    />
                  </div>

                  {/* Blog Video */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
                    <VideoUploader
                      currentVideo={blogVideoUrl}
                      onVideoChange={(url) => setBlogVideoUrl(url)}
                      label="ব্লগের ভিডিও সংযুক্ত করুন (ঐচ্ছিক - Video Upload / YouTube Link)"
                      helperText="কম্পিউটার বা মোবাইল থেকে সরাসরি ভিডিও ফাইল আপলোড করুন (MP4, WebM) অথবা ইউটিউব লিংক পেস্ট করুন"
                    />
                  </div>

                  {/* Reading Time & Publish Status */}
                  <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200">পড়ার সময় (মিনিট)</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBlogReadingTime(Math.max(1, blogReadingTime - 1))}
                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-amber-400 w-6 text-center">
                          {bnNum(blogReadingTime)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBlogReadingTime(blogReadingTime + 1)}
                          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        প্রকাশনা অবস্থা
                      </label>
                      <select
                        value={blogStatus}
                        onChange={(e) => setBlogStatus(e.target.value as 'published' | 'draft')}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                      >
                        <option value="published">সরাসরি প্রকাশিত (Published)</option>
                        <option value="draft">ড্রাফট হিসেবে সংরক্ষণ (Draft)</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={blogIsFeatured}
                        onChange={(e) => setBlogIsFeatured(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-amber-300">
                        স্পেশাল / নির্বাচিত হিসেবে হাইলাইট করুন
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-red-700/20 cursor-pointer"
                  >
                    <PenTool className="w-4 h-4 text-amber-300" />
                    <span>ব্লগ প্রকাশ ও সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: ADS */}
        {activeTab === 'ads' && (
          <AdminAdsManagement
            ads={ads}
            settings={localSettings}
            onUpdateSettings={(updatedSettings) => {
              setLocalSettings(updatedSettings);
              onUpdateSettings(updatedSettings);
            }}
            onAddAd={onAddAd}
            onUpdateAd={onUpdateAd}
            onDeleteAd={onDeleteAd}
            onToggleAdStatus={onToggleAdStatus}
          />
        )}

        {/* TAB 7: MESSAGES */}
        {activeTab === 'messages' && (
          <AdminMessagesInbox
            messages={messages}
            onMarkMessageRead={onMarkMessageRead}
            onDeleteMessage={onDeleteMessage}
            setFeedback={setFeedback}
            setErrorMessage={setErrorMessage}
          />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">অফিসিয়াল ইমেইল</label>
                  <input 
                    type="email" 
                    value={localSettings.email || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, email: e.target.value })}
                    placeholder="editor@bartachitro.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">যোগাযোগ ফোন নম্বর</label>
                  <input 
                    type="text" 
                    value={localSettings.phone || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, phone: e.target.value })}
                    placeholder="+৮৮০ ২ ৯৮৭৬৫৪৩"
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">অফিসিয়াল ঠিকানা</label>
                <textarea 
                  rows={2}
                  value={localSettings.address || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Site Logo Upload Section */}
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    পত্রিকার অফিসিয়াল লোগো (Site & E-Paper Logo)
                  </label>
                  {localSettings.logo_url && (
                    <button
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, logo_url: '' })}
                      className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      ডিফল্ট লোগো ফিরিয়ে আনুন
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  এখানে আপলোড করা লোগোটি পুরো ওয়েবসাইটের হেডার, ফুটার, ই-পত্রিকা ও মোবাইল মেনু সব জায়গায় স্বয়ংক্রিয়ভাবে কার্যকর হবে। (PNG, SVG, অথবা JPG)
                </p>

                {/* Live Preview Box */}
                <div className="bg-white/5 border border-slate-700/80 p-3.5 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="bg-white p-3 rounded-md border border-slate-300 flex items-center justify-center min-w-[200px]">
                    <SiteLogo size="md" logoUrl={localSettings.logo_url} />
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 text-center sm:text-left">
                    <span className="font-bold text-amber-400 block">বর্তমান লোগো প্রিভিউ</span>
                    <span className="text-[11px] text-slate-400 block">
                      {localSettings.logo_url ? 'কাস্টম আপলোড করা লোগো সক্রিয়' : 'ডিফল্ট বার্তাচিত্র ভেক্টর লোগো সক্রিয়'}
                    </span>
                  </div>
                </div>

                <ImageUploader
                  currentImage={localSettings.logo_url || ''}
                  onImageChange={(url) => setLocalSettings({ ...localSettings, logo_url: url })}
                  onImageSelected={(url) => setLocalSettings({ ...localSettings, logo_url: url })}
                />
              </div>

              {/* Site Favicon Upload Section */}
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    সাইট ফেভিকন (Browser Favicon / App Icon)
                  </label>
                  {localSettings.favicon_url && (
                    <button
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, favicon_url: '' })}
                      className="text-[11px] text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      ফেভিকন মুছে ফেলুন
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ব্রাউজার ট্যাবে প্রদর্শিত ছোট আইকন। (PNG, ICO বা SVG, ৩২x৩২ বা ৬৪x৬৪ পিক্সেল উত্তম)
                </p>

                {localSettings.favicon_url && (
                  <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <img src={localSettings.favicon_url} alt="Favicon" className="w-8 h-8 object-contain rounded bg-white p-1" />
                    <span className="text-xs text-slate-300">বর্তমান ফেভিকন সক্রিয় রয়েছে</span>
                  </div>
                )}

                <ImageUploader
                  currentImage={localSettings.favicon_url || ''}
                  label="ফেভিকন আপলোড"
                  helperText="ছোট সাইজের স্কয়ার (১:১) ছবি নির্বাচন করুন"
                  onImageChange={(url) => setLocalSettings({ ...localSettings, favicon_url: url })}
                  onImageSelected={(url) => setLocalSettings({ ...localSettings, favicon_url: url })}
                />
              </div>

              {/* Social Media Links */}
              <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200">সামাজিক যোগাযোগ মাধ্যম লিংক</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ফেসবুক পেজ</label>
                    <input 
                      type="url" 
                      value={localSettings.facebook_url || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">টুইটার / এক্স (X)</label>
                    <input 
                      type="url" 
                      value={localSettings.twitter_url || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, twitter_url: e.target.value })}
                      placeholder="https://x.com/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ইউটিউব চ্যানেল</label>
                    <input 
                      type="url" 
                      value={localSettings.youtube_url || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Meta Tags */}
              <div className="bg-slate-900/60 border border-slate-700 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200">সার্চ ইঞ্জিন অপটিমাইজেশন (SEO Meta)</h4>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">মেটা বিবরণ (Meta Description)</label>
                  <textarea 
                    rows={2}
                    value={localSettings.meta_description || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, meta_description: e.target.value })}
                    placeholder="সংবাদ পোর্টালের সংক্ষিপ্ত পরিচয়..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">কীওয়ার্ডস (কমা দিয়ে আলাদা করুন)</label>
                  <input 
                    type="text" 
                    value={localSettings.meta_keywords || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, meta_keywords: e.target.value })}
                    placeholder="বাংলা সংবাদ, জাতীয়, আন্তর্জাতিক, খবর..."
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
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

        {/* TAB 9: MULTI-ADMIN ROLE MANAGEMENT */}
        {activeTab === 'users' && (
          <AdminUserManagement
            users={users}
            currentUser={currentAdminUser}
            onAddUser={onAddUser || (() => {})}
            onUpdateUser={onUpdateUser || (() => {})}
            onDeleteUser={onDeleteUser || (() => {})}
            onChangeActiveUser={setCurrentAdminUser}
          />
        )}

        {/* TAB 10: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <AdminAnalyticsDashboard
            newsList={newsList}
            blogs={blogs}
            categories={categories}
            users={users}
            onSelectArticle={(article) => {
              handleStartEditNews(article);
              setActiveTab('news');
            }}
          />
        )}

        {/* TAB 11: PROFESSIONAL MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <AdminMediaLibrary
            newsList={newsList}
            blogs={blogs}
            ads={ads}
            users={users}
            settings={settings}
          />
        )}

        {/* TAB 12: EXPORT & IMPORT / DATABASE RECOVERY */}
        {activeTab === 'export_import' && (
          <AdminExportImport
            newsList={newsList}
            blogs={blogs}
            categories={categories}
            settings={settings}
            users={users}
            ads={ads}
            onImportBackup={onImportBackup || (() => {})}
          />
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
                <RichTextEditor
                  value={editNewsContent}
                  onChange={setEditNewsContent}
                  label="মূল সংবাদ বিবরণ (এম এস অফিসের মতো ছবি, ফন্ট, কালার ও ফরম্যাটিং যোগ করুন) *"
                  placeholder="সম্পূর্ণ সংবাদের বিস্তারিত বিবরণ লিখুন..."
                />
              </div>

              {/* Image Uploader for News */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-300">সংবাদের ছবি (Featured Image)</label>
                <ImageUploader 
                  currentImage={editNewsImage}
                  onImageChange={(url) => setEditNewsImage(url)}
                  onImageSelected={(url) => setEditNewsImage(url)}
                />
              </div>

              {/* Video Uploader for News */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <VideoUploader
                  currentVideo={editNewsVideoUrl}
                  onVideoChange={(url) => setEditNewsVideoUrl(url)}
                  label="সংবাদের ভিডিও সংযুক্ত করুন (ঐচ্ছিক - Video Upload / YouTube Link)"
                  helperText="কম্পিউটার বা মোবাইল থেকে সরাসরি ভিডিও আপলোড করুন (MP4, WebM) অথবা ইউটিউব লিংক পেস্ট করুন"
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

              {/* SEO Friendly Optimization Section for Edit News */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    এসইও অপটিমাইজেশন (Google Search & Social Share SEO)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      এসইও মেটা টাইটেল (SEO Title)
                    </label>
                    <input
                      type="text"
                      value={editNewsSeoTitle}
                      onChange={(e) => setEditNewsSeoTitle(e.target.value)}
                      placeholder={editNewsTitle || "গুগল সার্চ ফলাফলের টাইটেল..."}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      মেটা ডেসক্রিপশন (Meta Description - সার্চে দেখাবে)
                    </label>
                    <textarea
                      rows={2}
                      value={editNewsSeoDescription}
                      onChange={(e) => setEditNewsSeoDescription(e.target.value)}
                      placeholder={editNewsSummary || "সংবাদের সারসংক্ষেপ..."}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      কীওয়ার্ডস (Keywords - কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={editNewsSeoKeywords}
                      onChange={(e) => setEditNewsSeoKeywords(e.target.value)}
                      placeholder=" যেমন: বাংলাদেশ, জাতীয় সংবাদ, রাজনীতি"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <SeoMetaHelper
                  title={editNewsSeoTitle || editNewsTitle}
                  description={editNewsSeoDescription || editNewsSummary}
                  keywords={editNewsSeoKeywords}
                  slug={editNewsTitle ? editNewsTitle.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').slice(0, 45) : undefined}
                />
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

      {/* EDIT BLOG MODAL */}
      {editingBlog && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-900/60 text-red-400 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-bengali-display">
                    ব্লগ সম্পাদনা করুন (Edit Blog)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    আইডি #{editingBlog.id} — {editingBlog.title.slice(0, 40)}...
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelEditBlog}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEditBlog} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-200">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ব্লগ শিরোনাম *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBlogTitle}
                    onChange={(e) => setEditBlogTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold font-bengali-display"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    বিষয় / ক্যাটাগরি ট্যাগ *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBlogCategoryTag}
                    onChange={(e) => setEditBlogCategoryTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Author Information */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <span className="text-xs font-bold text-amber-400 block">লেখকের তথ্যাদি</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">লেখকের নাম *</label>
                    <input
                      type="text"
                      required
                      value={editBlogAuthorName}
                      onChange={(e) => setEditBlogAuthorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">পদবী বা পরিচয় *</label>
                    <input
                      type="text"
                      required
                      value={editBlogAuthorRole}
                      onChange={(e) => setEditBlogAuthorRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">অবতার / ছবি URL</label>
                    <input
                      type="url"
                      value={editBlogAuthorAvatar}
                      onChange={(e) => setEditBlogAuthorAvatar(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reading time, Views, Likes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">পড়ার সময় (মিনিট)</label>
                  <input
                    type="number"
                    min="1"
                    value={editBlogReadingTime}
                    onChange={(e) => setEditBlogReadingTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">পাঠক ভিউ সংখ্যা</label>
                  <input
                    type="number"
                    min="0"
                    value={editBlogViews}
                    onChange={(e) => setEditBlogViews(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">লাইক সংখ্যা</label>
                  <input
                    type="number"
                    min="0"
                    value={editBlogLikes}
                    onChange={(e) => setEditBlogLikes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">সংক্ষেপ বা ভূমিকা (Summary)</label>
                <textarea
                  rows={2}
                  required
                  value={editBlogSummary}
                  onChange={(e) => setEditBlogSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Full Content */}
              <div>
                <RichTextEditor
                  value={editBlogContent}
                  onChange={setEditBlogContent}
                  label="মূল ব্লগ বিবরণ (এম এস অফিসের মতো ছবি, ফন্ট, কালার ও ফরম্যাটিং যোগ করুন) *"
                  placeholder="এখানে আপনার ব্লগের পূর্ণাঙ্গ লেখাটি লিখুন..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={editBlogTagsInput}
                  onChange={(e) => setEditBlogTagsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Cover Image */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-300">কাভার ছবি (Cover Image)</label>
                <ImageUploader
                  currentImage={editBlogCoverImage}
                  onImageChange={(url) => setEditBlogCoverImage(url)}
                  onImageSelected={(url) => setEditBlogCoverImage(url)}
                />
              </div>

              {/* Video Uploader for Blog */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <VideoUploader
                  currentVideo={editBlogVideoUrl}
                  onVideoChange={(url) => setEditBlogVideoUrl(url)}
                  label="ব্লগের ভিডিও সংযুক্ত করুন (ঐচ্ছিক - Video Upload / YouTube Link)"
                  helperText="কম্পিউটার বা মোবাইল থেকে সরাসরি ভিডিও আপলোড করুন (MP4, WebM) অথবা ইউটিউব লিংক পেস্ট করুন"
                />
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">প্রকাশনা অবস্থা (Status)</label>
                  <select
                    value={editBlogStatus}
                    onChange={(e) => setEditBlogStatus(e.target.value as 'published' | 'draft')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="published">সরাসরি প্রকাশিত (Published)</option>
                    <option value="draft">ড্রাফট হিসেবে সংরক্ষণ (Draft)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editBlogIsFeatured}
                      onChange={(e) => setEditBlogIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-400">নির্বাচিত / স্পেশাল ব্লগ হিসেবে হাইলাইট করুন</span>
                  </label>
                </div>
              </div>

              {/* SEO Friendly Optimization Section for Edit Blog */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    এসইও অপটিমাইজেশন (Google Search & Social Share SEO)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      এসইও মেটা টাইটেল (SEO Title)
                    </label>
                    <input
                      type="text"
                      value={editBlogSeoTitle}
                      onChange={(e) => setEditBlogSeoTitle(e.target.value)}
                      placeholder={editBlogTitle || "গুগল সার্চ ফলাফলের টাইটেল..."}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      মেটা ডেসক্রিপশন (Meta Description - সার্চে দেখাবে)
                    </label>
                    <textarea
                      rows={2}
                      value={editBlogSeoDescription}
                      onChange={(e) => setEditBlogSeoDescription(e.target.value)}
                      placeholder={editBlogSummary || "ব্লগের সারসংক্ষেপ..."}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      কীওয়ার্ডস (Keywords - কমা দিয়ে আলাদা করুন)
                    </label>
                    <input
                      type="text"
                      value={editBlogSeoKeywords}
                      onChange={(e) => setEditBlogSeoKeywords(e.target.value)}
                      placeholder="যেমন: মতামত, কলাম, সাহিত্য, বিশ্লেষণ"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <SeoMetaHelper
                  title={editBlogSeoTitle || editBlogTitle}
                  description={editBlogSeoDescription || editBlogSummary}
                  keywords={editBlogSeoKeywords}
                  slug={editBlogTitle ? editBlogTitle.trim().toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '-').slice(0, 45) : undefined}
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelEditBlog}
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
      {/* Password Update Modal for Current Admin / Moderator */}
      {showPasswordModal && (
        <UpdatePasswordModal
          user={currentAdminUser}
          isOpen={true}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={(msg) => {
            setFeedback(msg);
            setTimeout(() => setFeedback(''), 4000);
          }}
        />
      )}
    </div>
  );
};
