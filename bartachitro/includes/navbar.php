<?php
/**
 * BartaChitro (বার্তাচিত্র) - Main Desktop Navigation
 */
$currentCategorySlug = $_GET['slug'] ?? '';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>
<nav class="main-navbar" id="mainNavbar">
    <div class="container navbar-inner">
        <ul class="nav-links">
            <li class="<?= ($currentPage === 'index' && empty($currentCategorySlug)) ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/" title="হোম"><i class="fa-solid fa-house"></i> প্রচ্ছদ</a>
            </li>
            <?php foreach ($categories as $cat): ?>
                <li class="<?= ($currentCategorySlug === $cat['slug']) ? 'active' : '' ?>">
                    <a href="<?= BASE_URL ?>/category.php?slug=<?= e($cat['slug']) ?>">
                        <?= e($cat['name']) ?>
                    </a>
                </li>
            <?php endforeach; ?>
            <li class="<?= ($currentPage === 'archive') ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/archive.php">আর্কাইভ</a>
            </li>
            <li class="nav-epaper <?= ($currentPage === 'epaper') ? 'active' : '' ?>">
                <a href="<?= BASE_URL ?>/epaper.php"><i class="fa-regular fa-newspaper"></i> ই-পত্রিকা</a>
            </li>
        </ul>
        <div class="nav-secondary-action">
            <a href="<?= BASE_URL ?>/category.php?slug=all" class="nav-all-news">সব খবর</a>
        </div>
    </div>
</nav>
