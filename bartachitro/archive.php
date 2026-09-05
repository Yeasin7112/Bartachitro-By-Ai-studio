<?php
/**
 * BartaChitro (বার্তাচিত্র) - News Archive Page
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();

$selectedDate = $_GET['date'] ?? date('Y-m-d');
$catFilter = $_GET['cat'] ?? '';

// Validate date
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $selectedDate)) {
    $selectedDate = date('Y-m-d');
}

$sql = "SELECT n.*, c.name as category_name, c.slug as category_slug 
        FROM news n 
        JOIN categories c ON n.category_id = c.id 
        WHERE n.status = 'published' AND DATE(n.published_at) = :selected_date";
$params = [':selected_date' => $selectedDate];

if (!empty($catFilter)) {
    $sql .= " AND c.slug = :cat_slug";
    $params[':cat_slug'] = $catFilter;
}

$sql .= " ORDER BY n.published_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$archiveNews = $stmt->fetchAll();

$customTitle = "পুরোনো খবর - " . bnDate($selectedDate, false);
include __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width:1100px;margin-top:10px;margin-bottom:60px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;box-shadow:var(--shadow-sm);margin-bottom:30px;">
        <h1 class="section-title" style="margin-bottom:16px;">সংবাদ আর্কাইভ</h1>
        <p style="color:#4b5563;margin-bottom:20px;font-size:15px;">নির্দিষ্ট তারিখ ও বিভাগ নির্বাচন করে বার্তাচিত্রে প্রকাশিত অতীত সংবাদগুলো পড়ুন।</p>
        
        <form action="<?= BASE_URL ?>/archive.php" method="GET" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;">
                <label for="archiveDate" style="font-weight:600;font-size:15px;"><i class="fa-regular fa-calendar-days text-red"></i> তারিখ নির্বাচন করুন:</label>
                <input type="date" id="archiveDate" name="date" value="<?= e($selectedDate) ?>" max="<?= date('Y-m-d') ?>" style="padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;">
            </div>

            <div style="display:flex;align-items:center;gap:8px;">
                <label for="archiveCat" style="font-weight:600;font-size:15px;">বিভাগ:</label>
                <select id="archiveCat" name="cat" style="padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;background:#ffffff;">
                    <option value="">সকল বিভাগ</option>
                    <?php foreach ($categories as $c): ?>
                        <option value="<?= e($c['slug']) ?>" <?= ($catFilter === $c['slug']) ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <button type="submit" class="admin-badge-btn" style="padding:10px 22px;font-size:15px;background:#b91c1c;border:none;cursor:pointer;">
                দেখান
            </button>
        </form>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;border-bottom:2px solid #b91c1c;padding-bottom:10px;">
        <h2 style="font-family:var(--font-display);font-size:22px;font-weight:700;">
            নির্বাচিত তারিখ: <?= bnDate($selectedDate, false) ?>
        </h2>
        <span style="font-size:14px;color:#6b7280;">মোট <?= bnNum(count($archiveNews)) ?>টি সংবাদ প্রকাশিত হয়েছিল</span>
    </div>

    <?php if (!empty($archiveNews)): ?>
        <div class="news-cards-grid-4">
            <?php foreach ($archiveNews as $item): ?>
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
                        <i class="fa-regular fa-clock"></i> <?= bnDate($item['published_at']) ?>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    <?php else: ?>
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:40px;text-align:center;">
            <p style="font-size:17px;color:#6b7280;">এই তারিখে কোনো সংবাদ পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো তারিখ নির্বাচন করুন।</p>
        </div>
    <?php endif; ?>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
