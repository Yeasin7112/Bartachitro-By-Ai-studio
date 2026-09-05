<?php
/**
 * BartaChitro (বার্তাচিত্র) - Search Page
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();
$query = trim($_GET['q'] ?? '');
$categoryFilter = $_GET['cat'] ?? '';

$results = [];
if (!empty($query)) {
    $sql = "SELECT n.*, c.name as category_name, c.slug as category_slug 
            FROM news n 
            JOIN categories c ON n.category_id = c.id 
            WHERE n.status = 'published' AND (
                n.title LIKE :q1 OR 
                n.summary LIKE :q2 OR 
                n.content LIKE :q3 OR 
                n.author_name LIKE :q4 OR
                c.name LIKE :q5
            )";
    
    $params = [
        ':q1' => "%{$query}%",
        ':q2' => "%{$query}%",
        ':q3' => "%{$query}%",
        ':q4' => "%{$query}%",
        ':q5' => "%{$query}%"
    ];

    if (!empty($categoryFilter)) {
        $sql .= " AND c.slug = :cat_slug";
        $params[':cat_slug'] = $categoryFilter;
    }

    $sql .= " ORDER BY n.published_at DESC LIMIT 30";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll();
}

$customTitle = !empty($query) ? "অনুসন্ধান: " . $query : "সংবাদ অনুসন্ধান";
include __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width:980px;margin-top:10px;margin-bottom:60px;">
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:30px;box-shadow:var(--shadow-sm);margin-bottom:30px;">
        <h1 class="section-title" style="margin-bottom:20px;">সংবাদ অনুসন্ধান</h1>
        <form action="<?= BASE_URL ?>/search.php" method="GET" style="display:flex;gap:12px;flex-wrap:wrap;">
            <input type="text" name="q" value="<?= e($query) ?>" placeholder="কী খুঁজতে চান? শিরোনাম, বিষয় বা প্রতিবেদকের নাম লিখুন..." required style="flex-grow:1;padding:12px 16px;border:1px solid #d1d5db;border-radius:6px;font-size:16px;font-family:var(--font-ui);outline:none;">
            
            <select name="cat" style="padding:12px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;font-family:var(--font-ui);background:#ffffff;">
                <option value="">সকল ক্যাটাগরি</option>
                <?php foreach ($categories as $c): ?>
                    <option value="<?= e($c['slug']) ?>" <?= ($categoryFilter === $c['slug']) ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                <?php endforeach; ?>
            </select>

            <button type="submit" class="admin-badge-btn" style="padding:12px 24px;font-size:16px;background:#b91c1c;border:none;cursor:pointer;">
                <i class="fa-solid fa-magnifying-glass"></i> অনুসন্ধান
            </button>
        </form>
    </div>

    <?php if (!empty($query)): ?>
        <div style="margin-bottom:20px;font-size:16px;color:#4b5563;">
            "<strong><?= e($query) ?></strong>" সম্পর্কিত মোট <strong><?= bnNum(count($results)) ?></strong>টি সংবাদ পাওয়া গেছে:
        </div>

        <?php if (!empty($results)): ?>
            <div style="display:flex;flex-direction:column;gap:16px;">
                <?php foreach ($results as $item): ?>
                <article style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;display:flex;gap:20px;align-items:flex-start;">
                    <div style="width:160px;height:105px;flex-shrink:0;border-radius:6px;overflow:hidden;">
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($item['slug']) ?>">
                            <img src="<?= e($item['featured_image']) ?>" alt="<?= e($item['title']) ?>" style="width:100%;height:100%;object-fit:cover;">
                        </a>
                    </div>
                    <div style="flex-grow:1;">
                        <span style="color:#b91c1c;font-weight:700;font-size:12px;"><?= e($item['category_name']) ?></span>
                        <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;margin:4px 0 6px;">
                            <a href="<?= BASE_URL ?>/article.php?slug=<?= e($item['slug']) ?>"><?= e($item['title']) ?></a>
                        </h3>
                        <p style="font-size:14px;color:#4b5563;line-height:1.5;margin-bottom:8px;"><?= limitWords($item['summary'], 22) ?></p>
                        <div style="font-size:12px;color:#9ca3af;">
                            <i class="fa-regular fa-clock"></i> <?= bnDate($item['published_at']) ?> • প্রতিবেদক: <?= e($item['author_name']) ?>
                        </div>
                    </div>
                </article>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:40px;text-align:center;">
                <i class="fa-regular fa-face-frown" style="font-size:40px;color:#9ca3af;margin-bottom:12px;"></i>
                <p style="font-size:17px;color:#4b5563;">কোনো ফলাফল খুঁজে পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন।</p>
            </div>
        <?php endif; ?>
    <?php endif; ?>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
