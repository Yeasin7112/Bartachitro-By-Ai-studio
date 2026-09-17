/**
 * BartaChitro (বার্তাচিত্র) - cPanel Hosting & MySQL Database Package Generator
 * Generates turnkey PHP 8+ & MySQL 8+ deployment files and SQL database dumps.
 */

import { NewsArticle, BlogPost, Category, SiteSettings, Advertisement, ContactMessage, Epaper, AdminUser } from '../types';

function escapeSql(str: string | undefined | null): string {
  if (str === null || str === undefined) return "''";
  return "'" + str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r') + "'";
}

export function generateSqlDump(
  newsList: NewsArticle[],
  blogs: BlogPost[],
  categories: Category[],
  settings: SiteSettings,
  ads: Advertisement[],
  messages: ContactMessage[],
  users: AdminUser[],
  epaper: Epaper[]
): string {
  const timestamp = new Date().toISOString();

  let sql = `-- =======================================================
-- BartaChitro (বার্তাচিত্র) - Complete MySQL Database Dump
-- Generated at: ${timestamp}
-- Designed for cPanel / phpMyAdmin / MySQL 5.7+ / 8.0+ / MariaDB
-- Character Set: utf8mb4 / Collation: utf8mb4_unicode_ci
-- =======================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

--
-- Table structure for \`users\`
--
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(150) NOT NULL,
  \`username\` varchar(100) NOT NULL UNIQUE,
  \`email\` varchar(150) NOT NULL UNIQUE,
  \`password\` varchar(255) NOT NULL,
  \`role\` enum('super_admin','editor','moderator') NOT NULL DEFAULT 'editor',
  \`role_title\` varchar(100) DEFAULT NULL,
  \`avatar\` varchar(255) DEFAULT NULL,
  \`status\` enum('active','suspended') NOT NULL DEFAULT 'active',
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`last_login\` datetime DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Default Admin Users (Password: admin123 for all default accounts)
--
INSERT INTO \`users\` (\`id\`, \`name\`, \`username\`, \`email\`, \`password\`, \`role\`, \`role_title\`, \`status\`) VALUES
(1, 'আহমেদ রফিক চৌধুরী', 'admin', 'admin@bartachitro.com', '$2y$10$wE99Q2tD26wB9R673xQvxeL3Z9J3N5a0N4u4fP9/w6u2G4s8G.C1q', 'super_admin', 'প্রধান সম্পাদক ও প্রকাশক', 'active'),
(2, 'নাসরিন আক্তার', 'editor_nasrin', 'nasrin@bartachitro.com', '$2y$10$wE99Q2tD26wB9R673xQvxeL3Z9J3N5a0N4u4fP9/w6u2G4s8G.C1q', 'editor', 'বার্তা সম্পাদক', 'active'),
(3, 'তানভীর হাসান', 'mod_tanveer', 'tanveer@bartachitro.com', '$2y$10$wE99Q2tD26wB9R673xQvxeL3Z9J3N5a0N4u4fP9/w6u2G4s8G.C1q', 'moderator', 'কমিউনিটি ও মন্তব্য মডারেটর', 'active');

--
-- Table structure for \`categories\`
--
DROP TABLE IF EXISTS \`categories\`;
CREATE TABLE \`categories\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(100) NOT NULL,
  \`slug\` varchar(100) NOT NULL UNIQUE,
  \`description\` text DEFAULT NULL,
  \`display_order\` int(11) NOT NULL DEFAULT 0,
  \`status\` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  // Categories Insert
  if (categories && categories.length > 0) {
    sql += `INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`, \`display_order\`, \`status\`) VALUES\n`;
    const catRows = categories.map(c => `(${c.id}, ${escapeSql(c.name)}, ${escapeSql(c.slug)}, ${c.display_order || 0}, ${escapeSql(c.status)})`);
    sql += catRows.join(',\n') + ';\n\n';
  }

  // News Table
  sql += `--
-- Table structure for \`news\`
--
DROP TABLE IF EXISTS \`news\`;
CREATE TABLE \`news\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`category_id\` int(11) NOT NULL,
  \`title\` varchar(255) NOT NULL,
  \`slug\` varchar(255) NOT NULL,
  \`summary\` text DEFAULT NULL,
  \`content\` longtext NOT NULL,
  \`author_name\` varchar(150) NOT NULL,
  \`featured_image\` varchar(500) NOT NULL,
  \`image_caption\` varchar(255) DEFAULT NULL,
  \`views\` int(11) NOT NULL DEFAULT 0,
  \`is_featured\` tinyint(1) NOT NULL DEFAULT 0,
  \`is_breaking\` tinyint(1) NOT NULL DEFAULT 0,
  \`allow_comments\` tinyint(1) NOT NULL DEFAULT 1,
  \`status\` enum('published','draft') NOT NULL DEFAULT 'published',
  \`published_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`seo_title\` varchar(255) DEFAULT NULL,
  \`seo_description\` text DEFAULT NULL,
  \`seo_keywords\` varchar(500) DEFAULT NULL,
  \`facebook_post_id\` varchar(255) DEFAULT NULL,
  \`facebook_post_url\` varchar(500) DEFAULT NULL,
  \`facebook_posted_at\` datetime DEFAULT NULL,
  \`facebook_post_status\` varchar(50) DEFAULT NULL,
  \`facebook_post_error\` text DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`category_id\` (\`category_id\`),
  KEY \`slug\` (\`slug\`),
  KEY \`published_at\` (\`published_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  if (newsList && newsList.length > 0) {
    sql += `INSERT INTO \`news\` (\`id\`, \`category_id\`, \`title\`, \`slug\`, \`summary\`, \`content\`, \`author_name\`, \`featured_image\`, \`image_caption\`, \`views\`, \`is_featured\`, \`is_breaking\`, \`allow_comments\`, \`status\`, \`published_at\`, \`seo_title\`, \`seo_description\`, \`seo_keywords\`, \`facebook_post_id\`, \`facebook_post_url\`, \`facebook_posted_at\`, \`facebook_post_status\`) VALUES\n`;
    const newsRows = newsList.map(n => {
      return `(${n.id}, ${n.category_id}, ${escapeSql(n.title)}, ${escapeSql(n.slug)}, ${escapeSql(n.summary || '')}, ${escapeSql(n.content)}, ${escapeSql(n.author_name)}, ${escapeSql(n.featured_image)}, ${escapeSql(n.image_caption || '')}, ${n.views || 0}, ${n.is_featured ? 1 : 0}, ${n.is_breaking ? 1 : 0}, ${n.allow_comments !== false ? 1 : 0}, ${escapeSql(n.status)}, ${escapeSql(n.published_at)}, ${escapeSql(n.seo_title || n.title)}, ${escapeSql(n.seo_description || n.summary || n.title)}, ${escapeSql(n.seo_keywords || '')}, ${escapeSql(n.facebook_post_id)}, ${escapeSql(n.facebook_post_url)}, ${escapeSql(n.facebook_posted_at)}, ${escapeSql(n.facebook_post_status || 'idle')})`;
    });
    sql += newsRows.join(',\n') + ';\n\n';
  }

  // Blogs Table
  sql += `--
-- Table structure for \`blogs\`
--
DROP TABLE IF EXISTS \`blogs\`;
CREATE TABLE \`blogs\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`slug\` varchar(255) NOT NULL,
  \`summary\` text NOT NULL,
  \`content\` longtext NOT NULL,
  \`author_name\` varchar(150) NOT NULL,
  \`author_role\` varchar(150) NOT NULL,
  \`author_avatar\` varchar(500) DEFAULT NULL,
  \`cover_image\` varchar(500) NOT NULL,
  \`category_tag\` varchar(100) NOT NULL,
  \`reading_time_min\` int(11) NOT NULL DEFAULT 4,
  \`views\` int(11) NOT NULL DEFAULT 0,
  \`likes\` int(11) NOT NULL DEFAULT 0,
  \`is_featured\` tinyint(1) NOT NULL DEFAULT 0,
  \`status\` enum('published','draft') NOT NULL DEFAULT 'published',
  \`published_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`tags\` text DEFAULT NULL,
  \`seo_title\` varchar(255) DEFAULT NULL,
  \`seo_description\` text DEFAULT NULL,
  \`seo_keywords\` varchar(500) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  if (blogs && blogs.length > 0) {
    sql += `INSERT INTO \`blogs\` (\`id\`, \`title\`, \`slug\`, \`summary\`, \`content\`, \`author_name\`, \`author_role\`, \`author_avatar\`, \`cover_image\`, \`category_tag\`, \`reading_time_min\`, \`views\`, \`likes\`, \`is_featured\`, \`status\`, \`published_at\`, \`tags\`, \`seo_title\`, \`seo_description\`, \`seo_keywords\`) VALUES\n`;
    const blogRows = blogs.map(b => {
      const tagsStr = Array.isArray(b.tags) ? b.tags.join(',') : '';
      return `(${b.id}, ${escapeSql(b.title)}, ${escapeSql(b.slug)}, ${escapeSql(b.summary)}, ${escapeSql(b.content)}, ${escapeSql(b.author_name)}, ${escapeSql(b.author_role)}, ${escapeSql(b.author_avatar || '')}, ${escapeSql(b.cover_image)}, ${escapeSql(b.category_tag)}, ${b.reading_time_min || 4}, ${b.views || 0}, ${b.likes || 0}, ${b.is_featured ? 1 : 0}, ${escapeSql(b.status)}, ${escapeSql(b.published_at)}, ${escapeSql(tagsStr)}, ${escapeSql(b.seo_title || b.title)}, ${escapeSql(b.seo_description || b.summary)}, ${escapeSql(b.seo_keywords || '')})`;
    });
    sql += blogRows.join(',\n') + ';\n\n';
  }

  // Site Settings Table (Standardized with key_name and key_value)
  sql += `--
-- Table structure for \`settings\`
--
DROP TABLE IF EXISTS \`settings\`;
CREATE TABLE \`settings\` (
  \`key_name\` varchar(100) NOT NULL,
  \`key_value\` longtext DEFAULT NULL,
  PRIMARY KEY (\`key_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  const settingsEntries = [
    ['site_name', settings.site_name || 'বার্তাচিত্র'],
    ['site_tagline', settings.site_tagline || 'সংবাদ ও ছবি। Bartachitra'],
    ['logo_url', settings.logo_url || ''],
    ['favicon_url', settings.favicon_url || ''],
    ['editor_name', settings.editor_name || 'আহমেদ রফিক চৌধুরী'],
    ['executive_editor', settings.executive_editor || 'শাহনেওয়াজ করিম'],
    ['email', settings.email || 'editor@bartachitro.com'],
    ['phone', settings.phone || '+৮৮০ ২ ৯৮৭৬৫৪৩'],
    ['address', settings.address || 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫'],
    ['facebook_url', settings.facebook_url || 'https://facebook.com'],
    ['twitter_url', settings.twitter_url || 'https://twitter.com'],
    ['youtube_url', settings.youtube_url || 'https://youtube.com'],
    ['meta_description', settings.meta_description || ''],
    ['meta_keywords', settings.meta_keywords || ''],
    ['disable_ads', settings.disable_ads ? '1' : '0'],
    ['fixed_breaking_news', settings.fixed_breaking_news !== false ? '1' : '0'],
    ['facebook_auto_post', JSON.stringify(settings.facebook_auto_post || {
      enabled: false,
      page_id: '',
      page_access_token: '',
      post_type: 'photo',
      auto_post_on_create: true,
      auto_post_on_breaking: true,
      default_hashtags: '#বার্তাচিত্র #সংবাদ #বাংলাদেশ',
      test_mode: false
    })],
    ['android_app', JSON.stringify(settings.android_app || {
      enabled: true,
      app_name: 'বার্তাচিত্র - BartaChitro',
      version_name: 'v1.2.0',
      version_code: 12,
      apk_filename: 'bartachitro-v1.2.0.apk',
      apk_url: '/uploads/bartachitro-v1.2.0.apk',
      file_size_formatted: '14.8 MB',
      package_name: 'com.bartachitro.news',
      download_count: 1450
    })]
  ];

  sql += `INSERT INTO \`settings\` (\`key_name\`, \`key_value\`) VALUES\n`;
  sql += settingsEntries.map(([k, v]) => `(${escapeSql(k)}, ${escapeSql(v)})`).join(',\n') + ';\n\n';

  // Advertisements Table
  sql += `--
-- Table structure for \`advertisements\`
--
DROP TABLE IF EXISTS \`advertisements\`;
CREATE TABLE \`advertisements\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`position\` varchar(100) NOT NULL DEFAULT 'sidebar',
  \`image_url\` longtext NOT NULL,
  \`target_url\` text NOT NULL,
  \`status\` enum('active','inactive') NOT NULL DEFAULT 'active',
  \`views\` int(11) NOT NULL DEFAULT 0,
  \`clicks\` int(11) NOT NULL DEFAULT 0,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  if (ads && ads.length > 0) {
    sql += `INSERT INTO \`advertisements\` (\`id\`, \`title\`, \`position\`, \`image_url\`, \`target_url\`, \`status\`, \`views\`, \`clicks\`) VALUES\n`;
    sql += ads.map(a => `(${a.id}, ${escapeSql(a.title)}, ${escapeSql(a.position)}, ${escapeSql(a.image_url)}, ${escapeSql(a.target_url)}, ${escapeSql(a.status)}, ${a.views || 0}, ${a.clicks || 0})`).join(',\n') + ';\n\n';
  }

  // Contact Messages Table
  sql += `--
-- Table structure for \`contact_messages\`
--
DROP TABLE IF EXISTS \`contact_messages\`;
CREATE TABLE \`contact_messages\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(150) NOT NULL,
  \`email\` varchar(150) NOT NULL,
  \`phone\` varchar(50) DEFAULT NULL,
  \`subject\` varchar(255) NOT NULL,
  \`message\` text NOT NULL,
  \`is_read\` tinyint(1) NOT NULL DEFAULT 0,
  \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

`;

  // Epaper Tables
  sql += `--
-- Table structure for \`epaper\` & \`epaper_pages\`
--
DROP TABLE IF EXISTS \`epaper_pages\`;
DROP TABLE IF EXISTS \`epaper\`;
CREATE TABLE \`epaper\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) NOT NULL,
  \`edition_date\` date NOT NULL,
  \`total_pages\` int(11) NOT NULL DEFAULT 4,
  \`status\` enum('published','draft') NOT NULL DEFAULT 'published',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`epaper_pages\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`epaper_id\` int(11) NOT NULL,
  \`page_number\` int(11) NOT NULL,
  \`page_title\` varchar(150) NOT NULL,
  \`image_url\` varchar(500) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`epaper_id\` (\`epaper_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO \`epaper\` (\`id\`, \`title\`, \`edition_date\`, \`total_pages\`, \`status\`) VALUES
(1, 'বার্তাচিত্র জাতীয় সংস্করণ - আজকের ই-পত্রিকা', CURDATE(), 4, 'published');

INSERT INTO \`epaper_pages\` (\`id\`, \`epaper_id\`, \`page_number\`, \`page_title\`, \`image_url\`) VALUES
(1, 1, 1, 'প্রথম পাতা (প্রধান সংবাদ)', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1600&q=85'),
(2, 1, 2, 'জাতীয় ও রাজনীতির খবর', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1600&q=85'),
(3, 1, 3, 'অর্থ ও বাণিজ্য পাতা', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=85'),
(4, 1, 4, 'আন্তর্জাতিক ও বিনোদন', 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1600&q=85');

-- --------------------------------------------------------
-- Table structure for real-time analytics and traffic logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`daily_traffic\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`view_date\` DATE NOT NULL UNIQUE,
  \`total_views\` INT NOT NULL DEFAULT 0,
  \`news_views\` INT NOT NULL DEFAULT 0,
  \`blog_views\` INT NOT NULL DEFAULT 0,
  \`page_views\` INT NOT NULL DEFAULT 0,
  \`unique_visitors\` INT NOT NULL DEFAULT 0,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (\`view_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`view_logs\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`content_type\` ENUM('news', 'blog', 'page') NOT NULL DEFAULT 'news',
  \`content_id\` INT NULL,
  \`content_title\` VARCHAR(255) NULL,
  \`category_id\` INT NULL,
  \`category_name\` VARCHAR(100) NULL,
  \`ip_hash\` VARCHAR(64) NULL,
  \`user_agent\` VARCHAR(255) NULL,
  \`device_type\` VARCHAR(30) DEFAULT 'desktop',
  \`view_date\` DATE NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (\`view_date\`),
  INDEX (\`content_type\`, \`content_id\`),
  INDEX (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
`;

  return sql;
}

