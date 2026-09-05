<?php
/**
 * BartaChitro (বার্তাচিত্র) - Header Component
 */
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/functions.php';

$pageTitle = isset($customTitle) ? $customTitle . ' | ' . getSetting('site_name', APP_NAME) : getSetting('meta_title', APP_NAME . ' | ' . APP_TAGLINE);
$metaDesc = isset($customDesc) ? $customDesc : getSetting('meta_description', 'বাংলাদেশের শীর্ষ অনলাইন সংবাদ মাধ্যম ও ই-পত্রিকা');
$canonicalUrl = isset($customCanonical) ? $customCanonical : BASE_URL . $_SERVER['REQUEST_URI'];
$ogImage = isset($customOgImage) ? $customOgImage : BASE_URL . '/assets/images/og-default.jpg';
$categories = getCategories();
$currentDateBn = bnDate(time(), false);
?>
<!DOCTYPE html>
<html lang="bn" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?></title>
    <meta name="description" content="<?= e($metaDesc) ?>">
    <link rel="canonical" href="<?= e($canonicalUrl) ?>">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="<?= isset($isArticle) ? 'article' : 'website' ?>">
    <meta property="og:url" content="<?= e($canonicalUrl) ?>">
    <meta property="og:title" content="<?= e($pageTitle) ?>">
    <meta property="og:description" content="<?= e($metaDesc) ?>">
    <meta property="og:image" content="<?= e($ogImage) ?>">
    <meta property="og:site_name" content="<?= e(getSetting('site_name', APP_NAME)) ?>">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($pageTitle) ?>">
    <meta name="twitter:description" content="<?= e($metaDesc) ?>">
    <meta name="twitter:image" content="<?= e($ogImage) ?>">

    <!-- Google Fonts: Noto Serif Bengali & Hind Siliguri -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Lucide / FontAwesome via CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    
    <!-- Main Newspaper Stylesheet -->
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css?v=<?= APP_VERSION ?>">

    <?php if (isset($jsonLd)): ?>
    <!-- Structured Data JSON-LD -->
    <script type="application/ld+json">
        <?= json_encode($jsonLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) ?>
    </script>
    <?php endif; ?>
</head>
<body>
    <div id="top-anchor"></div>

    <!-- Top Utility Bar -->
    <header class="site-header">
        <div class="top-bar">
            <div class="container top-bar-inner">
                <div class="top-left">
                    <span class="live-date"><i class="fa-regular fa-calendar-days"></i> <?= $currentDateBn ?></span>
                    <span class="edition-tag">বাংলাদেশ সংস্করণ</span>
                </div>
                <div class="top-right">
                    <div class="lang-switch">
                        <button type="button" class="active">বাংলা</button>
                        <span>|</span>
                        <a href="?lang=en" class="en-switch" title="English Edition">EN</a>
                    </div>
                    <a href="<?= BASE_URL ?>/epaper.php" class="top-epaper-btn">
                        <i class="fa-solid fa-newspaper"></i> ই-পত্রিকা
                    </a>
                    <a href="<?= BASE_URL ?>/admin/index.php" class="admin-badge-btn" title="অ্যাডমিন প্যানেল">
                        <i class="fa-solid fa-user-shield"></i> অ্যাডমিন
                    </a>
                </div>
            </div>
        </div>

        <!-- Main Branding Area -->
        <div class="branding-bar">
            <div class="container branding-inner">
                <!-- Mobile Hamburger Toggle -->
                <button type="button" class="mobile-menu-toggle" id="mobileMenuBtn" aria-label="মেনু খুলুন">
                    <i class="fa-solid fa-bars"></i>
                </button>

                <!-- Logo & Tagline -->
                <div class="brand-logo-wrap">
                    <a href="<?= BASE_URL ?>/" class="brand-link">
                        <span class="brand-name">বার্তাচিত্র</span>
                    </a>
                    <span class="brand-tagline"><?= e(getSetting('tagline', APP_TAGLINE)) ?></span>
                </div>

                <!-- Header Actions: Quick Search & Social -->
                <div class="header-action-tools">
                    <div class="header-search-wrap">
                        <form action="<?= BASE_URL ?>/search.php" method="GET" class="header-search-form">
                            <input type="text" name="q" placeholder="সংবাদ অনুসন্ধান করুন..." autocomplete="off" id="headerSearchInput" required>
                            <button type="submit" aria-label="অনুসন্ধান"><i class="fa-solid fa-magnifying-glass"></i></button>
                        </form>
                        <div id="searchSuggestions" class="search-suggestions-dropdown"></div>
                    </div>
                    <div class="header-social-links">
                        <a href="<?= e(getSetting('facebook_url', '#')) ?>" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="<?= e(getSetting('youtube_url', '#')) ?>" target="_blank" rel="noopener" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation Bar -->
        <?php include __DIR__ . '/navbar.php'; ?>

        <!-- Breaking News Ticker -->
        <?php include __DIR__ . '/breaking-news.php'; ?>
    </header>

    <!-- Mobile Slide-Down/Side Navigation Drawer -->
    <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
    <aside class="mobile-nav-drawer" id="mobileNavDrawer">
        <div class="drawer-header">
            <div class="drawer-brand">বার্তাচিত্র</div>
            <button type="button" class="close-drawer-btn" id="closeDrawerBtn" aria-label="বন্ধ করুন">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="drawer-search">
            <form action="<?= BASE_URL ?>/search.php" method="GET">
                <input type="text" name="q" placeholder="সংবাদ খুঁজুন..." required>
                <button type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
            </form>
        </div>
        <nav class="drawer-menu">
            <ul>
                <li><a href="<?= BASE_URL ?>/"><i class="fa-solid fa-house"></i> প্রচ্ছদ</a></li>
                <?php foreach ($categories as $cat): ?>
                    <li><a href="<?= BASE_URL ?>/category.php?slug=<?= e($cat['slug']) ?>"><?= e($cat['name']) ?></a></li>
                <?php endforeach; ?>
                <li><a href="<?= BASE_URL ?>/epaper.php"><i class="fa-solid fa-newspaper"></i> ই-পত্রিকা</a></li>
                <li><a href="<?= BASE_URL ?>/archive.php"><i class="fa-solid fa-box-archive"></i> আর্কাইভ</a></li>
                <li><a href="<?= BASE_URL ?>/contact.php"><i class="fa-regular fa-envelope"></i> যোগাযোগ</a></li>
                <li><a href="<?= BASE_URL ?>/admin/index.php" class="text-red"><i class="fa-solid fa-lock"></i> অ্যাডমিন লগইন</a></li>
            </ul>
        </nav>
    </aside>

    <!-- Main Container Start -->
    <main class="main-content-wrapper">
