<?php
/**
 * BartaChitro (বার্তাচিত্র) - Edit News
 */

$adminTitle = "সংবাদ সম্পাদনা";
require_once __DIR__ . '/header.php';

$db = getDB();
$error = '';
$message = '';
$allCategories = getCategories();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $db->prepare("SELECT * FROM news WHERE id = :id");
$stmt->execute([':id' => $id]);
$news = $stmt->fetch();

if (!$news) {
    echo "<div class='admin-card'><div class='admin-card-body'>সংবাদটি পাওয়া যায়নি। <a href='news.php'>তালিকায় ফিরুন</a></div></div>";
    require_once __DIR__ . '/footer.php';
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $categoryId = (int)($_POST['category_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $slug = trim($_POST['slug'] ?? '');
        $summary = trim($_POST['summary'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $authorName = trim($_POST['author_name'] ?? '');
        $featuredImage = trim($_POST['featured_image'] ?? $news['featured_image']);
        $imageCaption = trim($_POST['image_caption'] ?? '');
        $isFeatured = isset($_POST['is_featured']) ? 1 : 0;
        $isBreaking = isset($_POST['is_breaking']) ? 1 : 0;
        $status = $_POST['status'] ?? 'published';
        $seoTitle = trim($_POST['seo_title'] ?? '');
        $seoDescription = trim($_POST['seo_description'] ?? '');
        $seoKeywords = trim($_POST['seo_keywords'] ?? '');

        // Upload new file if provided
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = dirname(__DIR__, 2) . '/uploads/';
            if (!is_dir($uploadDir)) {
                @mkdir($uploadDir, 0755, true);
            }
            if (!is_dir($uploadDir)) {
                $uploadDir = __DIR__ . '/../uploads/';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0755, true);
                }
            }
            $fileExt = strtolower(pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION));
            $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            if (in_array($fileExt, $allowedExts)) {
                $fileName = 'news_' . time() . '_' . rand(100, 999) . '.' . $fileExt;
                if (move_uploaded_file($_FILES['image_file']['tmp_name'], $uploadDir . $fileName)) {
                    @chmod($uploadDir . $fileName, 0644);
                    $featuredImage = '/uploads/' . $fileName;
                }
            }
        }

        if (empty($title) || empty($categoryId) || empty($content)) {
            $error = 'ক্যাটাগরি, শিরোনাম এবং সংবাদের মূল বিবরণ আবশ্যক।';
        } else {
            try {
                $upStmt = $db->prepare("UPDATE news SET 
                    category_id = :category_id,
                    title = :title,
                    slug = :slug,
                    summary = :summary,
                    content = :content,
                    author_name = :author_name,
                    featured_image = :featured_image,
                    image_caption = :image_caption,
                    is_featured = :is_featured,
                    is_breaking = :is_breaking,
                    status = :status,
                    seo_title = :seo_title,
                    seo_description = :seo_description,
                    seo_keywords = :seo_keywords,
                    updated_at = NOW()
                    WHERE id = :id");

                $upStmt->execute([
                    ':category_id' => $categoryId,
                    ':title' => $title,
                    ':slug' => $slug,
                    ':summary' => $summary,
                    ':content' => $content,
                    ':author_name' => $authorName,
                    ':featured_image' => $featuredImage,
                    ':image_caption' => $imageCaption,
                    ':is_featured' => $isFeatured,
                    ':is_breaking' => $isBreaking,
                    ':status' => $status,
                    ':seo_title' => $seoTitle,
                    ':seo_description' => $seoDescription,
                    ':seo_keywords' => $seoKeywords,
                    ':id' => $id
                ]);

                $message = 'সংবাদটি সফলভাবে আপডেট করা হয়েছে!';
                
                // Refresh news data
                $stmt = $db->prepare("SELECT * FROM news WHERE id = :id");
                $stmt->execute([':id' => $id]);
                $news = $stmt->fetch();
            } catch (Exception $e) {
                $error = 'আপডেট করতে সমস্যা হয়েছে: ' . $e->getMessage();
            }
        }
    }
}
?>

<?php if (!empty($message)): ?>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-circle-check"></i> <?= e($message) ?> <a href="<?= BASE_URL ?>/article.php?slug=<?= e($news['slug']) ?>" target="_blank" style="margin-left:10px;font-weight:700;color:#065f46;">সাইটে দেখুন <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    </div>
<?php endif; ?>

<?php if (!empty($error)): ?>
    <div style="background:#fee2e2;border:1px solid #fecaca;color:#b91c1c;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-triangle-exclamation"></i> <?= e($error) ?>
    </div>
<?php endif; ?>

