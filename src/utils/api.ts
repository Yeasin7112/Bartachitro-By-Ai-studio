/**
 * BartaChitro (বার্তাচিত্র) - Centralized Production API Client
 * Interacts with PHP REST APIs & MySQL database on cPanel and dev server
 */

import { 
  NewsArticle, 
  Category, 
  Advertisement, 
  Epaper, 
  SiteSettings, 
  ContactMessage, 
  BlogPost, 
  AdminUser 
} from '../types';

const API_BASE = '/api';

/**
 * Universal JSON fetch helper with error handling
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}/${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json; charset=utf-8';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson && (errJson.error || errJson.message)) {
        errorMsg = errJson.error || errJson.message;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

// ==========================================
// 1. SETTINGS API (Uses key_name & key_value)
// ==========================================

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await apiRequest<{ status: string; data: SiteSettings }>('settings.php');
  return res.data;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const res = await apiRequest<{ status: string; data: SiteSettings }>('settings.php', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
  return res.data || settings;
}

// ==========================================
// 2. NEWS API (Uses author_id)
// ==========================================

export interface NewsFilterParams {
  category_id?: number;
  category_slug?: string;
  is_breaking?: boolean;
  is_featured?: boolean;
  search?: string;
  status?: string;
  limit?: number;
}

export async function fetchNewsList(filters?: NewsFilterParams): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (filters?.category_id) params.set('category_id', String(filters.category_id));
  if (filters?.category_slug) params.set('category_slug', filters.category_slug);
  if (filters?.is_breaking !== undefined) params.set('is_breaking', filters.is_breaking ? '1' : '0');
  if (filters?.is_featured !== undefined) params.set('is_featured', filters.is_featured ? '1' : '0');
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiRequest<{ status: string; data: NewsArticle[] }>(`news.php${query}`);
  return res.data || [];
}

export async function createNewsArticle(article: Partial<NewsArticle>): Promise<NewsArticle> {
  const res = await apiRequest<{ status: string; data: NewsArticle; id: number }>('news.php', {
    method: 'POST',
    body: JSON.stringify(article),
  });
  return res.data;
}

export async function updateNewsArticle(article: NewsArticle): Promise<NewsArticle> {
  const res = await apiRequest<{ status: string; data: NewsArticle }>(`news.php?id=${article.id}`, {
    method: 'PUT',
    body: JSON.stringify(article),
  });
  return res.data || article;
}

export async function deleteNewsArticle(id: number): Promise<void> {
  await apiRequest(`news.php?id=${id}`, {
    method: 'DELETE',
  });
}

export async function recordNewsView(id: number): Promise<void> {
  try {
    await apiRequest(`news.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'increment_view' }),
    });
  } catch {}
}

// ==========================================
// 3. CATEGORIES API
// ==========================================

export async function fetchCategoriesList(): Promise<Category[]> {
  const res = await apiRequest<{ status: string; data: Category[] }>('categories.php');
  return res.data || [];
}

export async function createCategoryItem(category: Partial<Category>): Promise<Category> {
  const res = await apiRequest<{ status: string; data: Category; id: number }>('categories.php', {
    method: 'POST',
    body: JSON.stringify(category),
  });
  return res.data;
}

export async function updateCategoryItem(category: Category): Promise<Category> {
  const res = await apiRequest<{ status: string; data: Category }>(`categories.php?id=${category.id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
  return res.data || category;
}

export async function deleteCategoryItem(id: number): Promise<void> {
  await apiRequest(`categories.php?id=${id}`, {
    method: 'DELETE',
  });
}

// ==========================================
// 4. ADS API
// ==========================================

export async function fetchAdvertisements(): Promise<Advertisement[]> {
  const res = await apiRequest<{ status: string; data: Advertisement[] }>('ads.php');
  return res.data || [];
}

export async function createAdvertisement(ad: Partial<Advertisement>): Promise<Advertisement> {
  const res = await apiRequest<{ status: string; data: Advertisement; id: number }>('ads.php', {
    method: 'POST',
    body: JSON.stringify(ad),
  });
  return res.data;
}

export async function updateAdvertisement(ad: Advertisement): Promise<Advertisement> {
  const res = await apiRequest<{ status: string; data: Advertisement }>(`ads.php?id=${ad.id}`, {
    method: 'PUT',
    body: JSON.stringify(ad),
  });
  return res.data || ad;
}

export async function deleteAdvertisement(id: number): Promise<void> {
  await apiRequest(`ads.php?id=${id}`, {
    method: 'DELETE',
  });
}

// ==========================================
// 5. E-PAPER API
// ==========================================

export async function fetchEpaperData(): Promise<Epaper | null> {
  const res = await apiRequest<{ status: string; data: Epaper | null }>('epaper.php');
  return res.data;
}

export async function saveEpaperData(epaper: Epaper): Promise<void> {
  await apiRequest('epaper.php', {
    method: 'POST',
    body: JSON.stringify(epaper),
  });
}

// ==========================================
// 6. CONTACT MESSAGES API
// ==========================================

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const res = await apiRequest<{ status: string; data: ContactMessage[] }>('messages.php');
  return res.data || [];
}

export async function submitContactMessage(msg: Omit<ContactMessage, 'id' | 'is_read' | 'created_at'>): Promise<ContactMessage> {
  const res = await apiRequest<{ status: string; data: ContactMessage; id: number }>('messages.php', {
    method: 'POST',
    body: JSON.stringify(msg),
  });
  return res.data;
}

export async function markMessageAsRead(id: number, isRead = true): Promise<void> {
  await apiRequest(`messages.php?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify({ is_read: isRead }),
  });
}

export async function deleteContactMessage(id: number): Promise<void> {
  await apiRequest(`messages.php?id=${id}`, {
    method: 'DELETE',
  });
}

// ==========================================
// 7. BLOGS API
// ==========================================

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await apiRequest<{ status: string; data: BlogPost[] }>('blogs.php');
  return res.data || [];
}

export async function createBlogPost(blog: Partial<BlogPost>): Promise<BlogPost> {
  const res = await apiRequest<{ status: string; data: BlogPost; id: number }>('blogs.php', {
    method: 'POST',
    body: JSON.stringify(blog),
  });
  return res.data;
}

export async function updateBlogPost(blog: BlogPost): Promise<BlogPost> {
  const res = await apiRequest<{ status: string; data: BlogPost }>(`blogs.php?id=${blog.id}`, {
    method: 'PUT',
    body: JSON.stringify(blog),
  });
  return res.data || blog;
}

export async function deleteBlogPost(id: number): Promise<void> {
  await apiRequest(`blogs.php?id=${id}`, {
    method: 'DELETE',
  });
}

export async function likeBlogPost(id: number): Promise<void> {
  try {
    await apiRequest(`blogs.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'like' }),
    });
  } catch {}
}

// ==========================================
// 8. USERS & AUTH API
// ==========================================

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const res = await apiRequest<{ status: string; data: AdminUser[] }>('users.php');
  return res.data || [];
}

export async function createAdminUser(user: Partial<AdminUser>, password?: string): Promise<AdminUser> {
  const res = await apiRequest<{ status: string; data: AdminUser; id: number }>('users.php', {
    method: 'POST',
    body: JSON.stringify({ ...user, password }),
  });
  return res.data;
}

export async function updateAdminUser(user: AdminUser, password?: string): Promise<void> {
  await apiRequest(`users.php?id=${user.id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...user, password }),
  });
}

export async function deleteAdminUser(id: number): Promise<void> {
  await apiRequest(`users.php?id=${id}`, {
    method: 'DELETE',
  });
}

export async function loginAdmin(username: string, password: string): Promise<{ user: AdminUser; token?: string }> {
  const res = await apiRequest<{ status: string; user: AdminUser; token?: string }>('auth.php?action=login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return { user: res.user, token: res.token };
}

export async function checkAdminAuth(): Promise<AdminUser | null> {
  try {
    const res = await apiRequest<{ status: string; authenticated: boolean; user?: AdminUser }>('auth.php?action=me');
    if (res.authenticated && res.user) {
      return res.user;
    }
  } catch {}
  return null;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiRequest('auth.php?action=logout', { method: 'POST' });
  } catch {}
}

// ==========================================
// 9. FILE & IMAGE UPLOADER API
// ==========================================

/**
 * Uploads an image (base64 data URL or File object) to /uploads/ on the server
 * Returns the public URL (e.g. /uploads/upload-12345.jpg)
 */
export async function uploadImageFile(fileOrBase64: File | string): Promise<string> {
  if (typeof fileOrBase64 === 'string') {
    // Already a remote URL or non-base64
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://') || fileOrBase64.startsWith('/uploads/')) {
      return fileOrBase64;
    }

    if (fileOrBase64.startsWith('data:image/')) {
      const res = await apiRequest<{ status: string; url: string }>('upload.php', {
        method: 'POST',
        body: JSON.stringify({ image: fileOrBase64 }),
      });
      return res.url;
    }

    return fileOrBase64;
  }

  // It's a File object
  const formData = new FormData();
  formData.append('file', fileOrBase64);

  const res = await fetch(`${API_BASE}/upload.php`, {
    method: 'POST',
    body: formData,
  });

  if (!responseOk(res)) {
    throw new Error('Upload failed');
  }

  const json = await res.json();
  return json.url;
}

function responseOk(res: Response): boolean {
  return res.status >= 200 && res.status < 300;
}
