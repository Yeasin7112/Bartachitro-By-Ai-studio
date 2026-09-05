<?php
/**
 * BartaChitro (বার্তাচিত্র) - Advertisements Management
 */

$adminTitle = "বিজ্ঞাপন ব্যবস্থাপনা";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

// Handle Delete
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = (int)$_GET['id'];
    $db->prepare("DELETE FROM ads WHERE id = :id")->execute([':id' => $delId]);
    $message = 'বিজ্ঞাপনটি মুছে ফেলা হয়েছে।';
}

// Handle Add / Edit
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $title = trim($_POST['title'] ?? '');
        $position = $_POST['position'] ?? 'header_top';
        $imageUrl = trim($_POST['image_url'] ?? '');
        $targetUrl = trim($_POST['target_url'] ?? '#');
        $status = $_POST['status'] ?? 'active';
        $editId = isset($_POST['ad_id']) ? (int)$_POST['ad_id'] : 0;

        if (empty($title) || empty($imageUrl)) {
            $error = 'বিজ্ঞাপনের শিরোনাম ও ইমেজ লিংক আবশ্যক।';
        } else {
            if ($editId > 0) {
                $stmt = $db->prepare("UPDATE ads SET title = :t, position = :p, image_url = :i, target_url = :u, status = :s WHERE id = :id");
                $stmt->execute([
                    ':t' => $title,
                    ':p' => $position,
                    ':i' => $imageUrl,
                    ':u' => $targetUrl,
                    ':s' => $status,
                    ':id' => $editId
                ]);
                $message = 'বিজ্ঞাপন আপডেট হয়েছে।';
            } else {
                $stmt = $db->prepare("INSERT INTO ads (title, position, image_url, target_url, status) VALUES (:t, :p, :i, :u, :s)");
                $stmt->execute([
                    ':t' => $title,
                    ':p' => $position,
                    ':i' => $imageUrl,
                    ':u' => $targetUrl,
                    ':s' => $status
                ]);
                $message = 'নতুন বিজ্ঞাপন সক্রিয় করা হয়েছে।';
            }
        }
    }
}

$editAd = null;
if (isset($_GET['edit'])) {
    $eStmt = $db->prepare("SELECT * FROM ads WHERE id = :id");
    $eStmt->execute([':id' => (int)$_GET['edit']]);
    $editAd = $eStmt->fetch();
}

$adsList = $db->query("SELECT * FROM ads ORDER BY position ASC, id DESC")->fetchAll();
?>

<?php if (!empty($message)): ?>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-circle-check"></i> <?= e($message) ?>
    </div>
<?php endif; ?>

<?php if (!empty($error)): ?>
    <div style="background:#fee2e2;border:1px solid #fecaca;color:#b91c1c;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-triangle-exclamation"></i> <?= e($error) ?>
    </div>
<?php endif; ?>

