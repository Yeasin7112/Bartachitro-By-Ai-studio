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
 * Retrieve active admin authorization token (from real authenticated PHP session)
 */
export function getAdminAuthToken(): string {
  try {
    return localStorage.getItem('bartachitro_token') || '';
  } catch {
    return '';
  }
}

/**
 * Set active authenticated admin session token
 */
export function setAdminAuthToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem('bartachitro_token', token);
    } else {
      localStorage.removeItem('bartachitro_token');
    }
  } catch {}
}

/**
 * Clear admin authentication token
 */
export function clearAdminAuthToken(): void {
  try {
    localStorage.removeItem('bartachitro_token');
  } catch {}
}

/**
 * Universal JSON fetch helper with error handling
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}/${endpoint}`;
  const defaultHeaders: Record<string, string> = {
    'Accept': 'application/json',
  };

  const token = getAdminAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json; charset=utf-8';
  }

  const response = await fetch(url, {
    credentials: 'include',
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

export async function reorderCategories(orders: { id: number; display_order: number }[]): Promise<Category[]> {
  const res = await apiRequest<{ status: string; data: Category[] }>('categories.php', {
    method: 'PUT',
    body: JSON.stringify({ action: 'reorder', orders }),
  });
  return res.data || [];
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
  if (res.token) {
    setAdminAuthToken(res.token);
  }
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
  } finally {
    clearAdminAuthToken();
  }
}

// ==========================================
// 9. FILE & MEDIA UPLOADER API (Images & Videos)
// ==========================================

/**
 * Uploads media (image or video - base64 data URL or File object) to /uploads/ on the server
 * Returns the public URL (e.g. /uploads/upload-12345.jpg or /uploads/video-12345.mp4)
 */
export async function uploadMediaFile(fileOrBase64: File | string): Promise<string> {
  if (typeof fileOrBase64 === 'string') {
    // Already a remote URL or server path
    if (fileOrBase64.startsWith('http://') || fileOrBase64.startsWith('https://') || fileOrBase64.startsWith('/uploads/')) {
      return fileOrBase64;
    }

    if (fileOrBase64.startsWith('data:')) {
      const res = await apiRequest<{ status: string; url: string }>('upload.php', {
        method: 'POST',
        body: JSON.stringify({ file: fileOrBase64, image: fileOrBase64 }),
      });
      return res.url;
    }

    return fileOrBase64;
  }

  // 1. Try multipart FormData upload
  try {
    const formData = new FormData();
    formData.append('file', fileOrBase64);

    const token = getAdminAuthToken();
    const uploadHeaders: Record<string, string> = {};
    if (token) {
      uploadHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/upload.php`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: uploadHeaders,
    });

    if (responseOk(res)) {
      const json = await res.json();
      if (json && json.url) {
        return json.url;
      }
      if (json && json.error) {
        throw new Error(json.error);
      }
    } else {
      let errText = `Upload error (${res.status})`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) errText = errJson.error;
      } catch {}
      throw new Error(errText);
    }
  } catch (err: any) {
    if (err.message && (err.message.includes('অননুমোদিত') || err.message.includes('HTTP Error 401') || err.message.includes('401'))) {
      throw err;
    }
    console.warn('Multipart upload failed, trying base64 fallback...', err);
  }

  // 2. Fallback to base64 Data URL POST
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await apiRequest<{ status: string; url: string }>('upload.php', {
          method: 'POST',
          body: JSON.stringify({
            file: base64Data,
            image: base64Data,
            filename: fileOrBase64.name,
          }),
        });
        if (res && res.url) {
          resolve(res.url);
        } else {
          reject(new Error('Upload response missing url'));
        }
      } catch (err: any) {
        reject(new Error(err.message || 'মিডিয়া আপলোড ব্যর্থ হয়েছে'));
      }
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ হয়েছে'));
    reader.readAsDataURL(fileOrBase64);
  });
}

// Backward compatibility alias
export const uploadImageFile = uploadMediaFile;

function responseOk(res: Response): boolean {
  return res.status >= 200 && res.status < 300;
}
