<?php
/**
 * BartaChitro (বার্তাচিত্র) - Admin Header & Navigation
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

requireAuth();
$adminUser = getAuthUser();
$currentAdminPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($adminTitle) ? e($adminTitle) . ' | ' : '' ?>বার্তাচিত্র অ্যাডমিন</title>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css?v=<?= APP_VERSION ?>">
</head>
<body class="admin-body">
    <div class="admin-layout">
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar">
            <div class="admin-brand">
                <a href="<?= BASE_URL ?>/admin/index.php" style="display:flex;align-items:center;gap:8px;text-decoration:none;">
                    <span class="brand-title">বার্তাচিত্র</span>
                    <span class="brand-badge">CMS</span>
                </a>
            </div>

            <ul class="admin-nav">
                <li class="<?= ($currentAdminPage === 'index') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/index.php">
                        <i class="fa-solid fa-gauge"></i> ড্যাশবোর্ড
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'news') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/news.php">
                        <i class="fa-regular fa-newspaper"></i> সকল খবর
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'news-add') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/news-add.php">
                        <i class="fa-solid fa-pen-to-square"></i> নতুন খবর
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'categories') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/categories.php">
                        <i class="fa-solid fa-layer-group"></i> ক্যাটাগরি
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'breaking') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/breaking.php">
                        <i class="fa-solid fa-bolt"></i> ব্রেকিং নিউজ
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'epaper') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/epaper.php">
                        <i class="fa-regular fa-file-lines"></i> ই-পত্রিকা
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'ads') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/ads.php">
                        <i class="fa-solid fa-rectangle-ad"></i> বিজ্ঞাপন
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'messages') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/messages.php">
                        <i class="fa-regular fa-envelope"></i> বার্তা
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'settings') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/settings.php">
                        <i class="fa-solid fa-sliders"></i> সাইট সেটিংস
                    </a>
                </li>
                <li class="<?= ($currentAdminPage === 'profile') ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/admin/profile.php">
                        <i class="fa-regular fa-circle-user"></i> অ্যাডমিন প্রোফাইল
                    </a>
                </li>
            </ul>

            <div class="admin-sidebar-footer">
                <a href="<?= BASE_URL ?>/admin/logout.php">
                    <i class="fa-solid fa-right-from-bracket"></i> লগআউট
                </a>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="admin-main">
            <!-- Topbar -->
            <header class="admin-topbar">
                <div class="admin-topbar-left">
                    <h2><?= isset($adminTitle) ? e($adminTitle) : 'ড্যাশবোর্ড' ?></h2>
                </div>
                <div class="admin-topbar-right">
                    <a href="<?= BASE_URL ?>/" target="_blank" class="btn-admin-outline" title="সাইট দেখুন">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i> সাইট ভিজিট
                    </a>
                    <div style="font-size:14px;color:#475569;display:flex;align-items:center;gap:6px;">
                        <i class="fa-solid fa-user-circle" style="font-size:18px;color:#b91c1c;"></i>
                        <strong><?= e($adminUser['name']) ?></strong>
                    </div>
                </div>
            </header>

            <div class="admin-content">