<form action="<?= BASE_URL ?>/admin/news-edit.php?id=<?= $id ?>" method="POST" enctype="multipart/form-data">
    <?= csrfField() ?>
    
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;align-items:flex-start;">
        <!-- Left Column: Main Editor -->
        <div class="admin-card">
            <div class="admin-card-header">
                <h3>সংবাদের বিষয়বস্তু সম্পাদনা</h3>
            </div>
            <div class="admin-card-body">
                <div class="form-group">
                    <label class="form-label">শিরোনাম *</label>
                    <input type="text" name="title" id="newsTitleInput" required class="form-control" value="<?= e($news['title']) ?>" style="font-size:18px;font-weight:600;">
                </div>

                <div class="form-group">
                    <label class="form-label">সংক্ষিপ্ত সারসংক্ষেপ (Summary)</label>
                    <textarea name="summary" rows="3" class="form-control"><?= e($news['summary']) ?></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">সংবাদের পূর্ণাঙ্গ বিবরণ (Content) *</label>
                    <textarea name="content" rows="14" required class="form-control" style="line-height:1.6;font-size:16px;"><?= e($news['content']) ?></textarea>
                </div>

                <!-- SEO Section -->
                <div style="border-top:1px solid #e2e8f0;padding-top:18px;margin-top:24px;">
                    <h4 style="font-size:15px;font-weight:700;margin-bottom:12px;color:#475569;">সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)</h4>
                    <div class="form-group">
                        <label class="form-label">কাস্টম এসইও শিরোনাম (ঐচ্ছিক)</label>
                        <input type="text" name="seo_title" class="form-control" value="<?= e($news['seo_title']) ?>">
                    </div>
                    <div class="form-group">
                        <label class="form-label">এসইও মেটা বিবরণ (ঐচ্ছিক)</label>
                        <textarea name="seo_description" rows="2" class="form-control"><?= e($news['seo_description']) ?></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">কি-ওয়ার্ডস (কমা দিয়ে আলাদা করুন)</label>
                        <input type="text" name="seo_keywords" class="form-control" value="<?= e($news['seo_keywords']) ?>">
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Settings & Publishing -->
        <div style="display:flex;flex-direction:column;gap:24px;">
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3>আপডেট কন্ট্রোল</h3>
                </div>
                <div class="admin-card-body">
                    <div class="form-group">
                        <label class="form-label">ক্যাটাগরি / বিভাগ *</label>
                        <select name="category_id" required class="form-control">
                            <?php foreach ($allCategories as $c): ?>
                                <option value="<?= $c['id'] ?>" <?= ($news['category_id'] == $c['id']) ? 'selected' : '' ?>><?= e($c['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">প্রকাশনার স্ট্যাটাস</label>
                        <select name="status" class="form-control">
                            <option value="published" <?= ($news['status'] === 'published') ? 'selected' : '' ?>>প্রকাশিত (Published)</option>
                            <option value="draft" <?= ($news['status'] === 'draft') ? 'selected' : '' ?>>খসড়া (Draft)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">প্রতিবেদক / লেখকের নাম</label>
                        <input type="text" name="author_name" class="form-control" value="<?= e($news['author_name']) ?>">
                    </div>

                    <div class="form-group">
                        <label class="form-label">স্লাগ (URL)</label>
                        <input type="text" name="slug" id="newsSlugInput" class="form-control" value="<?= e($news['slug']) ?>">
                    </div>

                    <div style="background:#f8fafc;padding:12px;border-radius:6px;margin-bottom:18px;border:1px solid #e2e8f0;">
                        <label style="display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:8px;cursor:pointer;">
                            <input type="checkbox" name="is_featured" value="1" <?= $news['is_featured'] ? 'checked' : '' ?>>
                            <span><i class="fa-solid fa-star" style="color:#b45309;"></i> প্রধান লিড সংবাদ (Featured)</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;">
                            <input type="checkbox" name="is_breaking" value="1" <?= $news['is_breaking'] ? 'checked' : '' ?>>
                            <span><i class="fa-solid fa-bolt" style="color:#b91c1c;"></i> ব্রেকিং নিউজ (টিকার)</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:12px;font-size:16px;">
                        <i class="fa-solid fa-rotate"></i> পরিবর্তন সংরক্ষণ করুন
                    </button>
                </div>
            </div>

            <!-- Media / Featured Image -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3>সংবাদের ছবি</h3>
                </div>
                <div class="admin-card-body">
                    <div class="form-group">
                        <label class="form-label">ছবির অনলাইন লিংক (URL)</label>
                        <input type="url" name="featured_image" id="featuredImageInput" class="form-control" value="<?= e($news['featured_image']) ?>">
                    </div>

                    <div class="form-group">
                        <label class="form-label">নতুন ছবি আপলোড (ঐচ্ছিক)</label>
                        <input type="file" name="image_file" accept="image/*" class="form-control">
                    </div>

                    <div class="form-group">
                        <label class="form-label">ছবির ক্যাপশন</label>
                        <input type="text" name="image_caption" class="form-control" value="<?= e($news['image_caption']) ?>">
                    </div>

                    <!-- Current Image Preview -->
                    <img id="featuredImagePreview" src="<?= e($news['featured_image']) ?>" alt="প্রিভিউ" style="width:100%;height:150px;object-fit:cover;border-radius:6px;border:1px solid #cbd5e1;margin-top:10px;">
                </div>
            </div>
        </div>
    </div>
</form>

<?php require_once __DIR__ . '/footer.php'; ?>
