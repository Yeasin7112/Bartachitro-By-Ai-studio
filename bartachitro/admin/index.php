<?php
/**
 * BartaChitro (বার্তাচিত্র) - Admin Dashboard
 */

$adminTitle = "ড্যাশবোর্ড ওভারভিউ";
require_once __DIR__ . '/header.php';

$db = getDB();

// Statistics Queries
$totalNews = (int)$db->query("SELECT COUNT(*) FROM news")->fetchColumn();
$publishedNews = (int)$db->query("SELECT COUNT(*) FROM news WHERE status = 'published'")->fetchColumn();
$draftNews = (int)$db->query("SELECT COUNT(*) FROM news WHERE status = 'draft'")->fetchColumn();
$featuredNews = (int)$db->query("SELECT COUNT(*) FROM news WHERE is_featured = 1 AND status = 'published'")->fetchColumn();
$breakingNews = (int)$db->query("SELECT COUNT(*) FROM news WHERE is_breaking = 1 AND status = 'published'")->fetchColumn();
$totalCategories = (int)$db->query("SELECT COUNT(*) FROM categories")->fetchColumn();
$totalViews = (int)$db->query("SELECT COALESCE(SUM(views), 0) FROM news")->fetchColumn();
$unreadMessages = (int)$db->query("SELECT COUNT(*) FROM contact_messages WHERE is_read = 0")->fetchColumn();

// Recent News
$stmt = $db->query("SELECT n.*, c.name as category_name 
                    FROM news n 
                    JOIN categories c ON n.category_id = c.id 
                    ORDER BY n.created_at DESC LIMIT 6");
$recentNews = $stmt->fetchAll();
?>

<!-- Metric Cards Grid -->
<div class="admin-stats-grid">
    <div class="stat-card">
        <div class="stat-icon red"><i class="fa-solid fa-newspaper"></i></div>
        <div class="stat-info">
            <div class="stat-label">মোট সংবাদ</div>
            <div class="stat-value"><?= bnNum($totalNews) ?></div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon green"><i class="fa-solid fa-circle-check"></i></div>
        <div class="stat-info">
            <div class="stat-label">প্রকাশিত</div>
            <div class="stat-value"><?= bnNum($publishedNews) ?></div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon amber"><i class="fa-solid fa-file-pen"></i></div>
        <div class="stat-info">
            <div class="stat-label">খসড়া (ড্রাফট)</div>
            <div class="stat-value"><?= bnNum($draftNews) ?></div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon purple"><i class="fa-solid fa-star"></i></div>
        <div class="stat-info">
            <div class="stat-label">ফিচার্ড / লিড</div>
            <div class="stat-value"><?= bnNum($featuredNews) ?></div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon red"><i class="fa-solid fa-bolt"></i></div>
        <div class="stat-info">
            <div class="stat-label">ব্রেকিং নিউজ</div>
            <div class="stat-value"><?= bnNum($breakingNews) ?></div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon blue"><i class="fa-solid fa-layer-group"></i></div>
        <div class="stat-info">
            <div class="stat-label">মোট ক্যাটাগরি</div>
            <div class="stat-value"><?= bnNum($totalCategories) ?></div>
        </div>
    </div>

    <div class="stat-card">
        <div class="stat-icon green"><i class="fa-solid fa-chart-line"></i></div>
        <div class="stat-info">
            <div class="stat-label">মোট ভিউয়ারশিপ</div>
            <div class="stat-value"><?= bnNum($totalViews) ?></div>
        </div>
    </div>
</div>

<!-- Quick Actions Banner -->
<div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:18px 24px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
    <div>
        <h3 style="font-size:17px;font-weight:700;margin-bottom:4px;">দ্রুত সংবাদ প্রকাশ (Quick Publish)</h3>
        <p style="font-size:13px;color:#64748b;">সাংবাদিকদের জন্য সহজ ও তাৎক্ষণিক সংবাদ প্রকাশ ব্যবস্থা।</p>
    </div>
    <div style="display:flex;gap:10px;">
        <a href="<?= BASE_URL ?>/admin/news-add.php" class="btn-admin-primary">
            <i class="fa-solid fa-plus"></i> নতুন খবর লিখুন
        </a>
        <a href="<?= BASE_URL ?>/admin/breaking.php" class="btn-admin-outline">
            <i class="fa-solid fa-bolt"></i> ব্রেকিং আপডেট
        </a>
    </div>
</div>

<!-- Recent News Table -->
<div class="admin-card">
    <div class="admin-card-header">
        <h3>সাম্প্রতিক সংবাদ তালিকা</h3>
        <a href="<?= BASE_URL ?>/admin/news.php" class="btn-admin-outline" style="font-size:13px;padding:4px 10px;">সব দেখুন</a>
    </div>
    <div class="admin-card-body" style="padding:0;overflow-x:auto;">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ছবি</th>
                    <th>শিরোনাম</th>
                    <th>ক্যাটাগরি</th>
                    <th>ভিউ</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                    <th>অ্যাকশন</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($recentNews as $news): ?>
                <tr>
                    <td style="width:60px;">
                        <img src="<?= e($news['featured_image']) ?>" alt="" style="width:50px;height:36px;object-fit:cover;border-radius:4px;">
                    </td>
                    <td style="max-width:320px;">
                        <div style="font-weight:600;color:#0f172a;line-height:1.3;"><?= e($news['title']) ?></div>
                        <div style="font-size:12px;color:#94a3b8;margin-top:2px;">প্রতিবেদক: <?= e($news['author_name']) ?></div>
                    </td>
                    <td><span style="font-weight:600;color:#b91c1c;"><?= e($news['category_name']) ?></span></td>
                    <td><?= bnNum($news['views']) ?></td>
                    <td>
                        <span class="badge-status badge-<?= $news['status'] ?>">
                            <?= ($news['status'] === 'published') ? 'প্রকাশিত' : 'ড্রাফট' ?>
                        </span>
                        <?php if ($news['is_breaking']): ?>
                            <span class="badge-status badge-breaking">ব্রেকিং</span>
                        <?php endif; ?>
                        <?php if ($news['is_featured']): ?>
                            <span class="badge-status badge-featured">লিড</span>
                        <?php endif; ?>
                    </td>
                    <td style="font-size:12px;color:#64748b;"><?= bnDate($news['published_at']) ?></td>
                    <td>
                        <a href="<?= BASE_URL ?>/admin/news-edit.php?id=<?= $news['id'] ?>" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="সম্পাদনা">
                            <i class="fa-solid fa-pen"></i>
                        </a>
                        <a href="<?= BASE_URL ?>/article.php?slug=<?= e($news['slug']) ?>" target="_blank" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="দেখুন">
                            <i class="fa-solid fa-eye"></i>
                        </a>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
