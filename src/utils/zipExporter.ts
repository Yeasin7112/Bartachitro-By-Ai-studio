import JSZip from 'jszip';
import {
  NewsArticle, BlogPost, Category, SiteSettings,
  Advertisement, ContactMessage, Epaper, AdminUser
} from '../types';
import { generateSqlDump, getCpanelPhpTemplates } from './cpanelPackage';

export interface FullBackupPayload {
  version: string;
  export_date: string;
  site_name: string;
  news: NewsArticle[];
  blogs: BlogPost[];
  categories?: Category[];
  settings?: SiteSettings;
  advertisements?: Advertisement[];
  users?: AdminUser[];
}

export type BackupData = FullBackupPayload;

/**
 * 1-Click JSON Backup Exporter
 */
export function downloadJsonBackup(
  newsList: NewsArticle[],
  blogs: BlogPost[],
  categories?: Category[],
  settings?: SiteSettings,
  ads?: Advertisement[],
  users?: AdminUser[]
): void {
  const payload: FullBackupPayload = {
    version: '2.0',
    export_date: new Date().toISOString(),
    site_name: settings?.site_name || 'বার্তাচিত্র',
    news: newsList,
    blogs: blogs,
    categories: categories,
    settings: settings,
    advertisements: ads,
    users: users
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bartachitro-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Alias for downloadJsonBackup
export const downloadBackupJson = (
  newsList: NewsArticle[],
  blogs: BlogPost[],
  categories?: Category[],
  settings?: SiteSettings,
  users?: AdminUser[],
  ads?: Advertisement[]
) => downloadJsonBackup(newsList, blogs, categories, settings, ads, users);

/**
 * 1-Click MySQL Database Dump Exporter
 */
export function downloadSqlBackup(
  newsList: NewsArticle[],
  blogs: BlogPost[],
  categories: Category[],
  settings: SiteSettings,
  ads: Advertisement[] = [],
  messages: ContactMessage[] = [],
  users: AdminUser[] = [],
  epaper: Epaper[] = []
): void {
  const sqlDump = generateSqlDump(newsList, blogs, categories, settings, ads, messages, users, epaper);
  const blob = new Blob([sqlDump], { type: 'application/sql;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `bartachitro-database-${dateStr}.sql`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Alias for downloadSqlDump
export const downloadSqlDump = (
  newsList: NewsArticle[],
  blogs: BlogPost[],
  categories: Category[],
  settings: SiteSettings,
  users: AdminUser[] = [],
  ads: Advertisement[] = [],
  messages: ContactMessage[] = [],
  epaper: Epaper[] = []
) => downloadSqlBackup(newsList, blogs, categories, settings, ads, messages, users, epaper);

/**
 * Parse and validate JSON backup file (Accepts File or JSON string)
 */
export async function parseBackupFile(input: File | string): Promise<{
  success: boolean;
  data?: FullBackupPayload;
  error?: string;
}> {
  try {
    let jsonString: string;
    if (typeof input === 'string') {
      jsonString = input;
    } else if (input instanceof File || (input && typeof (input as File).text === 'function')) {
      jsonString = await input.text();
    } else {
      return { success: false, error: 'ফাইল রিড করা সম্ভব হয়নি।' };
    }

    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'ফাইলটি বৈধ JSON ফরম্যাটে নেই।' };
    }

    if (!Array.isArray(parsed.news) && !Array.isArray(parsed.blogs)) {
      return { success: false, error: 'ফাইলে কোনো সংবাদ (News) বা ব্লগ (Blogs) ডাটা পাওয়া যায়নি।' };
    }

    return {
      success: true,
      data: {
        version: parsed.version || '1.0',
        export_date: parsed.export_date || new Date().toISOString(),
        site_name: parsed.site_name || 'বার্তাচিত্র',
        news: Array.isArray(parsed.news) ? parsed.news : [],
        blogs: Array.isArray(parsed.blogs) ? parsed.blogs : [],
        categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
        settings: parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : undefined,
        advertisements: Array.isArray(parsed.advertisements) ? parsed.advertisements : undefined,
        users: Array.isArray(parsed.users) ? parsed.users : undefined,
      }
    };
  } catch (err) {
    return { success: false, error: 'ফাইল পার্সিং ব্যর্থ হয়েছে: ' + (err as Error).message };
  }
}

/**
 * Download turnkey cPanel Ready ZIP Archive
 */
export async function downloadPhpProjectZip(
  newsList: NewsArticle[] = [],
  blogs: BlogPost[] = [],
  categories: Category[] = [],
  settings: SiteSettings = {
    site_name: 'বার্তাচিত্র',
    site_tagline: 'সত্যের সংবাদ, সবার ভাষায়',
    editor_name: 'আহমেদ রফিক চৌধুরী',
    executive_editor: 'শাহনেওয়াজ করিম',
    email: 'editor@bartachitro.com',
    phone: '+৮৮০ ২ ৯৮৭৬৫৪৩',
    address: 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫',
    facebook_url: 'https://facebook.com',
    twitter_url: 'https://twitter.com',
    youtube_url: 'https://youtube.com',
    meta_description: 'বার্তাচিত্র - ডিজিটাল সংবাদ ও ই-পত্রিকা',
    meta_keywords: 'বার্তাচিত্র, বাংলা সংবাদ, ই-পত্রিকা'
  },
  ads: Advertisement[] = [],
  messages: ContactMessage[] = [],
  users: AdminUser[] = [],
  epaper: Epaper[] = []
): Promise<void> {
  const zip = new JSZip();

  // 1. Generate live database.sql with all current news and blogs
  const sqlDump = generateSqlDump(newsList, blogs, categories, settings, ads, messages, users, epaper);
  zip.file('database/database.sql', sqlDump);

  // 2. Generate all PHP template files for cPanel
  const templates = getCpanelPhpTemplates(settings);
  for (const [filePath, content] of Object.entries(templates)) {
    zip.file(filePath, content);
  }

  // 3. Generate JSON export inside zip for redundancy
  const backupPayload = {
    version: '2.0',
    export_date: new Date().toISOString(),
    news: newsList,
    blogs: blogs,
    settings: settings
  };
  zip.file('backup/data-backup.json', JSON.stringify(backupPayload, null, 2));

  // 4. Try to fetch logo.svg if available
  try {
    const logoRes = await fetch('/logo.svg');
    if (logoRes.ok) {
      const svgText = await logoRes.text();
      zip.file('assets/logo.svg', svgText);
    }
  } catch {
    // Ignore
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'bartachitro-cpanel-mysql-package.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

// Alias for downloadPhpProjectZip
export const downloadCpanelBundle = (
  newsList: NewsArticle[] = [],
  blogs: BlogPost[] = [],
  categories: Category[] = [],
  settings?: SiteSettings,
  users: AdminUser[] = [],
  ads: Advertisement[] = [],
  messages: ContactMessage[] = [],
  epaper: Epaper[] = []
) => downloadPhpProjectZip(newsList, blogs, categories, settings, ads, messages, users, epaper);