/**
 * Returns complete PHP code files for cPanel deployment
 */
export function getCpanelPhpTemplates(settings: SiteSettings) {
  const siteName = settings.site_name || 'বার্তাচিত্র';
  const siteTagline = settings.site_tagline || 'সংবাদ ও ছবি। Bartachitra';

  return {
    'config/database.php': `<?php
/**
 * BartaChitro - Database Configuration for cPanel
 * Update these credentials with your cPanel MySQL Database details
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'root');          // Replace with your cPanel DB username
define('DB_PASS', '');              // Replace with your cPanel DB password
define('DB_NAME', 'bartachitro_db'); // Replace with your cPanel DB name

function getDbConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            $pdo->exec("SET time_zone = '+06:00'");
        } catch (PDOException $e) {
            die("Database Connection Error: " . $e->getMessage());
        }
    }
    return $pdo;
}
`,

    'config/config.php': `<?php
/**
 * BartaChitro - Global Application Configurations
 */
date_default_timezone_set('Asia/Dhaka');
session_start();
require_once __DIR__ . '/database.php';

// Base URL detection
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$baseUrl = $protocol . $_SERVER['HTTP_HOST'] . rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
define('BASE_URL', $baseUrl);

// Helper to fetch site settings from database
function getSiteSettings() {
    $db = getDbConnection();
    $stmt = $db->query("SELECT setting_key, setting_value FROM site_settings");
    $settings = [];
    while ($row = $stmt->fetch()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    return $settings;
}

// Helper to format Bengali numbers
function bnNum($number) {
    $bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    $enDigits = ['0','1','2','3','4','5','6','7','8','9'];
    return str_replace($enDigits, $bnDigits, (string)$number);
}
`,

    '.htaccess': `DirectoryIndex index.php index.html
RewriteEngine On
RewriteBase /

# Force UTF-8 Encoding
AddDefaultCharset UTF-8

# Android APK MIME Type & Direct Download
<IfModule mod_mime.c>
    AddType application/vnd.android.package-archive .apk
</IfModule>
<FilesMatch "\\.apk$">
    Header set Content-Disposition "attachment"
    Header set Content-Type "application/vnd.android.package-archive"
    Header set Cache-Control "public, max-age=3600"
</FilesMatch>

# Route Facebook Auto Post API
RewriteRule ^api/facebook(/.*)?$ api/facebook.php [L,QSA]

# Clean URL Routing for News and Blogs
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^news/([a-zA-Z0-9_-]+)/?$ article.php?slug=$1 [L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^blog/([a-zA-Z0-9_-]+)/?$ blog.php?slug=$1 [L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^category/([a-zA-Z0-9_-]+)/?$ category.php?slug=$1 [L,QSA]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
`,

    'index.php': `<?php
require_once __DIR__ . '/config/config.php';
$db = getDbConnection();
$settings = getSiteSettings();

// Fetch categories
$categories = $db->query("SELECT * FROM categories WHERE status = 'active' ORDER BY display_order ASC")->fetchAll();

// Fetch breaking news
$breakingNews = $db->query("SELECT id, title, slug FROM news WHERE is_breaking = 1 AND status = 'published' ORDER BY published_at DESC LIMIT 5")->fetchAll();

// Fetch lead / featured news
$leadNews = $db->query("SELECT n.*, c.name as category_name FROM news n LEFT JOIN categories c ON n.category_id = c.id WHERE n.is_featured = 1 AND n.status = 'published' ORDER BY n.published_at DESC LIMIT 5")->fetchAll();

// Fetch latest news
$latestNews = $db->query("SELECT n.*, c.name as category_name FROM news n LEFT JOIN categories c ON n.category_id = c.id WHERE n.status = 'published' ORDER BY n.published_at DESC LIMIT 12")->fetchAll();

// Fetch latest blogs
$blogs = $db->query("SELECT * FROM blogs WHERE status = 'published' ORDER BY published_at DESC LIMIT 4")->fetchAll();

$pageTitle = htmlspecialchars($settings['site_name'] ?? '${siteName}') . ' - ' . htmlspecialchars($settings['site_tagline'] ?? '${siteTagline}');
$logoUrl = !empty($settings['logo_url']) ? $settings['logo_url'] : 'assets/logo.svg';
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
    <meta name="description" content="<?= htmlspecialchars($settings['meta_description'] ?? '') ?>">
    <meta name="keywords" content="<?= htmlspecialchars($settings['meta_keywords'] ?? '') ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.maateen.me/kalpurush/font.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @font-face {
            font-family: 'Hind Siliguri';
            font-display: swap;
            font-style: normal;
            font-weight: 100 900;
            src: url('https://fonts.gstatic.com/s/notosansbengali/v33/Cn-fJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mc4I3mYvNY.woff2') format('woff2');
            unicode-range: U+09E6-09EF;
        }
        @font-face {
            font-family: 'Kalpurush';
            font-display: swap;
            font-style: normal;
            font-weight: 100 900;
            src: url('https://fonts.gstatic.com/s/notosansbengali/v33/Cn-fJsCGWQxOjaGwMQ6fIiMywrNJIky6nvd8BjzVMvJx2mc4I3mYvNY.woff2') format('woff2');
            unicode-range: U+09E6-09EF;
        }
        body { font-family: 'Noto Sans Bengali', 'Hind Siliguri', sans-serif; background-color: #f8fafc; }
        .font-display, h1, h2, h3, h4, .news-headline { font-family: 'Kalpurush', 'Noto Serif Bengali', serif; font-weight: 700; -webkit-text-stroke: 0.35px currentColor; }
        .article-content, .news-body { font-family: 'Kalpurush', 'Noto Serif Bengali', serif; font-weight: 400; }
    </style>
</head>
<body class="text-slate-900">

    <!-- Top Header Bar -->
    <header class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="index.php" class="flex items-center gap-3">
                <img src="<?= htmlspecialchars($logoUrl) ?>" alt="<?= htmlspecialchars($settings['site_name'] ?? '${siteName}') ?>" class="h-12 w-auto object-contain max-w-[240px]">
            </a>
            <div class="hidden md:flex items-center gap-4 text-xs">
                <span class="text-slate-600"><?= date('l, d F Y') ?></span>
                <a href="epaper.php" class="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded text-xs transition">ই-পত্রিকা পড়ুন</a>
                <a href="admin/login.php" class="text-slate-600 hover:text-red-700 font-semibold">অ্যাডমিন লগইন</a>
            </div>
        </div>
        <!-- Category Navigation -->
        <nav class="bg-slate-900 text-white overflow-x-auto">
            <div class="max-w-7xl mx-auto px-4 flex items-center gap-5 text-sm font-semibold py-2 whitespace-nowrap">
                <a href="index.php" class="text-red-400">প্রচ্ছদ</a>
                <?php foreach ($categories as $cat): ?>
                    <a href="category.php?slug=<?= urlencode($cat['slug']) ?>" class="hover:text-red-400 transition"><?= htmlspecialchars($cat['name']) ?></a>
                <?php endforeach; ?>
                <a href="blog.php" class="text-amber-400 hover:text-amber-300">ব্লগ ও মুক্তচিন্তা</a>
                <a href="contact.php" class="hover:text-red-400">যোগাযোগ</a>
            </div>
        </nav>
    </header>

    <!-- Breaking News Ticker (Fixed or scroll based on settings) -->
    <?php if (!empty($breakingNews)): ?>
    <div class="<?= (!isset($settings['fixed_breaking_news']) || $settings['fixed_breaking_news'] == '1') ? 'sticky top-0 z-40 shadow-md ' : 'relative z-20 ' ?>bg-red-700 text-white py-2 px-3 shadow-inner border-b border-red-800">
        <div class="max-w-7xl mx-auto flex items-center gap-2 text-base sm:text-lg">
            <span class="bg-yellow-400 text-red-950 font-black px-2 py-0.5 rounded font-bengali-display tracking-tight text-xs shrink-0 shadow-2xs">ব্রেকিং<span class="hidden sm:inline"> নিউজ</span></span>
            <div class="truncate font-bold min-w-0 flex-1">
                <?php foreach ($breakingNews as $b): ?>
                    <a href="article.php?slug=<?= urlencode($b['slug']) ?>" class="hover:underline mr-6">▪ <?= htmlspecialchars($b['title']) ?></a>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    <?php endif; ?>

<!-- Main Container -->
<main class="max-w-7xl mx-auto px-4 py-6 space-y-8">
    <!-- Lead Section -->
    <?php if (!empty($leadNews)): 
        $first = $leadNews[0]; 
        $sideThree = array_slice($leadNews, 1, 3);
        $subsequent = array_slice($leadNews, 4);
    ?>
    <section class="space-y-4">
        <!-- ১ম প্রধান সংবাদ -->
        <div class="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-xs">
            <a href="article.php?slug=<?= urlencode($first['slug']) ?>" class="block group">
                <img src="<?= htmlspecialchars($first['featured_image']) ?>" class="w-full h-80 sm:h-96 object-cover group-hover:scale-101 transition duration-300">
                <div class="p-6 space-y-2">
                    <span class="text-xs text-red-700 font-bold uppercase"><?= htmlspecialchars($first['category_name'] ?? 'জাতীয়') ?></span>
                    <h1 class="text-2xl sm:text-3xl font-bold font-display text-slate-900 group-hover:text-red-700 leading-snug"><?= htmlspecialchars($first['title']) ?></h1>
                    <p class="text-slate-600 text-sm leading-relaxed"><?= htmlspecialchars($first['summary']) ?></p>
                </div>
            </a>
        </div>

        <!-- ১ম নিউজের পরে ৩টি নিউজ পাশাপাশি -->
        <?php if (!empty($sideThree)): ?>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-b border-slate-200 py-4">
            <?php foreach ($sideThree as $item): ?>
            <a href="article.php?slug=<?= urlencode($item['slug']) ?>" class="block bg-white p-3 rounded-lg border border-slate-200 hover:border-red-400 transition group flex flex-col">
                <img src="<?= htmlspecialchars($item['featured_image']) ?>" class="w-full aspect-[16/10] object-cover rounded mb-2">
                <span class="text-xs text-red-700 font-bold"><?= htmlspecialchars($item['category_name'] ?? 'সংবাদ') ?></span>
                <h3 class="text-base font-bold font-display line-clamp-3 hover:text-red-700 mt-1 leading-snug"><?= htmlspecialchars($item['title']) ?></h3>
            </a>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

        <!-- এরপরের নিউজগুলো নিচে নিচে -->
        <?php if (!empty($subsequent)): ?>
        <div class="divide-y divide-slate-200 bg-white rounded-lg border border-slate-200 p-4">
            <?php foreach ($subsequent as $item): ?>
            <a href="article.php?slug=<?= urlencode($item['slug']) ?>" class="py-3 flex gap-3 group">
                <img src="<?= htmlspecialchars($item['featured_image']) ?>" class="w-24 h-18 object-cover rounded shrink-0">
                <div>
                    <span class="text-[10px] text-red-700 font-bold"><?= htmlspecialchars($item['category_name'] ?? 'সংবাদ') ?></span>
                    <h4 class="text-sm font-bold line-clamp-2 group-hover:text-red-700"><?= htmlspecialchars($item['title']) ?></h4>
                    <span class="text-[11px] text-slate-500 mt-1 block"><?= htmlspecialchars($item['author_name']) ?></span>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </section>
    <?php endif; ?>

    <!-- Latest News Grid -->
    <section class="space-y-4">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-2">
            <h2 class="text-xl font-bold font-display text-slate-900">তাজা খবর</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <?php foreach ($latestNews as $item): ?>
            <article class="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition">
                <a href="article.php?slug=<?= urlencode($item['slug']) ?>">
                    <img src="<?= htmlspecialchars($item['featured_image']) ?>" class="w-full h-44 object-cover">
                    <div class="p-4 space-y-1.5">
                        <span class="text-[11px] text-red-700 font-bold"><?= htmlspecialchars($item['category_name'] ?? 'সংবাদ') ?></span>
                        <h3 class="text-sm font-bold font-display line-clamp-2 hover:text-red-700"><?= htmlspecialchars($item['title']) ?></h3>
                        <p class="text-xs text-slate-500 line-clamp-2"><?= htmlspecialchars($item['summary']) ?></p>
                    </div>
                </a>
            </article>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- Blogs Section -->
    <?php if (!empty($blogs)): ?>
    <section class="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
                <span class="text-xs text-red-400 font-bold uppercase tracking-wider">মুক্তচিন্তা ও মতামত</span>
                <h2 class="text-2xl font-bold font-display">আমাদের সম্পাদকীয় ও ব্লগ</h2>
            </div>
            <a href="blog.php" class="text-xs bg-red-700 hover:bg-red-800 text-white font-bold px-4 py-2 rounded-lg transition">সবগুলো ব্লগ দেখুন</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <?php foreach ($blogs as $b): ?>
            <a href="blog.php?slug=<?= urlencode($b['slug']) ?>" class="bg-slate-800/80 hover:bg-slate-800 rounded-xl overflow-hidden border border-slate-700/80 p-4 flex flex-col justify-between group transition">
                <div>
                    <img src="<?= htmlspecialchars($b['cover_image']) ?>" class="w-full h-36 object-cover rounded-lg mb-3">
                    <span class="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded font-semibold"><?= htmlspecialchars($b['category_tag']) ?></span>
                    <h4 class="text-sm font-bold font-display mt-2 group-hover:text-red-400 line-clamp-2"><?= htmlspecialchars($b['title']) ?></h4>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                    <span><?= htmlspecialchars($b['author_name']) ?></span>
                    <span><?= bnNum($b['reading_time_min']) ?> মিনিট পড়া</span>
                </div>
            </a>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>
</main>

<!-- Footer -->
<footer class="bg-slate-950 text-slate-300 mt-16 pt-12 pb-8 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
        <div class="space-y-3">
            <img src="<?= htmlspecialchars($logoUrl) ?>" class="h-10 w-auto">
            <p class="text-slate-400 leading-relaxed"><?= htmlspecialchars($settings['site_tagline'] ?? '${siteTagline}') ?></p>
        </div>
        <div>
            <h4 class="font-bold text-white mb-3">যোগাযোগ</h4>
            <p class="text-slate-400"><?= htmlspecialchars($settings['address'] ?? '') ?></p>
            <p class="text-slate-400 mt-2">ফোন: <?= htmlspecialchars($settings['phone'] ?? '') ?></p>
            <p class="text-slate-400">ইমেইল: <?= htmlspecialchars($settings['email'] ?? '') ?></p>
        </div>
        <div>
            <h4 class="font-bold text-white mb-3">সম্পাদকীয় পর্ষদ</h4>
            <p class="text-slate-400">প্রধান সম্পাদক: <?= htmlspecialchars($settings['editor_name'] ?? '') ?></p>
            <p class="text-slate-400">নির্বাহী সম্পাদক: <?= htmlspecialchars($settings['executive_editor'] ?? '') ?></p>
        </div>
        <div>
            <h4 class="font-bold text-white mb-3">প্রয়োজনীয় লিংক</h4>
            <ul class="space-y-1.5 text-slate-400">
                <li><a href="epaper.php" class="hover:text-white">ই-পত্রিকা</a></li>
                <li><a href="blog.php" class="hover:text-white">ব্লগ ও মুক্তচিন্তা</a></li>
                <li><a href="contact.php" class="hover:text-white">যোগাযোগ</a></li>
                <li><a href="admin/login.php" class="hover:text-white">অ্যাডমিন প্যানেল</a></li>
            </ul>
        </div>
    </div>
    <div class="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 text-center text-slate-500 text-[11px]">
        &copy; <?= date('Y') ?> <?= htmlspecialchars($settings['site_name'] ?? '${siteName}') ?>। সর্বস্বত্ব সংরক্ষিত। cPanel ও MySQL সমর্থিত।
    </div>
</footer>

</body>
</html>
`,

    'article.php': `<?php
require_once __DIR__ . '/config/config.php';
$db = getDbConnection();
$settings = getSiteSettings();

$slug = $_GET['slug'] ?? '';
$id = (int)($_GET['id'] ?? 0);

if (!empty($slug)) {
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug FROM news n LEFT JOIN categories c ON n.category_id = c.id WHERE n.slug = ? AND n.status = 'published'");
    $stmt->execute([$slug]);
    $article = $stmt->fetch();
} elseif ($id > 0) {
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug FROM news n LEFT JOIN categories c ON n.category_id = c.id WHERE n.id = ? AND n.status = 'published'");
    $stmt->execute([$id]);
    $article = $stmt->fetch();
} else {
    header("Location: index.php");
    exit;
}

if (!$article) {
    die("সংবাদটি পাওয়া যায়নি বা সরিয়ে ফেলা হয়েছে। <a href='index.php'>প্রচ্ছদে ফিরুন</a>");
}

// Increment view count
$db->prepare("UPDATE news SET views = views + 1 WHERE id = ?")->execute([$article['id']]);

// Related news
$relatedStmt = $db->prepare("SELECT id, title, slug, featured_image, published_at FROM news WHERE category_id = ? AND id != ? AND status = 'published' ORDER BY published_at DESC LIMIT 4");
$relatedStmt->execute([$article['category_id'], $article['id']]);
$relatedNews = $relatedStmt->fetchAll();

$pageTitle = htmlspecialchars($article['seo_title'] ?: $article['title']) . ' - ' . htmlspecialchars($settings['site_name'] ?? '${siteName}');
$seoDesc = htmlspecialchars($article['seo_description'] ?: $article['summary']);
$seoKeywords = htmlspecialchars($article['seo_keywords'] ?: ($settings['meta_keywords'] ?? ''));
$logoUrl = !empty($settings['logo_url']) ? $settings['logo_url'] : 'assets/logo.svg';
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $pageTitle ?></title>
    <meta name="description" content="<?= $seoDesc ?>">
    <meta name="keywords" content="<?= $seoKeywords ?>">
    <!-- Open Graph for Facebook / Social Media -->
    <meta property="og:title" content="<?= htmlspecialchars($article['title']) ?>">
    <meta property="og:description" content="<?= $seoDesc ?>">
    <meta property="og:image" content="<?= htmlspecialchars($article['featured_image']) ?>">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.maateen.me/kalpurush/font.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; background-color: #f8fafc; }
        .font-display, h1, h2, h3, h4 { font-family: 'Kalpurush', 'Noto Serif Bengali', serif; font-weight: 700; }
        .article-content, .news-body { font-family: 'Kalpurush', 'Noto Serif Bengali', serif; font-weight: 400; line-height: 1.8; }
        .article-content p { font-family: 'Kalpurush', 'Noto Serif Bengali', serif; font-weight: 400; line-height: 1.8; }
        .article-content img { border-radius: 0.5rem; margin: 1rem 0; max-width: 100%; height: auto; }
        .article-content blockquote { border-left: 4px solid #b91c1c; padding-left: 1rem; font-style: italic; color: #475569; margin: 1.5rem 0; }
    </style>
</head>
<body class="text-slate-900">

<header class="bg-white border-b border-slate-200 py-3 shadow-xs sticky top-0 z-30">
    <div class="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <a href="index.php"><img src="<?= htmlspecialchars($logoUrl) ?>" class="h-10 w-auto"></a>
        <a href="index.php" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded">← প্রচ্ছদে ফিরুন</a>
    </div>
</header>

<main class="max-w-4xl mx-auto px-4 py-8">
    <article class="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="space-y-3">
            <span class="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded">
                <?= htmlspecialchars($article['category_name'] ?? 'সংবাদ') ?>
            </span>
            <h1 class="text-2xl sm:text-4xl font-bold font-display text-slate-900 leading-snug">
                <?= htmlspecialchars($article['title']) ?>
            </h1>
            <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
                <span>প্রতিবেদক: <strong><?= htmlspecialchars($article['author_name']) ?></strong></span>
                <span>প্রকাশ: <?= htmlspecialchars($article['published_at']) ?> | পঠিত: <?= bnNum($article['views']) ?> বার</span>
            </div>
        </div>

        <figure class="rounded-xl overflow-hidden">
            <img src="<?= htmlspecialchars($article['featured_image']) ?>" alt="<?= htmlspecialchars($article['title']) ?>" class="w-full h-auto max-h-[500px] object-cover">
            <?php if (!empty($article['image_caption'])): ?>
            <figcaption class="text-xs text-slate-500 mt-2 text-center italic"><?= htmlspecialchars($article['image_caption']) ?></figcaption>
            <?php endif; ?>
        </figure>

        <div class="text-slate-700 leading-relaxed text-base sm:text-lg article-content font-bengali-body space-y-4">
            <?= $article['content'] ?>
        </div>
    </article>

    <!-- Related news -->
    <?php if (!empty($relatedNews)): ?>
    <section class="mt-10 space-y-4">
        <h3 class="text-lg font-bold font-display text-slate-900 border-b border-slate-300 pb-2">সম্পর্কিত আরও সংবাদ</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <?php foreach ($relatedNews as $rn): ?>
            <a href="article.php?slug=<?= urlencode($rn['slug']) ?>" class="bg-white p-3 rounded-lg border border-slate-200 hover:shadow-md transition block">
                <img src="<?= htmlspecialchars($rn['featured_image']) ?>" class="w-full h-32 object-cover rounded mb-2">
                <h4 class="text-xs font-bold font-display line-clamp-2 hover:text-red-700"><?= htmlspecialchars($rn['title']) ?></h4>
            </a>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>
</main>

<footer class="bg-slate-900 text-slate-400 py-6 text-center text-xs mt-12">
    &copy; <?= date('Y') ?> <?= htmlspecialchars($settings['site_name'] ?? '${siteName}') ?>। সর্বস্বত্ব সংরক্ষিত।
</footer>
</body>
</html>
`,

    'api/analytics.php': `<?php
/**
 * BartaChitro - Real-Time Analytics & Traffic Counting API for cPanel
 */
require_once __DIR__ . '/../config/config.php';
header('Content-Type: application/json; charset=utf-8');

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $today = date('Y-m-d');
    $range = $_GET['range'] ?? 'weekly';

    $newsStmt = $db->query("SELECT COALESCE(SUM(views), 0) as total, COUNT(*) as count FROM news");
    $newsData = $newsStmt->fetch() ?: ['total' => 0, 'count' => 0];

    $blogStmt = $db->query("SELECT COALESCE(SUM(views), 0) as total, COUNT(*) as count FROM blogs");
    $blogData = $blogStmt->fetch() ?: ['total' => 0, 'count' => 0];

    $todayStmt = $db->prepare("SELECT * FROM daily_traffic WHERE view_date = :today");
    $todayStmt->execute([':today' => $today]);
    $todayRow = $todayStmt->fetch();

    $weeklyStmt = $db->prepare("SELECT COALESCE(SUM(total_views), 0) as total FROM daily_traffic WHERE view_date >= DATE_SUB(:today, INTERVAL 6 DAY)");
    $weeklyStmt->execute([':today' => $today]);
    $weeklyTotal = (int)($weeklyStmt->fetch()['total'] ?? 0);

    $monthlyStmt = $db->prepare("SELECT COALESCE(SUM(total_views), 0) as total FROM daily_traffic WHERE view_date >= DATE_SUB(:today, INTERVAL 29 DAY)");
    $monthlyStmt->execute([':today' => $today]);
    $monthlyTotal = (int)($monthlyStmt->fetch()['total'] ?? 0);

    $daysCount = $range === 'today' ? 1 : ($range === 'monthly' ? 14 : ($range === 'all' ? 30 : 7));
    $chartPoints = [];
    $bengaliDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

    for ($i = $daysCount - 1; $i >= 0; $i--) {
        $dateStr = date('Y-m-d', strtotime("-{$i} days"));
        $timestamp = strtotime($dateStr);
        $dayName = $bengaliDays[(int)date('w', $timestamp)];
        $dayNum = date('j', $timestamp);

        $stmt = $db->prepare("SELECT total_views, news_views, blog_views FROM daily_traffic WHERE view_date = :date");
        $stmt->execute([':date' => $dateStr]);
        $row = $stmt->fetch();

        $chartPoints[] = [
            'date' => $dateStr,
            'day' => "{$dayName} ({$dayNum})",
            'views' => $row ? (int)$row['total_views'] : 0,
            'news_views' => $row ? (int)$row['news_views'] : 0,
            'blog_views' => $row ? (int)$row['blog_views'] : 0
        ];
    }

    $recentStmt = $db->query("SELECT * FROM view_logs ORDER BY id DESC LIMIT 8");
    $recentViews = $recentStmt ? $recentStmt->fetchAll() : [];

    echo json_encode([
        'status' => 'ok',
        'metrics' => [
            'grand_total_views' => (int)$newsData['total'] + (int)$blogData['total'],
            'total_news_views' => (int)$newsData['total'],
            'total_blog_views' => (int)$blogData['total'],
            'today_views' => $todayRow ? (int)$todayRow['total_views'] : 0,
            'today_news_views' => $todayRow ? (int)$todayRow['news_views'] : 0,
            'today_blog_views' => $todayRow ? (int)$todayRow['blog_views'] : 0,
            'today_unique' => $todayRow ? (int)$todayRow['unique_visitors'] : 0,
            'weekly_views' => $weeklyTotal,
            'monthly_views' => $monthlyTotal,
            'total_news_count' => (int)$newsData['count'],
            'total_blog_count' => (int)$blogData['count']
        ],
        'chart_data' => $chartPoints,
        'recent_views' => $recentViews
    ]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true) ?: $_POST;
    $action = $input['action'] ?? 'record';

    if ($action === 'reset_views') {
        $db->exec("UPDATE news SET views = 0");
        $db->exec("UPDATE blogs SET views = 0");
        $db->exec("DELETE FROM daily_traffic");
        $db->exec("DELETE FROM view_logs");
        echo json_encode(['status' => 'ok', 'message' => 'সকল ডেমো ভিউ রিসেট সফল হয়েছে']);
        exit;
    }

    $type = in_array($input['type'] ?? '', ['news', 'blog', 'page']) ? $input['type'] : 'news';
    $id = isset($input['id']) ? (int)$input['id'] : null;
    $today = date('Y-m-d');
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $ipHash = hash('sha256', $ip . '-' . $today);

    if ($type === 'news' && $id) {
        $db->prepare("UPDATE news SET views = views + 1 WHERE id = :id")->execute([':id' => $id]);
    } elseif ($type === 'blog' && $id) {
        $db->prepare("UPDATE blogs SET views = views + 1 WHERE id = :id")->execute([':id' => $id]);
    }

    $newsInc = ($type === 'news') ? 1 : 0;
    $blogInc = ($type === 'blog') ? 1 : 0;
    $pageInc = ($type === 'page') ? 1 : 0;

    $upsert = $db->prepare("
        INSERT INTO daily_traffic (view_date, total_views, news_views, blog_views, page_views, unique_visitors)
        VALUES (:today, 1, :news_inc, :blog_inc, :page_inc, 1)
        ON DUPLICATE KEY UPDATE 
            total_views = total_views + 1,
            news_views = news_views + :news_inc2,
            blog_views = blog_views + :blog_inc2,
            page_views = page_views + :page_inc2
    ");
    $upsert->execute([
        ':today' => $today,
        ':news_inc' => $newsInc,
        ':blog_inc' => $blogInc,
        ':page_inc' => $pageInc,
        ':news_inc2' => $newsInc,
        ':blog_inc2' => $blogInc,
        ':page_inc2' => $pageInc
    ]);

    echo json_encode(['status' => 'ok', 'message' => 'View counted successfully']);
    exit;
}
`,

    'README-cPanel-Setup.txt': `========================================================================
বার্তাচিত্র (BartaChitro) - cPanel Hosting & MySQL Database Installation
========================================================================

অভিনন্দন! আপনার বার্তাচিত্র নিউজপেপার পোর্টালটি cPanel এবং যেকোনো Apache/Nginx + PHP 7.4/8.x + MySQL হোস্টিংয়ে রান করার জন্য সম্পূর্ণ প্রস্তুত।

ধাপ ১: cPanel-এ ডাটাবেজ তৈরি (Create MySQL Database)
------------------------------------------------------------------------
১) আপনার cPanel এ লগইন করুন।
২) "MySQL Databases" উইজার্ডে যান।
৩) একটি নতুন ডাটাবেজ তৈরি করুন (যেমন: youruser_bartachitro)।
৪) একটি নতুন ডাটাবেজ ব্যবহারকারী (User) ও পাসওয়ার্ড তৈরি করুন।
৫) User-কে উক্ত Database-এ যুক্ত করুন এবং "ALL PRIVILEGES" সিলেক্ট করে Save করুন।

ধাপ ২: ডাটাবেজ ইমপোর্ট (Import database/database.sql in phpMyAdmin)
------------------------------------------------------------------------
১) cPanel থেকে "phpMyAdmin" ওপেন করুন।
২) বাম পাশের তালিকা থেকে আপনার তৈরি করা নতুন ডাটাবেজে ক্লিক করুন।
৩) উপরে "Import" ট্যাবে ক্লিক করুন।
৪) "Choose File" দিয়ে এই প্যাকেজের 'database/database.sql' ফাইলটি সিলেক্ট করুন।
৫) নিচে "Go / Import" বাটনে ক্লিক করুন। (সকল টেবিল ও সংবাদের ডাম্প সফলভাবে ইমপোর্ট হয়ে যাবে)।

ধাপ ৩: ফাইল আপলোড (Upload Website Files)
------------------------------------------------------------------------
১) cPanel এর "File Manager" এ যান এবং 'public_html' ফোল্ডারে প্রবেশ করুন।
২) এই সম্পূর্ণ জিপ ফাইলটি আপলোড করে Extract করুন।

ধাপ ৪: ডাটাবেজ ক্রেডেনশিয়াল আপডেট (Config File Update)
------------------------------------------------------------------------
১) 'config/database.php' ফাইলটি এডিট করুন।
২) আপনার ডাটাবেজের নাম, ইউজার ও পাসওয়ার্ড বসিয়ে সেভ করুন:
   define('DB_HOST', 'localhost');
   define('DB_USER', 'আপনার_cPanel_db_user');
   define('DB_PASS', 'আপনার_cPanel_db_password');
   define('DB_NAME', 'আপনার_cPanel_db_name');

ধাপ ৫: ওয়েবসাইট ও অ্যাডমিন প্যানেলে লগইন
------------------------------------------------------------------------
ওয়েবসাইট ভিজিট: https://yourdomain.com
অ্যাডমিন প্যানেল: https://yourdomain.com/admin/login.php

ডিফল্ট লগইন একাউন্টসমূহ:
১. সুপার অ্যাডমিন (Super Admin):
   ইউজারনেম: admin
   পাসওয়ার্ড: admin123

২. বার্তা সম্পাদক (Editor):
   ইউজারনেম: editor_nasrin
   পাসওয়ার্ড: admin123

৩. মডারেটর (Moderator):
   ইউজারনেম: mod_tanveer
   পাসওয়ার্ড: admin123

লগইন করার পর অনুগ্রহ করে আপনার পাসওয়ার্ড পরিবর্তন করে নিন।
`
  };
}