<div style="display:grid;grid-template-columns:1fr 2fr;gap:24px;align-items:flex-start;">
    <!-- Add / Edit Card -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3><?= $editAd ? 'বিজ্ঞাপন সম্পাদনা' : 'নতুন বিজ্ঞাপন যোগ করুন' ?></h3>
            <?php if ($editAd): ?>
                <a href="<?= BASE_URL ?>/admin/ads.php" class="btn-admin-outline" style="font-size:12px;padding:4px 8px;">বাতিল</a>
            <?php endif; ?>
        </div>
        <div class="admin-card-body">
            <form action="<?= BASE_URL ?>/admin/ads.php" method="POST">
                <?= csrfField() ?>
                <?php if ($editAd): ?>
                    <input type="hidden" name="ad_id" value="<?= $editAd['id'] ?>">
                <?php endif; ?>

                <div class="form-group">
                    <label class="form-label">বিজ্ঞাপনের শিরোনাম *</label>
                    <input type="text" name="title" required class="form-control" value="<?= e($editAd['title'] ?? '') ?>" placeholder="যেমন: ঈদ স্পেশাল ক্যাম্পেইন">
                </div>

                <div class="form-group">
                    <label class="form-label">স্লট / অবস্থান *</label>
                    <select name="position" class="form-control">
                        <option value="header_top" <?= (($editAd['position'] ?? '') === 'header_top') ? 'selected' : '' ?>>হেডারের উপরে (Header Top - 728x90)</option>
                        <option value="home_middle" <?= (($editAd['position'] ?? '') === 'home_middle') ? 'selected' : '' ?>>প্রচ্ছদের মাঝে (Home Middle - 728x90)</option>
                        <option value="sidebar" <?= (($editAd['position'] ?? '') === 'sidebar') ? 'selected' : '' ?>>সাইডবার (Sidebar - 300x250)</option>
                        <option value="article_inline" <?= (($editAd['position'] ?? '') === 'article_inline') ? 'selected' : '' ?>>খবরের ভেতরে (Article Inline - 728x90)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">ব্যানার ইমেজ লিংক (URL) *</label>
                    <input type="url" name="image_url" required class="form-control" value="<?= e($editAd['image_url'] ?? '') ?>" placeholder="https://...">
                </div>

                <div class="form-group">
                    <label class="form-label">ক্লিক করলে যাওয়ার লিংক (Target URL)</label>
                    <input type="url" name="target_url" class="form-control" value="<?= e($editAd['target_url'] ?? '#') ?>" placeholder="https://advertiser.com">
                </div>

                <div class="form-group">
                    <label class="form-label">স্ট্যাটাস</label>
                    <select name="status" class="form-control">
                        <option value="active" <?= (($editAd['status'] ?? '') === 'active') ? 'selected' : '' ?>>সক্রিয় (Active)</option>
                        <option value="inactive" <?= (($editAd['status'] ?? '') === 'inactive') ? 'selected' : '' ?>>নিষ্ক্রিয় (Inactive)</option>
                    </select>
                </div>

                <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:11px;">
                    <i class="fa-solid fa-check"></i> <?= $editAd ? 'পরিবর্তন সংরক্ষণ করুন' : 'বিজ্ঞাপন চালু করুন' ?>
                </button>
            </form>
        </div>
    </div>

    <!-- Ads Table -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3>সকল বিজ্ঞাপন স্লট (<?= bnNum(count($adsList)) ?>)</h3>
        </div>
        <div class="admin-card-body" style="padding:0;overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ব্যানার প্রিভিউ</th>
                        <th>শিরোনাম</th>
                        <th>অবস্থান</th>
                        <th>ভিউ / ক্লিক</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($adsList)): ?>
                        <?php foreach ($adsList as $ad): ?>
                        <tr>
                            <td style="width:120px;">
                                <img src="<?= e($ad['image_url']) ?>" alt="" style="width:110px;height:40px;object-fit:cover;border-radius:4px;">
                            </td>
                            <td>
                                <strong><?= e($ad['title']) ?></strong>
                                <div style="font-size:11px;color:#64748b;"><?= e($ad['target_url']) ?></div>
                            </td>
                            <td><code><?= e($ad['position']) ?></code></td>
                            <td style="font-size:12px;"><?= bnNum($ad['views']) ?> / <?= bnNum($ad['clicks']) ?></td>
                            <td>
                                <span class="badge-status <?= ($ad['status'] === 'active') ? 'badge-published' : 'badge-draft' ?>">
                                    <?= ($ad['status'] === 'active') ? 'সক্রিয়' : 'নিষ্ক্রিয়' ?>
                                </span>
                            </td>
                            <td>
                                <a href="?edit=<?= $ad['id'] ?>" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;">
                                    <i class="fa-solid fa-pen"></i>
                                </a>
                                <a href="?action=delete&id=<?= $ad['id'] ?>" class="btn-admin-danger confirm-delete" style="padding:4px 8px;font-size:12px;">
                                    <i class="fa-solid fa-trash"></i>
                                </a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="6" style="text-align:center;padding:30px;color:#64748b;">কোনো বিজ্ঞাপন পাওয়া যায়নি।</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
