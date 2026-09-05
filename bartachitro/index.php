<?php
/**
 * BartaChitro (বার্তাচিত্র) - Homepage
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();

// 1. Fetch Hero / Featured Lead Article
$stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                      FROM news n 
                      JOIN categories c ON n.category_id = c.id 
                      WHERE n.status = 'published' AND n.is_featured = 1 
                      ORDER BY n.published_at DESC LIMIT 1");
$stmt->execute();
$leadStory = $stmt->fetch();

// Fallback if no news marked is_featured
if (!$leadStory) {
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.status = 'published' 
                          ORDER BY n.published_at DESC LIMIT 1");
    $stmt->execute();
    $leadStory = $stmt->fetch();
}

$leadId = $leadStory ? $leadStory['id'] : 0;

// 2. Fetch 3 Sub-Hero Latest News
$stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                      FROM news n 
                      JOIN categories c ON n.category_id = c.id 
                      WHERE n.status = 'published' AND n.id != :lead_id 
                      ORDER BY n.published_at DESC LIMIT 3");
$stmt->execute([':lead_id' => $leadId]);
$subHeroNews = $stmt->fetchAll();

// 3. Fetch 4 Latest Grid Stories
$excludedIds = array_merge([$leadId], array_column($subHeroNews, 'id'));
$inPlaceholders = implode(',', array_fill(0, count($excludedIds), '?'));

$stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                      FROM news n 
                      JOIN categories c ON n.category_id = c.id 
                      WHERE n.status = 'published' AND n.id NOT IN ($inPlaceholders) 
                      ORDER BY n.published_at DESC LIMIT 4");
$stmt->execute($excludedIds);
$latestGridNews = $stmt->fetchAll();

// 4. Function to fetch block news by category slug
function getCategoryBlockNews(PDO $db, string $slug, int $limit = 4): array {
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.status = 'published' AND c.slug = :slug 
                          ORDER BY n.published_at DESC LIMIT :limit");
    $stmt->bindValue(':slug', $slug);
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

$nationalNews = getCategoryBlockNews($db, 'national', 4);
$politicsNews = getCategoryBlockNews($db, 'politics', 4);
$sportsNews   = getCategoryBlockNews($db, 'sports', 4);
$entertainmentNews = getCategoryBlockNews($db, 'entertainment', 4);

// 5. Popular / Most Read News for Sidebar
$stmt = $db->query("SELECT n.*, c.name as category_name, c.slug as category_slug 
                    FROM news n 
                    JOIN categories c ON n.category_id = c.id 
                    WHERE n.status = 'published' 
                    ORDER BY n.views DESC LIMIT 5");
$popularNews = $stmt->fetchAll();

// Include Header
include __DIR__ . '/includes/header.php';
?>

<div class="container">
    <!-- Top Ad Banner -->
    <?= renderAd('header_top') ?>

    <!-- A & B. Lead News / Hero Section -->
    <?php if ($leadStory): ?>
    <section class="hero-news-section" aria-label="প্রধান সংবাদ">
        <div class="hero-news-grid">
            <!-- Main Hero Card -->
            <article class="lead-hero-card">
                <div class="lead-hero-image-wrap">
                    <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadStory['slug']) ?>">
                        <img src="<?= e($leadStory['featured_image']) ?>" alt="<?= e($leadStory['title']) ?>" loading="eager">
                    </a>
                    <span class="category-badge-floating"><?= e($leadStory['category_name']) ?></span>
                </div>
                <div class="lead-hero-body">
                    <h1 class="lead-hero-title">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadStory['slug']) ?>">
                            <?= e($leadStory['title']) ?>
                        </a>
                    </h1>
                    <p class="lead-hero-summary"><?= e($leadStory['summary']) ?></p>
                    <div class="news-meta-info">
                        <span><i class="fa-regular fa-clock"></i> <?= timeAgoBn($leadStory['published_at']) ?></span>
                        <span><i class="fa-regular fa-user"></i> <?= e($leadStory['author_name']) ?></span>
                        <span><i class="fa-regular fa-eye"></i> <?= bnNum($leadStory['views']) ?> বার পড়া হয়েছে</span>
                    </div>
                </div>
            </article>

            <!-- Sub Hero Column (3 Articles) -->
            <aside class="hero-side-column" aria-label="শীর্ষ সংবাদ">
                <?php foreach ($subHeroNews as $sub): ?>
                <article class="hero-sub-card">
                    <div class="hero-sub-thumb">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($sub['slug']) ?>">
                            <img src="<?= e($sub['featured_image']) ?>" alt="<?= e($sub['title']) ?>" loading="lazy">
                        </a>
                    </div>
                    <div class="hero-sub-body">
                        <div>
                            <span class="hero-sub-cat"><?= e($sub['category_name']) ?></span>
                            <h3 class="hero-sub-title">
                                <a href="<?= BASE_URL ?>/article.php?slug=<?= e($sub['slug']) ?>">
                                    <?= e($sub['title']) ?>
                                </a>
                            </h3>
                        </div>
                        <span class="news-card-meta"><i class="fa-regular fa-clock"></i> <?= timeAgoBn($sub['published_at']) ?></span>
                    </div>
                </article>
                <?php endforeach; ?>
            </aside>
        </div>
    </section>
    <?php endif; ?>

    <!-- C. Latest News Grid -->
    <?php if (!empty($latestGridNews)): ?>
    <section class="section-block" aria-label="সর্বশেষ খবর">
        <div class="section-header-wrap">
            <h2 class="section-title">সর্বশেষ সংবাদ</h2>
            <a href="<?= BASE_URL ?>/category.php?slug=all" class="section-more-link">সব খবর <i class="fa-solid fa-angle-right"></i></a>
        </div>
        <div class="news-cards-grid-4">
            <?php foreach ($latestGridNews as $item): ?>
            <article class="news-card-standard">
                <div class="news-card-thumb">
                    <a href="<?= BASE_URL ?>/article.php?slug=<?= e($item['slug']) ?>">
                        <img src="<?= e($item['featured_image']) ?>" alt="<?= e($item['title']) ?>" loading="lazy">
                    </a>
                </div>
                <div class="news-card-content">
                    <span class="news-card-category"><?= e($item['category_name']) ?></span>
                    <h3 class="news-card-title">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($item['slug']) ?>">
                            <?= e($item['title']) ?>
                        </a>
                    </h3>
                    <div class="news-card-meta">
                        <i class="fa-regular fa-clock"></i> <?= timeAgoBn($item['published_at']) ?>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endif; ?>

    <!-- Homepage Middle Ad Banner -->
    <?= renderAd('home_middle') ?>

    <!-- Category Sections: Block 1 (জাতীয় ও রাজনীতি) -->
    <div class="dual-category-layout">
        <!-- জাতীয় -->
        <section class="category-block" aria-label="জাতীয়">
            <div class="section-header-wrap">
                <h2 class="section-title">জাতীয়</h2>
                <a href="<?= BASE_URL ?>/category.php?slug=national" class="section-more-link">আরও <i class="fa-solid fa-angle-right"></i></a>
            </div>
            <div class="category-lead-with-list">
                <?php if (!empty($nationalNews)): 
                    $leadNat = $nationalNews[0];
                    $subNat = array_slice($nationalNews, 1);
                ?>
                <div class="cat-top-story">
                    <div class="cat-top-story-img">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadNat['slug']) ?>">
                            <img src="<?= e($leadNat['featured_image']) ?>" alt="<?= e($leadNat['title']) ?>" loading="lazy">
                        </a>
                    </div>
                    <h3 class="cat-top-story-title">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadNat['slug']) ?>">
                            <?= e($leadNat['title']) ?>
                        </a>
                    </h3>
                    <p class="lead-hero-summary"><?= limitWords($leadNat['summary'], 18) ?></p>
                </div>
                <ul class="cat-story-list">
                    <?php foreach ($subNat as $story): ?>
                    <li class="cat-story-list-item">
                        <i class="fa-solid fa-circle-chevron-right"></i>
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($story['slug']) ?>">
                            <?= e($story['title']) ?>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php else: ?>
                    <p class="text-muted">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</p>
                <?php endif; ?>
            </div>
        </section>

        <!-- রাজনীতি -->
        <section class="category-block" aria-label="রাজনীতি">
            <div class="section-header-wrap">
                <h2 class="section-title">রাজনীতি</h2>
                <a href="<?= BASE_URL ?>/category.php?slug=politics" class="section-more-link">আরও <i class="fa-solid fa-angle-right"></i></a>
            </div>
            <div class="category-lead-with-list">
                <?php if (!empty($politicsNews)): 
                    $leadPol = $politicsNews[0];
                    $subPol = array_slice($politicsNews, 1);
                ?>
                <div class="cat-top-story">
                    <div class="cat-top-story-img">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadPol['slug']) ?>">
                            <img src="<?= e($leadPol['featured_image']) ?>" alt="<?= e($leadPol['title']) ?>" loading="lazy">
                        </a>
                    </div>
                    <h3 class="cat-top-story-title">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadPol['slug']) ?>">
                            <?= e($leadPol['title']) ?>
                        </a>
                    </h3>
                    <p class="lead-hero-summary"><?= limitWords($leadPol['summary'], 18) ?></p>
                </div>
                <ul class="cat-story-list">
                    <?php foreach ($subPol as $story): ?>
                    <li class="cat-story-list-item">
                        <i class="fa-solid fa-circle-chevron-right"></i>
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($story['slug']) ?>">
                            <?= e($story['title']) ?>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php else: ?>
                    <p class="text-muted">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</p>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <!-- Category Sections: Block 2 (খেলাধুলা ও বিনোদন) -->
    <div class="dual-category-layout">
        <!-- খেলাধুলা -->
        <section class="category-block" aria-label="খেলাধুলা">
            <div class="section-header-wrap">
                <h2 class="section-title">খেলাধুলা</h2>
                <a href="<?= BASE_URL ?>/category.php?slug=sports" class="section-more-link">আরও <i class="fa-solid fa-angle-right"></i></a>
            </div>
            <div class="category-lead-with-list">
                <?php if (!empty($sportsNews)): 
                    $leadSpo = $sportsNews[0];
                    $subSpo = array_slice($sportsNews, 1);
                ?>
                <div class="cat-top-story">
                    <div class="cat-top-story-img">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadSpo['slug']) ?>">
                            <img src="<?= e($leadSpo['featured_image']) ?>" alt="<?= e($leadSpo['title']) ?>" loading="lazy">
                        </a>
                    </div>
                    <h3 class="cat-top-story-title">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadSpo['slug']) ?>">
                            <?= e($leadSpo['title']) ?>
                        </a>
                    </h3>
                    <p class="lead-hero-summary"><?= limitWords($leadSpo['summary'], 18) ?></p>
                </div>
                <ul class="cat-story-list">
                    <?php foreach ($subSpo as $story): ?>
                    <li class="cat-story-list-item">
                        <i class="fa-solid fa-circle-chevron-right"></i>
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($story['slug']) ?>">
                            <?= e($story['title']) ?>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php else: ?>
                    <p class="text-muted">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</p>
                <?php endif; ?>
            </div>
        </section>

        <!-- বিনোদন -->
        <section class="category-block" aria-label="বিনোদন">
            <div class="section-header-wrap">
                <h2 class="section-title">বিনোদন</h2>
                <a href="<?= BASE_URL ?>/category.php?slug=entertainment" class="section-more-link">আরও <i class="fa-solid fa-angle-right"></i></a>
            </div>
            <div class="category-lead-with-list">
                <?php if (!empty($entertainmentNews)): 
                    $leadEnt = $entertainmentNews[0];
                    $subEnt = array_slice($entertainmentNews, 1);
                ?>
                <div class="cat-top-story">
                    <div class="cat-top-story-img">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadEnt['slug']) ?>">
                            <img src="<?= e($leadEnt['featured_image']) ?>" alt="<?= e($leadEnt['title']) ?>" loading="lazy">
                        </a>
                    </div>
                    <h3 class="cat-top-story-title">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($leadEnt['slug']) ?>">
                            <?= e($leadEnt['title']) ?>
                        </a>
                    </h3>
                    <p class="lead-hero-summary"><?= limitWords($leadEnt['summary'], 18) ?></p>
                </div>
                <ul class="cat-story-list">
                    <?php foreach ($subEnt as $story): ?>
                    <li class="cat-story-list-item">
                        <i class="fa-solid fa-circle-chevron-right"></i>
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($story['slug']) ?>">
                            <?= e($story['title']) ?>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php else: ?>
                    <p class="text-muted">এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।</p>
                <?php endif; ?>
            </div>
        </section>
    </div>

    <!-- E-Paper Teaser Section on Homepage -->
    <section class="section-block" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;margin-bottom:40px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
            <div>
                <span style="background:#fee2e2;color:#991b1b;font-weight:700;font-size:12px;padding:3px 8px;border-radius:4px;">ডিজিটাল সংবাদপত্র</span>
                <h3 style="font-family:var(--font-display);font-size:24px;font-weight:800;margin-top:6px;">আজকের বার্তাচিত্র ই-পত্রিকা</h3>
                <p style="color:#4b5563;font-size:15px;">কাগজের পত্রিকার মতোই পৃষ্ঠা উল্টে পড়ুন প্রতিদিনের তাজা খবর।</p>
            </div>
            <a href="<?= BASE_URL ?>/epaper.php" class="admin-badge-btn" style="padding:10px 20px;font-size:15px;background:#b91c1c;">
                <i class="fa-solid fa-newspaper"></i> ই-পত্রিকা খুলুন
            </a>
        </div>
    </section>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
