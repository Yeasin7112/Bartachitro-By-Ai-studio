import { MediaItem, NewsArticle, BlogPost, Advertisement, AdminUser, SiteSettings } from '../types';

const MEDIA_STORAGE_KEY = 'bartachitro_media_library';

/**
 * Extract image format from URL or filename
 */
export function extractImageFormat(url: string): string {
  if (!url) return 'jpg';
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.png')) return 'PNG';
  if (cleanUrl.endsWith('.webp')) return 'WebP';
  if (cleanUrl.endsWith('.svg')) return 'SVG';
  if (cleanUrl.endsWith('.gif')) return 'GIF';
  if (cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.jpg')) return 'JPG';
  return 'JPG';
}

/**
 * Format bytes to readable string (e.g. 150 KB, 1.2 MB)
 */
export function formatBytes(bytes?: number | string): string {
  if (!bytes) return '১১০ KB';
  const num = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  if (isNaN(num)) return String(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(0)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get stored media list from localStorage
 */
export function getStoredMedia(): MediaItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return [];
}

/**
 * Save media items list to localStorage
 */
export function saveStoredMedia(items: MediaItem[]): void {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

/**
 * Generate initial / consolidated Media Library by scanning all current news, blogs, ads, avatars, and uploads
 */
export function scanAndSyncMediaLibrary(params: {
  newsList: NewsArticle[];
  blogs: BlogPost[];
  ads?: Advertisement[];
  users?: AdminUser[];
  settings?: SiteSettings;
}): MediaItem[] {
  const { newsList, blogs, ads = [], users = [], settings } = params;
  const stored = getStoredMedia();
  const mediaMap = new Map<string, MediaItem>();

  // 1. Put all stored media first
  stored.forEach(item => {
    if (item && item.url) {
      mediaMap.set(item.url, { ...item });
    }
  });

  // Helper to count usage across news and blogs
  const getUsageCount = (url: string) => {
    let count = 0;
    count += newsList.filter(n => n.featured_image === url).length;
    count += blogs.filter(b => b.cover_image === url).length;
    count += ads.filter(a => a.image_url === url).length;
    count += users.filter(u => u.avatar === url).length;
    if (settings?.logo_url === url) count++;
    return count;
  };

  // 2. Scan News Articles
  newsList.forEach((n, idx) => {
    if (n.featured_image) {
      const existing = mediaMap.get(n.featured_image);
      mediaMap.set(n.featured_image, {
        id: existing?.id || `news-img-${n.id || idx}`,
        url: n.featured_image,
        title: existing?.title || n.title,
        filename: existing?.filename || (n.featured_image.startsWith('/uploads/') ? n.featured_image.replace('/uploads/', '') : `news-article-${n.id || idx}.jpg`),
        width: existing?.width || 1200,
        height: existing?.height || 750,
        format: existing?.format || extractImageFormat(n.featured_image),
        file_size: existing?.file_size || 185000 + ((idx * 15400) % 250000),
        alt_text: existing?.alt_text || n.title,
        caption: existing?.caption || n.image_caption || n.summary?.slice(0, 80) || '',
        uploaded_at: existing?.uploaded_at || n.published_at || new Date().toISOString(),
        source: 'news',
        used_in_count: getUsageCount(n.featured_image)
      });
    }
  });

  // 3. Scan Blog Posts
  blogs.forEach((b, idx) => {
    if (b.cover_image) {
      const existing = mediaMap.get(b.cover_image);
      mediaMap.set(b.cover_image, {
        id: existing?.id || `blog-img-${b.id || idx}`,
        url: b.cover_image,
        title: existing?.title || b.title,
        filename: existing?.filename || (b.cover_image.startsWith('/uploads/') ? b.cover_image.replace('/uploads/', '') : `blog-cover-${b.id || idx}.jpg`),
        width: existing?.width || 1200,
        height: existing?.height || 675,
        format: existing?.format || extractImageFormat(b.cover_image),
        file_size: existing?.file_size || 210000 + ((idx * 12300) % 300000),
        alt_text: existing?.alt_text || b.title,
        caption: existing?.caption || b.summary?.slice(0, 80) || '',
        uploaded_at: existing?.uploaded_at || b.published_at || new Date().toISOString(),
        source: 'blog',
        used_in_count: getUsageCount(b.cover_image)
      });
    }
  });

  // 4. Scan Advertisements
  ads.forEach((ad, idx) => {
    if (ad.image_url) {
      const existing = mediaMap.get(ad.image_url);
      mediaMap.set(ad.image_url, {
        id: existing?.id || `ad-img-${ad.id || idx}`,
        url: ad.image_url,
        title: existing?.title || ad.title,
        filename: existing?.filename || `ad-banner-${ad.id || idx}.jpg`,
        width: existing?.width || (ad.position === 'sidebar' ? 300 : 728),
        height: existing?.height || (ad.position === 'sidebar' ? 250 : 90),
        format: existing?.format || extractImageFormat(ad.image_url),
        file_size: existing?.file_size || 95000,
        alt_text: existing?.alt_text || ad.title,
        caption: existing?.caption || `বিজ্ঞাপন - ${ad.title}`,
        uploaded_at: existing?.uploaded_at || new Date().toISOString(),
        source: 'ad',
        used_in_count: getUsageCount(ad.image_url)
      });
    }
  });

  // 5. Scan User Avatars
  users.forEach((user, idx) => {
    if (user.avatar) {
      const existing = mediaMap.get(user.avatar);
      mediaMap.set(user.avatar, {
        id: existing?.id || `user-avatar-${user.id || idx}`,
        url: user.avatar,
        title: existing?.title || `${user.name} এর প্রোফাইল ছবি`,
        filename: existing?.filename || `avatar-${user.username || idx}.jpg`,
        width: existing?.width || 400,
        height: existing?.height || 400,
        format: existing?.format || extractImageFormat(user.avatar),
        file_size: existing?.file_size || 68000,
        alt_text: existing?.alt_text || user.name,
        caption: existing?.caption || user.role_title || '',
        uploaded_at: existing?.uploaded_at || user.created_at || new Date().toISOString(),
        source: 'user',
        used_in_count: getUsageCount(user.avatar)
      });
    }
  });

  const consolidated = Array.from(mediaMap.values());
  saveStoredMedia(consolidated);
  return consolidated;
}

/**
 * Add newly uploaded image to media library
 */
export function addMediaItem(item: Partial<MediaItem>): MediaItem {
  const current = getStoredMedia();
  const newItem: MediaItem = {
    id: item.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: item.url || '',
    title: item.title || item.filename || 'নতুন ছবি',
    filename: item.filename || 'uploaded-image.jpg',
    file_size: item.file_size || 150000,
    width: item.width || 1200,
    height: item.height || 800,
    format: item.format || extractImageFormat(item.url || ''),
    alt_text: item.alt_text || item.title || '',
    caption: item.caption || '',
    uploaded_at: item.uploaded_at || new Date().toISOString(),
    source: item.source || 'upload',
    used_in_count: 0
  };

  // Filter out any existing item with identical URL to avoid duplicates
  const filtered = current.filter(m => m.url !== newItem.url);
  const updated = [newItem, ...filtered];
  saveStoredMedia(updated);
  return newItem;
}

/**
 * Update media metadata (alt text, caption, title)
 */
export function updateMediaItem(id: string | number, updates: Partial<MediaItem>): MediaItem[] {
  const current = getStoredMedia();
  const updated = current.map(item => {
    if (String(item.id) === String(id) || item.url === updates.url) {
      return { ...item, ...updates };
    }
    return item;
  });
  saveStoredMedia(updated);
  return updated;
}

/**
 * Delete a media item from the library
 */
export function deleteMediaItem(id: string | number): MediaItem[] {
  const current = getStoredMedia();
  const updated = current.filter(item => String(item.id) !== String(id));
  saveStoredMedia(updated);
  return updated;
}
