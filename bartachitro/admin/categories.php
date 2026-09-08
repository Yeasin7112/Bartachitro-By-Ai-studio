<?php
/**
 * BartaChitro (বার্তাচিত্র) - Category Management
 */

$adminTitle = "ক্যাটাগরি ব্যবস্থাপনা";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

// Handle Delete
if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $delId = (int)$_GET['id'];
    $newsCount = (int)$db->prepare("SELECT COUNT(*) FROM news WHERE category_id = :id")->execute([':id' => $delId]) ? $db->query("SELECT COUNT(*) FROM news WHERE category_id = $delId")->fetchColumn() : 0;
    
    if ($newsCount > 0) {
        $error = "এই ক্যাটাগরিতে " . bnNum($newsCount) . "টি সংবাদ রয়েছে! প্রথমে সংবাদগুলো অন্য ক্যাটাগরিতে স্থানান্তর করুন।";
    } else {
        $db->prepare("DELETE FROM categories WHERE id = :id")->execute([':id' => $delId]);
        $message = 'ক্যাটাগরি মুছে ফেলা হয়েছে।';
    }
}

// Handle Add / Edit Form
$editCat = null;
if (isset($_GET['edit'])) {
    $eStmt = $db->prepare("SELECT * FROM categories WHERE id = :id");
    $eStmt->execute([':id' => (int)$_GET['edit']]);
    $editCat = $eStmt->fetch();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $name = trim($_POST['name'] ?? '');
        $nameEn = trim($_POST['name_en'] ?? '');
        $slug = trim($_POST['slug'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $displayOrder = (int)($_POST['display_order'] ?? 0);
        $status = $_POST['status'] ?? 'active';
        $editId = isset($_POST['category_id']) ? (int)$_POST['category_id'] : 0;

        if (empty($name)) {
            $error = 'ক্যাটাগরির নাম আবশ্যক।';
        } else {
            if (empty($nameEn)) {
                $nameEn = $name;
            }
            if (empty($slug)) {
                $slug = generateSlug($name);
            }

            if ($editId > 0) {
                // Update
                $stmt = $db->prepare("UPDATE categories SET name = :name, slug = :slug, name_en = :name_en, description = :desc, display_order = :order, status = :status WHERE id = :id");
                $stmt->execute([
                    ':name' => $name,
                    ':slug' => $slug,
                    ':name_en' => $nameEn,
                    ':desc' => $description,
                    ':order' => $displayOrder,
                    ':status' => $status,
                    ':id' => $editId
                ]);
                $message = 'ক্যাটাগরি আপডেট সম্পন্ন হয়েছে।';
                $editCat = null;
            } else {
                // Insert
                $stmt = $db->prepare("INSERT INTO categories (name, slug, name_en, description, display_order, status) VALUES (:name, :slug, :name_en, :desc, :order, :status)");
                $stmt->execute([
                    ':name' => $name,
                    ':slug' => $slug,
                    ':name_en' => $nameEn,
                    ':desc' => $description,
                    ':order' => $displayOrder,
                    ':status' => $status
                ]);
                $message = 'নতুন ক্যাটাগরি তৈরি হয়েছে।';
            }
        }
    }
}

// Fetch all categories with news count
$categoriesList = $db->query("SELECT c.*, COUNT(n.id) as news_count 
                             FROM categories c 
                             LEFT JOIN news n ON c.id = n.category_id 
                             GROUP BY c.id 
                             ORDER BY c.display_order ASC, c.id ASC")->fetchAll();
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
    <!-- Add / Edit Form -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3><?= $editCat ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি' ?></h3>
            <?php if ($editCat): ?>
                <a href="<?= BASE_URL ?>/admin/categories.php" class="btn-admin-outline" style="font-size:12px;padding:4px 8px;">বাতিল</a>
            <?php endif; ?>
        </div>
        <div class="admin-card-body">
            <form action="<?= BASE_URL ?>/admin/categories.php" method="POST">
                <?= csrfField() ?>
                <?php if ($editCat): ?>
                    <input type="hidden" name="category_id" value="<?= $editCat['id'] ?>">
                <?php endif; ?>

                <div class="form-group">
                    <label class="form-label">ক্যাটাগরির নাম (বাংলা) *</label>
                    <input type="text" name="name" required class="form-control" value="<?= e($editCat['name'] ?? '') ?>" placeholder="যেমন: প্রযুক্তি">
                </div>

                <div class="form-group">
                    <label class="form-label">স্লাগ (URL identifier)</label>
                    <input type="text" name="slug" class="form-control" value="<?= e($editCat['slug'] ?? '') ?>" placeholder="যেমন: technology">
                </div>

                <div class="form-group">
                    <label class="form-label">সংক্ষিপ্ত বিবরণ</label>
                    <textarea name="description" rows="3" class="form-control" placeholder="এই ক্যাটাগরির বিবরণ..."><?= e($editCat['description'] ?? '') ?></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">প্রদর্শন ক্রম (Display Order)</label>
                    <input type="number" name="display_order" class="form-control" value="<?= e($editCat['display_order'] ?? 0) ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">স্ট্যাটাস</label>
                    <select name="status" class="form-control">
                        <option value="active" <?= (($editCat['status'] ?? '') === 'active') ? 'selected' : '' ?>>সক্রিয় (Active)</option>
                        <option value="inactive" <?= (($editCat['status'] ?? '') === 'inactive') ? 'selected' : '' ?>>নিষ্ক্রিয় (Inactive)</option>
                    </select>
                </div>

                <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:10px;">
                    <i class="fa-solid fa-check"></i> <?= $editCat ? 'পরিবর্তন সংরক্ষণ করুন' : 'ক্যাটাগরি যুক্ত করুন' ?>
                </button>
            </form>
        </div>
    </div>

    <!-- Category List Table -->
    <div class="admin-card">
        <div class="admin-card-header">
            <h3>বর্তমান ক্যাটাগরি তালিকা (<?= bnNum(count($categoriesList)) ?>)</h3>
        </div>
        <div class="admin-card-body" style="padding:0;overflow-x:auto;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ক্রম</th>
                        <th>নাম</th>
                        <th>স্লাগ</th>
                        <th>সংবাদ সংখ্যা</th>
                        <th>স্ট্যাটাস</th>
                        <th>অ্যাকশন</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($categoriesList as $cat): ?>
                    <tr>
                        <td><?= bnNum($cat['display_order']) ?></td>
                        <td><strong><?= e($cat['name']) ?></strong></td>
                        <td><code><?= e($cat['slug']) ?></code></td>
                        <td><?= bnNum($cat['news_count']) ?></td>
                        <td>
                            <span class="badge-status <?= ($cat['status'] === 'active') ? 'badge-published' : 'badge-draft' ?>">
                                <?= ($cat['status'] === 'active') ? 'সক্রিয়' : 'নিষ্ক্রিয়' ?>
                            </span>
                        </td>
                        <td>
                            <a href="?edit=<?= $cat['id'] ?>" class="btn-admin-outline" style="padding:4px 8px;font-size:12px;" title="সম্পাদনা">
                                <i class="fa-solid fa-pen"></i>
                            </a>
                            <a href="?action=delete&id=<?= $cat['id'] ?>" class="btn-admin-danger confirm-delete" style="padding:4px 8px;font-size:12px;" title="মুছে ফেলুন">
                                <i class="fa-solid fa-trash"></i>
                            </a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
