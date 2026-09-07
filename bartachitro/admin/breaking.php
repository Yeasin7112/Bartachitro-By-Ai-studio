<?php
/**
 * BartaChitro (বার্তাচিত্র) - Breaking News Management
 */

$adminTitle = "ব্রেকিং নিউজ ব্যবস্থাপনা";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

// Toggle Breaking Off
if (isset($_GET['action']) && $_GET['action'] === 'remove' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $db->prepare("UPDATE news SET is_breaking = 0 WHERE id = :id")->execute([':id' => $id]);
    $message = 'সংবাদটি ব্রেকিং তালিকা থেকে সরানো হয়েছে।';
}

// Quick Add Breaking News
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $title = trim($_POST['title'] ?? '');
        $categoryId = (int)($_POST['category_id'] ?? 1);

        if (empty($title)) {
            $error = 'ব্রেকিং শিরোনাম আবশ্যক।';
        } else {
            $slug = generateSlug($title) . '-' . time();
            $stmt = $db->prepare("INSERT INTO news (category_id, author_id, title, slug, summary, content, author_name, featured_image, is_breaking, status, published_at) 
                                  VALUES (:cid, :aid, :title, :slug, :summary, :content, :author, :img, 1, 'published', NOW())");
            $stmt->execute([
                ':cid' => $categoryId,
                ':aid' => $adminUser['id'] ?? 1,
                ':title' => $title,
                ':slug' => $slug,
                ':summary' => $title,
                ':content' => "<p>{$title} - বিস্তারিত আসছে...</p>",
                ':author' => 'অনলাইন ডেস্ক',
                ':img' => 'https://picsum.photos/seed/breaking/800/500'
            ]);
            $message = 'জরুরি ব্রেকিং নিউজ সরাসরি ওয়েবসাইটে যুক্ত হয়েছে!';
        }
    }
}

// Fetch currently active breaking news
$breakingNews = $db->query("SELECT n.*, c.name as category_name 
                            FROM news n 
                            JOIN categories c ON n.category_id = c.id 
                            WHERE n.is_breaking = 1 
                            ORDER BY n.published_at DESC")->fetchAll();

$allCategories = getCategories();
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

<div style="display:grid;grid-template-columns:1.2fr 2fr;gap:24px;align-items:flex-start;">
    <!-- Quick Add Breaking -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3><i class="fa-solid fa-bolt" style="color:#b91c1c;"></i> তাৎক্ষণিক ব্রেকিং প্রকাশ</h3>
        </div>
        <div class="admin-card-body">
            <p style="font-size:13px;color:#64748b;margin-bottom:16px;">
                এখানে শিরোনাম লিখে সাবমিট করলে সাথে সাথে প্রচ্ছদের লাল ব্রেকিং টিকার বারে যুক্ত হবে।
            </p>
            <form action="<?= BASE_URL ?>/admin/breaking.php" method="POST">
                <?= csrfField() ?>
                <div class="form-group">
                    <label class="form-label">ব্রেকিং শিরোনাম *</label>
                    <textarea name="title" rows="3" required class="form-control" placeholder="জরুরি: রাজধানীর কাওরান বাজারে নতুন ডিজিটাল ভবনের উদ্বোধন..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">বিভাগ</label>
                    <select name="category_id" class="form-control">
                        <?php foreach ($allCategories as $c): ?>
                            <option value="<?= $c['id'] ?>"><?= e($c['name']) ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:12px;background:#b91c1c;">
                    <i class="fa-solid fa-bolt"></i> ব্রেকিং পাবলিশ করুন
                </button>
            </form>
        </div>
    </div>

    <!-- Active Breaking News List -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3>বর্তমানে সক্রিয় ব্রেকিং নিউজ (<?= bnNum(count($breakingNews)) ?>)</h3>
        </div>
        <div class="admin-card-body" style="padding:0;overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>শিরোনাম</th>
                        <th>বিভাগ</th>
                        <th>প্রকাশের সময়</th>
                        <th>অ্যাকশন</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (!empty($breakingNews)): ?>
                        <?php foreach ($breakingNews as $b): ?>
                        <tr>
                            <td>
                                <a href="<?= BASE_URL ?>/admin/news-edit.php?id=<?= $b['id'] ?>" style="font-weight:600;color:#0f172a;text-decoration:none;">
                                    <?= e($b['title']) ?>
                                </a>
                            </td>
                            <td><span style="font-weight:600;color:#b91c1c;"><?= e($b['category_name']) ?></span></td>
                            <td style="font-size:12px;color:#64748b;"><?= timeAgoBn($b['published_at']) ?></td>
                            <td>
                                <div style="display:flex;gap:6px;">
                                    <a href="<?= BASE_URL ?>/admin/news-edit.php?id=<?= $b['id'] ?>" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="সম্পাদনা">
                                        <i class="fa-solid fa-pen"></i>
                                    </a>
                                    <a href="?action=remove&id=<?= $b['id'] ?>" class="btn-admin-danger" style="padding:4px 8px;font-size:12px;" title="ব্রেকিং বন্ধ করুন">
                                        বন্ধ করুন
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <tr>
                            <td colspan="4" style="text-align:center;padding:30px;color:#64748b;">বর্তমানে কোনো ব্রেকিং নিউজ সক্রিয় নেই।</td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
