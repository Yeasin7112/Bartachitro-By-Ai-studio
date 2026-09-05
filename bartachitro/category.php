<?php
/**
 * BartaChitro (বার্তাচিত্র) - Category News Page
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();

$slug = $_GET['slug'] ?? 'all';
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$perPage = 8;
$offset = ($page - 1) * $perPage;

$category = null;
if ($slug !== 'all') {
    $stmt = $db->prepare("SELECT * FROM categories WHERE slug = :slug AND status = 'active'");
    $stmt->execute([':slug' => $slug]);
    $category = $stmt->fetch();

    if (!$category) {
        header("Location: " . BASE_URL . "/");
        exit;
    }
    $catId = $category['id'];
    $categoryName = $category['name'];

    // Count total items
    $countStmt = $db->prepare("SELECT COUNT(*) FROM news WHERE category_id = :cat_id AND status = 'published'");
    $countStmt->execute([':cat_id' => $catId]);
    $totalNews = (int)$countStmt->fetchColumn();

    // Fetch news
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.category_id = :cat_id AND n.status = 'published' 
                          ORDER BY n.published_at DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':cat_id', $catId, PDO::PARAM_INT);
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $newsList = $stmt->fetchAll();
} else {
    $categoryName = 'সব খবর';
    // Count total items
    $totalNews = (int)$db->query("SELECT COUNT(*) FROM news WHERE status = 'published'")->fetchColumn();

    // Fetch news
    $stmt = $db->prepare("SELECT n.*, c.name as category_name, c.slug as category_slug 
                          FROM news n 
                          JOIN categories c ON n.category_id = c.id 
                          WHERE n.status = 'published' 
                          ORDER BY n.published_at DESC LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $newsList = $stmt->fetchAll();
}

$totalPages = ceil($totalNews / $perPage);
$customTitle = $categoryName . " সংবাদ";

include __DIR__ . '/includes/header.php';
?>

<div class="container">
    <div class="section-header-wrap" style="margin-top:10px;">
        <h1 class="section-title"><?= e($categoryName) ?></h1>
        <span style="font-size:14px;color:#6b7280;">মোট <?= bnNum($totalNews) ?>টি সংবাদ</span>
    </div>

    <?php if (!empty($newsList)): ?>
        <!-- Lead story of category on first page -->
        <?php if ($page === 1): 
            $catLead = $newsList[0];
            $gridNews = array_slice($newsList, 1);
        ?>
        <article class="lead-hero-card" style="margin-bottom:32px;display:grid;grid-template-columns:1.5fr 1fr;align-items:center;">
            <div class="lead-hero-image-wrap" style="aspect-ratio:16/10;">
                <a href="<?= BASE_URL ?>/article.php?slug=<?= e($catLead['slug']) ?>">
                    <img src="<?= e($catLead['featured_image']) ?>" alt="<?= e($catLead['title']) ?>">
                </a>
            </div>
            <div class="lead-hero-body">
                <span class="news-card-category"><?= e($catLead['category_name']) ?></span>
                <h2 class="lead-hero-title" style="font-size:24px;">
                    <a href="<?= BASE_URL ?>/article.php?slug=<?= e($catLead['slug']) ?>">
                        <?= e($catLead['title']) ?>
                    </a>
                </h2>
                <p class="lead-hero-summary"><?= e($catLead['summary']) ?></p>
                <div class="news-meta-info">
                    <span><i class="fa-regular fa-clock"></i> <?= timeAgoBn($catLead['published_at']) ?></span>
                    <span><i class="fa-regular fa-eye"></i> <?= bnNum($catLead['views']) ?> বার পড়া হয়েছে</span>
                </div>
            </div>
        </article>
        <?php else: 
            $gridNews = $newsList;
        ?>
        <?php endif; ?>

        <!-- Cards Grid -->
        <div class="news-cards-grid-4" style="margin-bottom:40px;">
            <?php foreach ($gridNews as $item): ?>
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

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
        <nav style="display:flex;justify-content:center;gap:6px;margin:30px 0 50px;">
            <?php if ($page > 1): ?>
                <a href="?slug=<?= urlencode($slug) ?>&page=<?= $page - 1 ?>" style="padding:8px 14px;background:#ffffff;border:1px solid #d1d5db;border-radius:4px;font-weight:600;">পূর্ববর্তী</a>
            <?php endif; ?>

            <?php for ($p = 1; $p <= $totalPages; $p++): ?>
                <a href="?slug=<?= urlencode($slug) ?>&page=<?= $p ?>" style="padding:8px 14px;border-radius:4px;font-weight:700;<?= ($p === $page) ? 'background:#b91c1c;color:#ffffff;border:1px solid #b91c1c;' : 'background:#ffffff;border:1px solid #d1d5db;color:#111827;' ?>">
                    <?= bnNum($p) ?>
                </a>
            <?php endfor; ?>

            <?php if ($page < $totalPages): ?>
                <a href="?slug=<?= urlencode($slug) ?>&page=<?= $page + 1 ?>" style="padding:8px 14px;background:#ffffff;border:1px solid #d1d5db;border-radius:4px;font-weight:600;">পরবর্তী</a>
            <?php endif; ?>
        </nav>
        <?php endif; ?>

    <?php else: ?>
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:40px;text-align:center;margin:30px 0;">
            <p style="font-size:18px;color:#6b7280;">এই ক্যাটাগরিতে বর্তমানে কোনো প্রকাশিত সংবাদ নেই।</p>
        </div>
    <?php endif; ?>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
