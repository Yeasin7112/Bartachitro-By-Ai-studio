<?php
/**
 * BartaChitro (বার্তাচিত্র) - Admin News List & Management
 */

$adminTitle = "সংবাদ ব্যবস্থাপনা";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

// Handle Delete
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = (int)$_GET['id'];
    try {
        $delStmt = $db->prepare("DELETE FROM news WHERE id = :id");
        $delStmt->execute([':id' => $delId]);
        $message = 'সংবাদটি সফলভাবে মুছে ফেলা হয়েছে।';
    } catch (Exception $e) {
        $error = 'মুছে ফেলতে ত্রুটি হয়েছে।';
    }
}

// Handle Quick Toggle Breaking
if (isset($_GET['action']) && $_GET['action'] === 'toggle_breaking' && isset($_GET['id'])) {
    $tId = (int)$_GET['id'];
    $db->prepare("UPDATE news SET is_breaking = IF(is_breaking=1, 0, 1) WHERE id = :id")->execute([':id' => $tId]);
    $message = 'ব্রেকিং স্ট্যাটাস আপডেট করা হয়েছে।';
}

// Handle Quick Toggle Featured
if (isset($_GET['action']) && $_GET['action'] === 'toggle_featured' && isset($_GET['id'])) {
    $tId = (int)$_GET['id'];
    $db->prepare("UPDATE news SET is_featured = IF(is_featured=1, 0, 1) WHERE id = :id")->execute([':id' => $tId]);
    $message = 'ফিচার্ড স্ট্যাটাস আপডেট করা হয়েছে।';
}

// Filters
$catFilter = $_GET['cat'] ?? '';
$statusFilter = $_GET['status'] ?? '';
$searchQuery = trim($_GET['q'] ?? '');
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$perPage = 10;
$offset = ($page - 1) * $perPage;

$whereClauses = [];
$params = [];

if (!empty($catFilter)) {
    $whereClauses[] = "n.category_id = :cat_id";
    $params[':cat_id'] = $catFilter;
}

if (!empty($statusFilter)) {
    $whereClauses[] = "n.status = :status";
    $params[':status'] = $statusFilter;
}

if (!empty($searchQuery)) {
    $whereClauses[] = "(n.title LIKE :q OR n.author_name LIKE :q)";
    $params[':q'] = "%{$searchQuery}%";
}

$whereSql = !empty($whereClauses) ? "WHERE " . implode(" AND ", $whereClauses) : "";

// Count Total
$countSql = "SELECT COUNT(*) FROM news n $whereSql";
$countStmt = $db->prepare($countSql);
$countStmt->execute($params);
$totalRecords = (int)$countStmt->fetchColumn();
$totalPages = ceil($totalRecords / $perPage);

// Fetch News
$sql = "SELECT n.*, c.name as category_name 
        FROM news n 
        JOIN categories c ON n.category_id = c.id 
        $whereSql 
        ORDER BY n.created_at DESC LIMIT :limit OFFSET :offset";

$stmt = $db->prepare($sql);
foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
$stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$newsItems = $stmt->fetchAll();
$allCategories = getCategories();
?>

<?php if (!empty($message)): ?>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-circle-check"></i> <?= e($message) ?>
    </div>
<?php endif; ?>

