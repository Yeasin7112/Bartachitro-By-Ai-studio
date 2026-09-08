-- =======================================================
-- BartaChitro (বার্তাচিত্র) Database Schema & Initial Data
-- MySQL 8.0+ Compatible with utf8mb4 collation
-- Ready for phpMyAdmin import on localhost or cPanel
-- =======================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+06:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Table structure for table `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'editor', 'reporter') NOT NULL DEFAULT 'editor',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `categories`
--
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `name_en` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `news`
--
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED DEFAULT 1,
  `author_name` VARCHAR(100) NOT NULL DEFAULT 'বার্তাচিত্র ডেস্ক',
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(255) NOT NULL,
  `image_caption` VARCHAR(255) DEFAULT NULL,
  `video_url` VARCHAR(500) DEFAULT NULL,
  `status` ENUM('published', 'draft', 'archived') NOT NULL DEFAULT 'published',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_breaking` TINYINT(1) NOT NULL DEFAULT 0,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `published_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `seo_keywords` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status_published` (`status`, `published_at`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_is_breaking` (`is_breaking`),
  CONSTRAINT `fk_news_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `news_views`
--
CREATE TABLE IF NOT EXISTS `news_views` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `news_id` INT UNSIGNED NOT NULL,
  `ip_hash` VARCHAR(64) NOT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `viewed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_news_view` (`news_id`, `ip_hash`, `viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `epapers`
--
CREATE TABLE IF NOT EXISTS `epapers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `edition_date` DATE NOT NULL UNIQUE,
  `cover_image` VARCHAR(255) NOT NULL,
  `total_pages` INT UNSIGNED NOT NULL DEFAULT 1,
  `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `epaper_pages`
--
CREATE TABLE IF NOT EXISTS `epaper_pages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `epaper_id` INT UNSIGNED NOT NULL,
  `page_number` INT UNSIGNED NOT NULL,
  `page_title` VARCHAR(100) DEFAULT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_epaper_page` (`epaper_id`, `page_number`),
  CONSTRAINT `fk_epaper_pages` FOREIGN KEY (`epaper_id`) REFERENCES `epapers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `ads`
--
CREATE TABLE IF NOT EXISTS `ads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(100) NOT NULL,
  `position` ENUM('header_top', 'home_middle', 'sidebar', 'article_inline', 'footer_top') NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `target_url` VARCHAR(255) NOT NULL DEFAULT '#',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `clicks` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `settings`
--
CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(50) NOT NULL,
  `key_value` TEXT DEFAULT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `contact_messages`
--
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `subject` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `blogs`
--
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `author_name` VARCHAR(100) NOT NULL,
  `author_role` VARCHAR(100) DEFAULT 'কলামিস্ট',
  `author_avatar` VARCHAR(255) DEFAULT NULL,
  `cover_image` VARCHAR(255) NOT NULL,
  `video_url` VARCHAR(500) DEFAULT NULL,
  `category_tag` VARCHAR(100) NOT NULL DEFAULT 'মতামত',
  `reading_time_min` INT UNSIGNED NOT NULL DEFAULT 4,
  `views` INT UNSIGNED NOT NULL DEFAULT 0,
  `likes` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('published', 'draft') NOT NULL DEFAULT 'published',
  `tags` VARCHAR(255) DEFAULT NULL,
  `seo_title` VARCHAR(255) DEFAULT NULL,
  `seo_description` TEXT DEFAULT NULL,
  `seo_keywords` VARCHAR(255) DEFAULT NULL,
  `published_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- INITIAL SEED DATA
-- =======================================================

-- 1. Default Admin (Password: admin123)
-- Hash generated using password_hash('admin123', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `name`, `email`, `username`, `password`, `role`, `status`) VALUES
(1, 'প্রধান সম্পাদক (Chief Editor)', 'admin@bartachitro.com', 'admin', '$2y$10$eQ3P8k9jG4rWJ28iRkF4u.2KxN8YQ/rFkK11jG6wE5gT/v9L1K4uS', 'admin', 'active')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 2. Default Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `name_en`, `display_order`, `status`) VALUES
(1, 'জাতীয়', 'national', 'National', 1, 'active'),
(2, 'রাজনীতি', 'politics', 'Politics', 2, 'active'),
(3, 'আন্তর্জাতিক', 'international', 'International', 3, 'active'),
(4, 'সারাদেশ', 'country', 'Countrywide', 4, 'active'),
(5, 'খেলাধুলা', 'sports', 'Sports', 5, 'active'),
(6, 'বিনোদন', 'entertainment', 'Entertainment', 6, 'active'),
(7, 'প্রযুক্তি', 'technology', 'Technology', 7, 'active'),
(8, 'মতামত', 'opinion', 'Opinion', 8, 'active')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 3. Default Settings
INSERT INTO `settings` (`key_name`, `key_value`) VALUES
('site_name', 'বার্তাচিত্র'),
('site_name_en', 'BartaChitro'),
('tagline', 'সত্যের সংবাদ, সবার ভাষায়'),
('email', 'editor@bartachitro.com'),
('phone', '+৮৮০ ২ ৯৮৭৬৫৪৩, ০১৭১১-০০০০০০'),
('address', 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ'),
('editor_name', 'আহমেদ রফিক চৌধুরী'),
('executive_editor', 'শাহনেওয়াজ করিম'),
('facebook_url', 'https://facebook.com/bartachitro'),
('twitter_url', 'https://x.com/bartachitro'),
('youtube_url', 'https://youtube.com/bartachitro'),
('instagram_url', 'https://instagram.com/bartachitro'),
('meta_title', 'বার্তাচিত্র | সত্যের সংবাদ, সবার ভাষায়'),
('meta_description', 'বাংলাদেশের শীর্ষ অনলাইন সংবাদ মাধ্যম ও ই-পত্রিকা। রাজনীতি, জাতীয়, খেলাধুলা ও আন্তর্জাতিক সংবাদের নির্ভরযোগ্য উৎস।'),
('copyright_text', '© ২০২৬ বার্তাচিত্র মিডিয়া লিমিটেড। সর্বস্বত্ব সংরক্ষিত।')
ON DUPLICATE KEY UPDATE `key_name`=`key_name`;

-- 4. Initial Sample News
INSERT INTO `news` (`id`, `category_id`, `author_id`, `author_name`, `title`, `slug`, `summary`, `content`, `featured_image`, `image_caption`, `status`, `is_featured`, `is_breaking`, `views`, `published_at`, `seo_title`, `seo_description`) VALUES
(1, 1, 1, 'নিজস্ব প্রতিবেদক', 'পাহাড়ি ঢলে পূর্বাঞ্চলের বন্যায় ক্ষয়ক্ষতি নিরূপণে বিশেষ টাস্কফোর্স গঠন', 'flood-damage-assessment-taskforce-formed', 'উজানের পাহাড়ি ঢল ও অতিবৃষ্টিতে সৃষ্ট আকস্মিক বন্যার ক্ষয়ক্ষতি কাটিয়ে উঠতে এবং পুনর্বাসন দ্রুততম সময়ে শেষ করতে উচ্চক্ষমতাসম্পন্ন আন্তঃমন্ত্রণালয় টাস্কফোর্স গঠন করা হয়েছে।', '<p>উজানের পাহাড়ি ঢল ও অবিরাম ভারী বৃষ্টিপাতে দেশের পূর্বাঞ্চলের জেলাগুলোতে আকস্মিক বন্যায় ব্যাপক ক্ষয়ক্ষতি হয়েছে। পরিস্থিতি মোকাবিলা, খাদ্য ও চিকিৎসা সহায়তা নিশ্চিতকরণ এবং ক্ষতিগ্রস্তদের স্থায়ী পুনর্বাসনে একটি উচ্চপর্যায়ের জাতীয় টাস্কফোর্স গঠন করা হয়েছে।</p><p>আজ শনিবার সংশ্লিষ্ট মন্ত্রণালয়ের এক জরুরি ব্রিফিংয়ে এ সিদ্ধান্তের কথা জানানো হয়। টাস্কফোর্সের প্রধান সমন্বয়কারী জানান, দুর্গত প্রতিটি ইউনিয়নে জরুরি ত্রাণ সরবরাহের পাশাপাশি কৃষকদের ক্ষতিপূরণ এবং ভেঙে যাওয়া সড়ক ও বাঁধ মেরামতে সর্বোচ্চ অগ্রাধিকার দেওয়া হচ্ছে।</p><p>স্থানীয় প্রশাসনের তথ্য অনুযায়ী, পানি কমতে শুরু করলেও পানিবাহিত রোগের প্রাদুর্ভাব ঠেকাতে ভ্রাম্যমাণ মেডিকেল টিম সার্বক্ষণিক কাজ করছে। সেনাবাহিনী, কোস্টগার্ড ও স্থানীয় স্বেচ্ছাসেবকদের যৌথ উদ্যোগে ত্রাণ কার্যক্রম অব্যাহত রয়েছে।</p>', 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80', 'বন্যাদুর্গত এলাকায় সেনা ও স্থানীয় স্বেচ্ছাসেবকদের ত্রাণ বিতরণ। ছবি: বার্তাচিত্র', 'published', 1, 1, 1284, '2026-09-05 10:30:00', 'পাহাড়ি ঢলে পূর্বাঞ্চলের বন্যায় টাস্কফোর্স গঠন | বার্তাচিত্র', 'উজানের পাহাড়ি ঢলে পূর্বাঞ্চলের বন্যায় ক্ষয়ক্ষতি নিরূপণ ও পুনর্বাসনে বিশেষ টাস্কফোর্স গঠন করা হয়েছে।'),

(2, 2, 1, 'রাজনৈতিক প্রতিবেদক', 'নির্বাচনী রোডম্যাপ ও সার্বিক সংস্কার প্রস্তাব নিয়ে রাজনৈতিক দলগুলোর সঙ্গে সংলাপ শুরু', 'dialogue-starts-with-political-parties-on-reform-roadmap', 'রাষ্ট্র সংস্কার ও একটি অবাধ-সুষ্ঠু জাতীয় নির্বাচন আয়োজনের রূপরেখা চূড়ান্ত করতে রাজনৈতিক দলগুলোর সঙ্গে ধারাবাহিক মতবিনিময় শুরু করেছে জাতীয় কমিশন।', '<p>রাষ্ট্রের বিভিন্ন খাতে মৌলিক সংস্কার এবং একটি নিরপেক্ষ, গ্রহণযোগ্য নির্বাচন ব্যবস্থা গড়ে তোলার লক্ষ্যে রাজনৈতিক দলগুলোর শীর্ষ নেতাদের সঙ্গে সংলাপ শুরু হয়েছে।</p><p>প্রথম দিনের বৈঠকে অংশ নেওয়া নেতৃবৃন্দ সংবিধান সংশোধন, বিচার বিভাগের পূর্ণ স্বাধীনতা ও নির্বাচন কমিশনের প্রশাসনিক সক্ষমতা বৃদ্ধির ওপর জোর দেন। কমিশন আশ্বস্ত করেছে যে সকল মহলের সুচিন্তিত মতামত গ্রহণ করেই চূড়ান্ত সুপারিশমালা তৈরি করা হবে।</p>', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80', 'সংলাপে অংশ নেওয়া নেতৃবৃন্দের আলোচনা। ছবি: বার্তাচিত্র', 'published', 0, 1, 952, '2026-09-05 09:15:00', 'নির্বাচনী রোডম্যাপ নিয়ে সংলাপ শুরু | বার্তাচিত্র', 'রাজনৈতিক দলগুলোর সঙ্গে সংস্কার সংলাপ শুরু।'),

(3, 5, 1, 'ক্রীড়া প্রতিবেদক', 'ঘরের মাঠে শ্বাসরুদ্ধকর লড়াইয়ে শ্রীলঙ্কাকে হারিয়ে সিরিজ জয় বাংলাদেশের', 'bangladesh-secures-series-win-against-sri-lanka', 'শেষ ওভারের টানটান উত্তেজনায় ৩ উইকেটের রুদ্ধশ্বাস জয়ে তিন ম্যাচের ওয়ানডে সিরিজ ২-১ ব্যবধানে জিতে নিল বাংলাদেশ ক্রিকেট দল।', '<p>মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে আজ এক নাটকীয় ম্যাচে সফরকারী শ্রীলঙ্কাকে হারিয়ে সিরিজ নিজেদের করে নিল বাংলাদেশ।</p><p>২৬৫ রানের লক্ষ্যে ব্যাট করতে নেমে টপ অর্ডারের বিপর্যয়ের পর মিডল অর্ডারের দায়িত্বশীল ব্যাটিং ও শেষ দিকে অলরাউন্ডারদের দারুণ দৃঢ়তায় দল জয়ের বন্দরে পৌঁছে যায়। ম্যাচসেরা হয়েছেন দুর্দান্ত অপরাজিত ইনিংস উপহার দেওয়া ক্রিকেটার।</p>', 'https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80', 'সিরিজ জয়ের পর উল্লাসে মাতে টাইগাররা। ছবি: বার্তাচিত্র', 'published', 0, 1, 3140, '2026-09-05 08:45:00', 'শ্রীলঙ্কাকে হারিয়ে সিরিজ জয় বাংলাদেশের | বার্তাচিত্র', 'শেষ ওভারের শ্বাসরুদ্ধকর লড়াইয়ে ওয়ানডে সিরিজ জয়।'),

(4, 7, 1, 'বিজ্ঞান ও প্রযুক্তি ডেস্ক', 'দেশে প্রথম সেমিকন্ডাক্টর ডিজাইন ল্যাব উদ্বোধন, তৈরি হচ্ছে প্রযুক্তিবিদদের নতুন দিগন্ত', 'first-semiconductor-design-lab-inaugurated', 'হাইটেক পার্কে আন্তর্জাতিক মানের মাইক্রোচিপ ও ভিএলএসআই ডিজাইন সেন্টারের আনুষ্ঠানিক যাত্রা শুরু হলো।', '<p>চতুর্থ শিল্পবিপ্লবের বৈশ্বিক চ্যালেঞ্জ মোকাবিলা ও নিজেদের উদ্ভাবনী শক্তি বিকাশে দেশে প্রথম অত্যাধুনিক সেমিকন্ডাক্টর ডিজাইন ল্যাব চালু করা হয়েছে। এর মাধ্যমে স্থানীয় প্রকৌশলীরা আন্তর্জাতিক বাজারের সমমানের মাইক্রোচিপ ডিজাইনে অবদান রাখতে পারবেন।</p>', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 'সেমিকন্ডাক্টর গবেষণা ল্যাব। ছবি: বার্তাচিত্র', 'published', 0, 0, 720, '2026-09-05 07:20:00', 'দেশে প্রথম সেমিকন্ডাক্টর ডিজাইন ল্যাব উদ্বোধন | বার্তাচিত্র', 'মাইক্রোচিপ উৎপাদনে বাংলাদেশের নতুন মাইলফলক।'),

(5, 6, 1, 'বিনোদন প্রতিবেদক', 'আন্তর্জাতিক চলচ্চিত্র উৎসবে সম্মানজনক জুরি পুরস্কার পেল বাংলাদেশি সিনেমা ‘জলপদ্মা’', 'bangladeshi-film-jolpodmo-wins-prestigious-jury-award', 'বিশ্বের অন্যতম মর্যাদাপূর্ণ কান আন্তর্জাতিক চলচ্চিত্র উৎসবের বিশেষ বিভাগে প্রদর্শিত হয়ে ভূয়সী প্রশংসা কুড়িয়েছে ছবিটি।', '<p>হৃদয়স্পর্শী গল্প ও পরিমিত নির্মাণের জন্য বিশ্বের চলচ্চিত্র সমালোচকদের প্রশংসা অর্জন করেছে বাংলাদেশের ছবি ‘জলপদ্মা’। জুরি বোর্ডের পক্ষ থেকে পরিচালকের হাতে এই সম্মাননা স্মারক তুলে দেওয়া হয়।</p>', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', 'আন্তর্জাতিক উৎসবে সম্মাননা গ্রহণ। ছবি: বার্তাচিত্র', 'published', 0, 0, 1850, '2026-09-04 18:40:00', 'কান উৎসবে জুরি পুরস্কার পেল জলপদ্মা | বার্তাচিত্র', 'আন্তর্জাতিক চলচ্চিত্র উৎসবে বাংলাদেশের জয়।'),

(6, 3, 1, 'আন্তর্জাতিক ডেস্ক', 'মধ্যপ্রাচ্যে অবিলম্বে যুদ্ধবিরতির আহ্বান জানিয়ে জাতিসংঘের সাধারণ পরিষদে প্রস্তাব পাস', 'un-general-assembly-passes-resolution-demanding-ceasefire', 'ব্যাপক সংখ্যাগরিষ্ঠতার ভিত্তিতে বেসামরিক নাগরিকদের সুরক্ষায় জরুরি মানবিক সহায়তার করিডোর উন্মুক্ত করার দাবি জানানো হয়েছে।', '<p>চলমান সংঘাত নিরসনে ও নিরীহ বেসামরিক মানুষের নিরাপত্তা বিধানে সাধারণ পরিষদে বিপুল ভোটের ব্যবধানে অবিলম্বে স্থায়ী যুদ্ধবিরতির প্রস্তাব গৃহীত হয়েছে। প্রস্তাবটিতে খাদ্য ও চিকিৎসা সহায়তা সরবরাহের ওপর জোর দেওয়া হয়।</p>', 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', 'জাতিসংঘ সদর দপ্তরে সাধারণ পরিষদের অধিবেশন। ছবি: বার্তাচিত্র', 'published', 0, 0, 1430, '2026-09-04 16:10:00', 'জাতিসংঘে যুদ্ধবিরতির প্রস্তাব পাস | বার্তাচিত্র', 'জাতিসংঘ সাধারণ পরিষদে মানবিক যুদ্ধবিরতির প্রস্তাব গৃহীত।'),

(7, 4, 1, 'খুলনা প্রতিনিধি', 'সুন্দরবনের জীববৈচিত্র্য রক্ষায় পর্যটনে কঠোর পরিবেশবান্ধব নীতি প্রণয়ন', 'strict-ecotourism-policy-for-sundarbans', 'বন্যপ্রাণীর স্বাভাবিক বিচরণ ও প্রজনন নির্বিঘ্ন করতে প্লাস্টিক নিষিদ্ধের পাশাপাশি জাহাজের শব্দসীমা নিয়ন্ত্রণ করা হচ্ছে।', '<p>ম্যানগ্রোভ বনাঞ্চল সুন্দরবনের সুরক্ষায় পরিবেশ অধিদপ্তর ও বন বিভাগ যৌথভাবে পাঁচ দফা নতুন নীতিমালা কার্যকর করেছে। যত্রতত্র ইঞ্জিনচালিত ট্রলারের বিকট শব্দ ও অপচনশীল বর্জ্য ফেলা কঠোরভাবে নিয়ন্ত্রণ করা হবে।</p>', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80', 'সুন্দরবনের ম্যানগ্রোভ বনভূমি। ছবি: বার্তাচিত্র', 'published', 0, 0, 610, '2026-09-04 14:00:00', 'সুন্দরবন রক্ষায় পরিবেশবান্ধব নীতিমালা | বার্তাচিত্র', 'সুন্দরবনের সুরক্ষায় পাঁচ দফা নতুন নীতিমালা।'),

(8, 8, 1, 'অধ্যাপক ড. সেলিম মনসুর', 'শিক্ষা সংস্কারে অগ্রাধিকার: দক্ষ জনশক্তি গঠনে কারিগরি ও বাস্তবমুখী শিক্ষার গুরুত্ব', 'priorities-in-education-reform-vocational-skills', 'প্রচলিত মুখস্থনির্ভর কারিকুলাম পরিহার করে চতুর্থ শিল্পবিপ্লবের উপযোগী প্রায়োগিক বিজ্ঞান ও নৈতিক শিক্ষার মেলবন্ধন ঘটানো জরুরি।', '<p>আমাদের জাতীয় শিক্ষা নীতিতে এখনই মৌলিক গুণগত পরিবর্তন আনা প্রয়োজন। উচ্চশিক্ষিত কিন্তু বেকার যুবসমাজের দীর্ঘ সারি তৈরি না করে স্কুল ও কলেজ পর্যায় থেকেই বৃত্তিমূলক ও কোডিং-ভিত্তিক আধুনিক দক্ষতার বিকাশ ঘটাতে হবে।</p>', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80', 'শ্রেণিকক্ষে বিজ্ঞান চর্চা। ছবি: বার্তাচিত্র', 'published', 0, 0, 890, '2026-09-04 11:30:00', 'শিক্ষা সংস্কারে অগ্রাধিকার | মতামত | বার্তাচিত্র', 'দক্ষ জনশক্তি তৈরিতে কারিগরি শিক্ষার গুরুত্ব নিয়ে বিশ্লেষণ।')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 5. Sample E-Paper Edition
INSERT INTO `epapers` (`id`, `title`, `edition_date`, `cover_image`, `total_pages`, `status`) VALUES
(1, 'দৈনিক বার্তাচিত্র · ঢাকা সংস্করণ', '2026-09-05', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80', 4, 'published')
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `epaper_pages` (`id`, `epaper_id`, `page_number`, `page_title`, `image_url`) VALUES
(1, 1, 1, 'প্রথম পাতা (জাতীয় সংবাদ ও লিড স্টোরি)', 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80'),
(2, 1, 2, 'দ্বিতীয় পাতা (রাজনীতি ও মতামত)', 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=900&q=80'),
(3, 1, 3, 'তৃতীয় পাতা (আন্তর্জাতিক ও বাণিজ্য)', 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=900&q=80'),
(4, 1, 4, 'চতুর্থ পাতা (খেলাধুলা ও বিনোদন)', 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- 6. Sample Ads
INSERT INTO `ads` (`id`, `title`, `position`, `image_url`, `target_url`, `status`, `start_date`, `end_date`) VALUES
(1, 'শীর্ষ ব্যানার বিজ্ঞাপন', 'header_top', 'https://placehold.co/970x90/8b0000/ffffff?text=%E0%A6%AC%E0%A6%BE%E0%A6%B0%E0%A7%8D%E0%A6%A4%E0%A6%BE%E0%A6%9A%E0%A6%BF%E0%A6%A4%E0%A7%8D%E0%A6%B0+%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%AA%E0%A6%A8+%E0%A6%B8%E0%A7%8D%E0%A6%AA%E0%A7%87%E0%A6%B8+(%E0%A7%AF%E0%A7%AD%E0%A7%A6+%E0%A7%A7%E0%A7%A6)', '#', 'active', '2026-01-01', '2026-12-31'),
(2, 'হোমপেজ মিডল ব্যানার', 'home_middle', 'https://placehold.co/970x120/1f2937/ffffff?text=%E0%A6%AC%E0%A6%BF%E0%A6%B6%E0%A7%87%E0%A6%B7+%E0%A6%B8%E0%A6%82%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A6%B0%E0%A6%A3+%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%AA%E0%A6%A8', '#', 'active', '2026-01-01', '2026-12-31'),
(3, 'সাইডবার বর্গাকার ব্যানার', 'sidebar', 'https://placehold.co/300x250/b91c1c/ffffff?text=%E0%A6%B8%E0%A6%BE%E0%A6%87%E0%A6%A1%E0%A6%AC%E0%A6%BE%E0%A6%B0+%E0%A6%AC%E0%A6%BF%E0%A6%9C%E0%A7%8D%E0%A6%9E%E0%A6%BE%E0%A6%AA%E0%A6%A8+(%E0%A7%A9%E0%A7%A6%E0%A7%A6+%E0%A7%A8%E0%A7%AB%E0%A7%A6)', '#', 'active', '2026-01-01', '2026-12-31')
ON DUPLICATE KEY UPDATE `id`=`id`;

COMMIT;
