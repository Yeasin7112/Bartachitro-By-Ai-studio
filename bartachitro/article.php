<?php
/**
 * BartaChitro (বার্তাচিত্র) - News Article Detail Page
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();

$slug = $_GET['slug'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (empty($slug) && empty($id)) {
    header("Location: " . BASE_URL . "/");
    exit;
}

// Fetch article
if (!empty($slug)) {
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.slug = :slug AND n.status = 'published'");
    $stmt->execute([':slug' => $slug]);
} else {
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.id = :id AND n.status = 'published'");
    $stmt->execute([':id' => $id]);
}

$article = $stmt->fetch();

if (!$article) {
    http_response_code(404);
    $customTitle = "সংবাদ পাওয়া যায়নি (404)";
    include __DIR__ . '/includes/header.php';
    echo "<div class='container' style='padding:60px 16px;text-align:center;'>
            <h1 style='font-size:32px;color:#b91c1c;margin-bottom:12px;'>সংবাদটি পাওয়া যায়নি</h1>
            <p style='color:#4b5563;font-size:16px;margin-bottom:24px;'>আপনার অনুরোধকৃত সংবাদটি সরানো হয়েছে অথবা লিংকটি সঠিক নয়।</p>
            <a href='" . BASE_URL . "/' class='admin-badge-btn' style='padding:8px 18px;font-size:15px;'>প্রচ্ছদে ফিরে যান</a>
          </div>";
    include __DIR__ . '/includes/footer.php';
    exit;
}

// Record article view count (debounced per session)
recordNewsView($article['id']);

// Update current view in memory for display
$currentViews = $article['views'] + 1;

// Fetch 3 Related articles in same category
$relStmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                         FROM news n 
                         JOIN categories c ON n.category_id = c.id 
                         WHERE n.category_id = :cat_id AND n.id != :cur_id AND n.status = 'published' 
                         ORDER BY n.published_at DESC LIMIT 3");
$relStmt->execute([':cat_id' => $article['category_id'], ':cur_id' => $article['id']]);
$relatedArticles = $relStmt->fetchAll();

// Fetch 5 Latest articles for sidebar
$latStmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                         FROM news n 
                         JOIN categories c ON n.category_id = c.id 
                         WHERE n.id != :cur_id AND n.status = 'published' 
                         ORDER BY n.published_at DESC LIMIT 5");
$latStmt->execute([':cur_id' => $article['id']]);
$latestArticles = $latStmt->fetchAll();

// Custom SEO tags
$customTitle = $article['seo_title'] ?: $article['title'];
$customDesc = $article['seo_description'] ?: $article['summary'];
$customOgImage = $article['featured_image'];
$customCanonical = BASE_URL . "/article.php?slug=" . urlencode($article['slug']);
$isArticle = true;

// Structured Data JSON-LD
$jsonLd = [
    "@context" => "https://schema.org",
    "@type" => "NewsArticle",
    "mainEntityOfPage" => [
        "@type" => "WebPage",
        "@id" => $customCanonical
    ],
    "headline" => $article['title'],
    "description" => $article['summary'],
    "image" => [$article['featured_image']],
    "datePublished" => date('c', strtotime($article['published_at'])),
    "dateModified" => date('c', strtotime($article['updated_at'] ?: $article['published_at'])),
    "author" => [
        "@type" => "Person",
        "name" => $article['author_name']
    ],
    "publisher" => [
        "@type" => "Organization",
        "name" => getSetting('site_name', APP_NAME),
        "logo" => [
            "@type" => "ImageObject",
            "url" => BASE_URL . "/assets/images/logo.png"
        ]
    ]
];

include __DIR__ . '/includes/header.php';
?>

<div class="container">
    <div class="article-layout">
        <!-- Main Article Column -->
        <article class="article-main-card">
            <!-- Breadcrumbs -->
            <nav class="breadcrumb-nav" aria-label="ব্রেডক্রাম্ব">
                <a href="<?= BASE_URL ?>/"><i class="fa-solid fa-house"></i> প্রচ্ছদ</a>
                <span>/</span>
                <a href="<?= BASE_URL ?>/category.php?slug=<?= e($article['category_slug']) ?>">
                    <?= e($article['category_name']) ?>
                </a>
                <span>/</span>
                <span style="color:#6b7280;"><?= limitWords($article['title'], 6) ?></span>
            </nav>

            <span class="article-category-badge"><?= e($article['category_name']) ?></span>
            <h1 class="article-headline"><?= e($article['title']) ?></h1>

            <?php if (!empty($article['summary'])): ?>
                <div class="article-subheadline"><?= e($article['summary']) ?></div>
            <?php endif; ?>

            <!-- Meta Bar -->
            <div class="article-meta-bar">
                <div class="reporter-details">
                    <div class="reporter-avatar"><i class="fa-solid fa-user-pen"></i></div>
                    <div class="reporter-info">
                        <span class="reporter-name"><?= e($article['author_name']) ?></span>
                        <div class="publish-times">
                            <span>প্রকাশিত: <?= bnDate($article['published_at']) ?></span>
                            <?php if (!empty($article['updated_at']) && $article['updated_at'] !== $article['published_at']): ?>
                                <span style="margin-left: 8px;">| আপডেট: <?= bnDate($article['updated_at']) ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>

                <div class="article-views-counter" title="পড়ার সংখ্যা">
                    <i class="fa-regular fa-eye"></i> <?= bnNum($currentViews) ?> বার পড়া হয়েছে
                </div>
            </div>

            <!-- Featured Media -->
            <figure class="article-featured-media">
                <img src="<?= e($article['featured_image']) ?>" alt="<?= e($article['title']) ?>">
                <?php if (!empty($article['image_caption'])): ?>
                    <figcaption class="article-image-caption"><?= e($article['image_caption']) ?></figcaption>
                <?php endif; ?>
            </figure>

            <!-- Social Sharing Buttons -->
            <div class="social-share-strip">
                <span class="share-label">শেয়ার করুন:</span>
                <a href="https://www.facebook.com/sharer/sharer.php?u=<?= urlencode($customCanonical) ?>" target="_blank" rel="noopener" class="share-btn share-facebook" title="Facebook এ শেয়ার করুন">
                    <i class="fa-brands fa-facebook-f"></i> ফেসবুক
                </a>
                <a href="https://twitter.com/intent/tweet?text=<?= urlencode($article['title']) ?>&url=<?= urlencode($customCanonical) ?>" target="_blank" rel="noopener" class="share-btn share-twitter" title="X এ শেয়ার করুন">
                    <i class="fa-brands fa-x-twitter"></i> টুইট
                </a>
                <a href="https://api.whatsapp.com/send?text=<?= urlencode($article['title'] . ' ' . $customCanonical) ?>" target="_blank" rel="noopener" class="share-btn share-whatsapp" title="WhatsApp এ শেয়ার করুন">
                    <i class="fa-brands fa-whatsapp"></i> হোয়াটসঅ্যাপ
                </a>
                <button type="button" class="share-btn share-copy" id="copyArticleLinkBtn" title="লিংক কপি করুন">
                    <i class="fa-solid fa-link"></i> কপি লিংক
                </button>
                <button type="button" class="share-btn share-print" id="printArticleBtn" title="প্রিন্ট করুন">
                    <i class="fa-solid fa-print"></i> প্রিন্ট
                </button>
            </div>

            <!-- Article Body Content -->
            <div class="article-body-content">
                <?= $article['content'] ?>
            </div>

            <!-- In-Article Ad -->
            <?= renderAd('article_inline') ?>

            <!-- Related News Section -->
            <?php if (!empty($relatedArticles)): ?>
            <div style="margin-top:40px;border-top:2px solid #b91c1c;padding-top:20px;">
                <h3 style="font-family:var(--font-display);font-size:22px;font-weight:700;margin-bottom:16px;">সম্পর্কিত সংবাদ</h3>
                <div class="news-cards-grid-3">
                    <?php foreach ($relatedArticles as $rel): ?>
                    <article class="news-card-standard">
                        <div class="news-card-thumb">
                            <a href="<?= BASE_URL ?>/article.php?slug=<?= e($rel['slug']) ?>">
                                <img src="<?= e($rel['featured_image']) ?>" alt="<?= e($rel['title']) ?>" loading="lazy">
                            </a>
                        </div>
                        <div class="news-card-content">
                            <h4 class="news-card-title" style="font-size:15px;">
                                <a href="<?= BASE_URL ?>/article.php?slug=<?= e($rel['slug']) ?>">
                                    <?= e($rel['title']) ?>
                                </a>
                            </h4>
                            <span class="news-card-meta"><i class="fa-regular fa-clock"></i> <?= timeAgoBn($rel['published_at']) ?></span>
                        </div>
                    </article>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
        </article>

        <!-- Article Sidebar -->
        <aside class="article-sidebar">
            <!-- Sidebar Ad -->
            <?= renderAd('sidebar') ?>

            <!-- Latest News Widget -->
            <div class="sidebar-widget">
                <h3 class="sidebar-widget-title">সর্বশেষ সংবাদ</h3>
                <ul class="cat-story-list">
                    <?php foreach ($latestArticles as $lat): ?>
                    <li class="cat-story-list-item">
                        <i class="fa-solid fa-circle-chevron-right"></i>
                        <div>
                            <a href="<?= BASE_URL ?>/article.php?slug=<?= e($lat['slug']) ?>">
                                <?= e($lat['title']) ?>
                            </a>
                            <div style="font-size:12px;color:#9ca3af;margin-top:2px;">
                                <?= timeAgoBn($lat['published_at']) ?>
                            </div>
                        </div>
                    </li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <!-- Epaper Teaser Card -->
            <div class="sidebar-widget" style="background:#fef2f2;border-color:#fecaca;text-align:center;">
                <i class="fa-solid fa-newspaper" style="font-size:36px;color:#b91c1c;margin-bottom:10px;"></i>
                <h4 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin-bottom:6px;">আজকের ই-পত্রিকা</h4>
                <p style="font-size:13px;color:#4b5563;margin-bottom:14px;">কাগজের পত্রিকার ডিজিটাল সংস্করণ পড়ুন বার্তাচিত্রে।</p>
                <a href="<?= BASE_URL ?>/epaper.php" class="admin-badge-btn" style="width:100%;justify-content:center;padding:8px;font-size:14px;">ই-পত্রিকা পড়ুন</a>
            </div>
        </aside>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
