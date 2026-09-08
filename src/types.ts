/**
 * BartaChitro (বার্তাচিত্র) - Shared TypeScript Types
 */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  status: 'active' | 'inactive';
}

export interface NewsArticle {
  id: number;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  user_id?: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author_name: string;
  featured_image: string;
  image_caption?: string;
  video_url?: string;
  views: number;
  is_featured: boolean;
  is_breaking: boolean;
  status: 'published' | 'draft';
  published_at: string;
  updated_at?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface EpaperPage {
  id: number;
  epaper_id: number;
  page_number: number;
  page_title: string;
  image_url: string;
}

export interface Epaper {
  id: number;
  title: string;
  edition_date: string;
  total_pages: number;
  status: 'published' | 'draft';
  pages?: EpaperPage[];
}

export interface Advertisement {
  id: number;
  title: string;
  position: 'header_top' | 'home_middle' | 'sidebar' | 'article_inline';
  image_url: string;
  target_url: string;
  status: 'active' | 'inactive';
  views: number;
  clicks: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author_name: string;
  author_role: string;
  author_avatar?: string;
  cover_image: string;
  video_url?: string;
  category_tag: string;
  reading_time_min: number;
  views: number;
  likes: number;
  is_featured: boolean;
  status: 'published' | 'draft';
  published_at: string;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface SiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url?: string;
  favicon_url?: string;
  editor_name: string;
  executive_editor: string;
  email: string;
  phone: string;
  address: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  meta_description: string;
  meta_keywords: string;
  disable_ads?: boolean;
}

export type AdminRole = 'super_admin' | 'editor' | 'moderator';

export interface AdminUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: AdminRole;
  role_title?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  created_at: string;
  last_login?: string;
  phone?: string;
}