<div class="admin-card">
    <div class="admin-card-header">
        <h3>সকল সংবাদ তালিকা (মোট: <?= bnNum($totalRecords) ?>)</h3>
        <a href="<?= BASE_URL ?>/admin/news-add.php" class="btn-admin-primary">
            <i class="fa-solid fa-plus"></i> নতুন খবর প্রকাশ করুন
        </a>
    </div>

    <!-- Filters Bar -->
    <div style="padding:16px 22px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
        <form action="<?= BASE_URL ?>/admin/news.php" method="GET" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
            <input type="text" name="q" value="<?= e($searchQuery) ?>" placeholder="শিরোনাম দিয়ে খুঁজুন..." class="form-control" style="width:240px;">
            
            <select name="cat" class="form-control" style="width:180px;">
                <option value="">সকল ক্যাটাগরি</option>
                <?php foreach ($allCategories as $cat): ?>
                    <option value="<?= $cat['id'] ?>" <?= ($catFilter == $cat['id']) ? 'selected' : '' ?>><?= e($cat['name']) ?></option>
                <?php endforeach; ?>
            </select>

            <select name="status" class="form-control" style="width:150px;">
                <option value="">সকল স্ট্যাটাস</option>
                <option value="published" <?= ($statusFilter === 'published') ? 'selected' : '' ?>>প্রকাশিত</option>
                <option value="draft" <?= ($statusFilter === 'draft') ? 'selected' : '' ?>>ড্রাফট</option>
            </select>

            <button type="submit" class="btn-admin-outline">ফিল্টার করুন</button>
            <a href="<?= BASE_URL ?>/admin/news.php" class="btn-admin-outline">রিসেট</a>
        </form>
    </div>

    <div class="admin-card-body" style="padding:0;overflow-x:auto;">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ছবি</th>
                    <th>শিরোনাম ও প্রতিবেদক</th>
                    <th>ক্যাটাগরি</th>
                    <th>ভিউ</th>
                    <th>ব্রেকিং?</th>
                    <th>ফিচার্ড?</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                    <th>অ্যাকশন</th>
                </tr>
            </thead>
            <tbody>
                <?php if (!empty($newsItems)): ?>
                    <?php foreach ($newsItems as $news): ?>
                    <tr>
                        <td style="width:60px;">
                            <img src="<?= e($news['featured_image']) ?>" alt="" style="width:50px;height:36px;object-fit:cover;border-radius:4px;">
                        </td>
                        <td style="max-width:280px;">
                            <a href="<?= BASE_URL ?>/admin/news-edit.php?id=<?= $news['id'] ?>" style="font-weight:600;color:#0f172a;text-decoration:none;">
                                <?= e($news['title']) ?>
                            </a>
                            <div style="font-size:12px;color:#94a3b8;"><?= e($news['author_name']) ?></div>
                        </td>
                        <td><span style="font-weight:600;color:#b91c1c;"><?= e($news['category_name']) ?></span></td>
                        <td><?= bnNum($news['views']) ?></td>
                        <td>
                            <a href="?action=toggle_breaking&id=<?= $news['id'] ?>" style="text-decoration:none;" title="ক্লিক করে পরিবর্তন করুন">
                                <span class="badge-status <?= $news['is_breaking'] ? 'badge-breaking' : 'badge-draft' ?>">
                                    <?= $news['is_breaking'] ? 'ব্রেকিং: হ্যাঁ' : 'না' ?>
                                </span>
                            </a>
                        </td>
                        <td>
                            <a href="?action=toggle_featured&id=<?= $news['id'] ?>" style="text-decoration:none;" title="ক্লিক করে পরিবর্তন করুন">
                                <span class="badge-status <?= $news['is_featured'] ? 'badge-featured' : 'badge-draft' ?>">
                                    <?= $news['is_featured'] ? 'লিড: হ্যাঁ' : 'না' ?>
                                </span>
                            </a>
                        </td>
                        <td>
                            <span class="badge-status badge-<?= $news['status'] ?>">
                                <?= ($news['status'] === 'published') ? 'প্রকাশিত' : 'ড্রাফট' ?>
                            </span>
                        </td>
                        <td style="font-size:12px;color:#64748b;"><?= bnDate($news['published_at']) ?></td>
                        <td>
                            <div style="display:flex;gap:6px;">
                                <a href="<?= BASE_URL ?>/admin/news-edit.php?id=<?= $news['id'] ?>" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="সম্পাদনা">
                                    <i class="fa-solid fa-pen"></i>
                                </a>
                                <a href="<?= BASE_URL ?>/article.php?slug=<?= e($news['slug']) ?>" target="_blank" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="দেখুন">
                                    <i class="fa-solid fa-eye"></i>
                                </a>
                                <a href="?action=delete&id=<?= $news['id'] ?>" class="btn-admin-danger confirm-delete" style="padding:4px 8px;font-size:12px;" title="মুছে ফেলুন">
                                    <i class="fa-solid fa-trash"></i>
                                </a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="9" style="text-align:center;padding:30px;color:#64748b;">কোনো সংবাদ পাওয়া যায়নি।</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <?php if ($totalPages > 1): ?>
    <div style="display:flex;justify-content:center;gap:6px;padding:20px;">
        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
            <a href="?page=<?= $i ?>&q=<?= urlencode($searchQuery) ?>&cat=<?= urlencode($catFilter) ?>&status=<?= urlencode($statusFilter) ?>" style="padding:6px 12px;border-radius:4px;font-weight:600;<?= ($i == $page) ? 'background:#b91c1c;color:#ffffff;' : 'background:#ffffff;border:1px solid #cbd5e1;color:#0f172a;' ?>">
                <?= bnNum($i) ?>
            </a>
        <?php endfor; ?>
    </div>
    <?php endif; ?>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
