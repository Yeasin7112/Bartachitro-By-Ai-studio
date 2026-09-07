<?php
/**
 * BartaChitro (বার্তাচিত্র) - Add News (Quick Publish)
 */

$adminTitle = "নতুন সংবাদ প্রকাশ";
require_once __DIR__ . '/header.php';

$db = getDB();
$error = '';
$allCategories = getCategories();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $categoryId = (int)($_POST['category_id'] ?? 0);
        $title = trim($_POST['title'] ?? '');
        $slug = trim($_POST['slug'] ?? '');
        $summary = trim($_POST['summary'] ?? '');
        $content = trim($_POST['content'] ?? '');
        $authorName = trim($_POST['author_name'] ?? $adminUser['name']);
        $featuredImage = trim($_POST['featured_image'] ?? '');
        $imageCaption = trim($_POST['image_caption'] ?? '');
        $isFeatured = isset($_POST['is_featured']) ? 1 : 0;
        $isBreaking = isset($_POST['is_breaking']) ? 1 : 0;
        $status = $_POST['status'] ?? 'published';
        $seoTitle = trim($_POST['seo_title'] ?? '');
        $seoDescription = trim($_POST['seo_description'] ?? '');
        $seoKeywords = trim($_POST['seo_keywords'] ?? '');

        // Generate slug if empty
        if (empty($slug)) {
            $slug = generateSlug($title);
        }

        // Handle uploaded image file if provided
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

        // Fallback placeholder image if none provided
        if (empty($featuredImage)) {
            $featuredImage = 'https://picsum.photos/seed/' . time() . '/800/500';
        }

        if (empty($title) || empty($categoryId) || empty($content)) {
            $error = 'ক্যাটাগরি, শিরোনাম এবং সংবাদের মূল বিবরণ আবশ্যক।';
        } else {
            // Check slug uniqueness
            $checkStmt = $db->prepare("SELECT COUNT(*) FROM news WHERE slug = :slug");
            $checkStmt->execute([':slug' => $slug]);
            if ($checkStmt->fetchColumn() > 0) {
                $slug .= '-' . time();
            }

            try {
                $stmt = $db->prepare("INSERT INTO news (category_id, author_id, title, slug, summary, content, author_name, featured_image, image_caption, is_featured, is_breaking, status, seo_title, seo_description, seo_keywords, published_at) 
                                      VALUES (:category_id, :author_id, :title, :slug, :summary, :content, :author_name, :featured_image, :image_caption, :is_featured, :is_breaking, :status, :seo_title, :seo_description, :seo_keywords, NOW())");
                $stmt->execute([
                    ':category_id' => $categoryId,
                    ':author_id' => $adminUser['id'] ?? 1,
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
                    ':seo_keywords' => $seoKeywords
                ]);

                echo "<script>window.location.href = '" . BASE_URL . "/admin/news.php';</script>";
                exit;
            } catch (Exception $e) {
                $error = 'ডাটাবেজে সংরক্ষণ করতে ত্রুটি: ' . $e->getMessage();
            }
        }
    }
}
?>

<?php if (!empty($error)): ?>
    <div style="background:#fee2e2;border:1px solid #fecaca;color:#b91c1c;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-triangle-exclamation"></i> <?= e($error) ?>
    </div>
<?php endif; ?>

<form action="<?= BASE_URL ?>/admin/news-add.php" method="POST" enctype="multipart/form-data">
    <?= csrfField() ?>
    
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;align-items:flex-start;">
        <!-- Left Column: Main Editor -->
        <div class="admin-card">
            <div class="admin-card-header">
                <h3>সংবাদের মূল বিষয়বস্তু</h3>
            </div>
            <div class="admin-card-body">
                <div class="form-group">
                    <label class="form-label">শিরোনাম *</label>
                    <input type="text" name="title" id="newsTitleInput" required class="form-control" placeholder="আকর্ষণীয় ও বস্তুনিষ্ঠ শিরোনাম লিখুন..." style="font-size:18px;font-weight:600;">
                </div>

                <div class="form-group">
                    <label class="form-label">সংক্ষিপ্ত সারসংক্ষেপ (Summary)</label>
                    <textarea name="summary" rows="3" class="form-control" placeholder="সংবাদের ১-২ লাইনের সংক্ষিপ্ত ভূমিকা..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">সংবাদের পূর্ণাঙ্গ বিবরণ (Content) *</label>
                    <textarea name="content" rows="14" required class="form-control" placeholder="এখানে সম্পূর্ণ প্রতিবেদন বা সংবাদটি বিস্তারিত লিখুন (HTML ট্যাগ সমর্থিত)..." style="line-height:1.6;font-size:16px;"></textarea>
                </div>

                <!-- SEO Section -->
                <div style="border-top:1px solid #e2e8f0;padding-top:18px;margin-top:24px;">
                    <h4 style="font-size:15px;font-weight:700;margin-bottom:12px;color:#475569;">সার্চ ইঞ্জিন অপটিমাইজেশন (SEO)</h4>
                    <div class="form-group">
                        <label class="form-label">কাস্টম এসইও শিরোনাম (ঐচ্ছিক)</label>
                        <input type="text" name="seo_title" class="form-control" placeholder="গুগল সার্চ ফলাফলের শিরোনাম">
                    </div>
                    <div class="form-group">
                        <label class="form-label">এসইও মেটা বিবরণ (ঐচ্ছিক)</label>
                        <textarea name="seo_description" rows="2" class="form-control" placeholder="গুগল সার্চের জন্য মেটা ডেসক্রিপশন..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">কি-ওয়ার্ডস (কমা দিয়ে আলাদা করুন)</label>
                        <input type="text" name="seo_keywords" class="form-control" placeholder="বাংলাদেশ, সংবাদ, রাজনীতি, অর্থনীতি...">
                    </div>
                </div>
            </div>
        </div>

        <!-- Right Column: Settings & Publishing -->
        <div style="display:flex;flex-direction:column;gap:24px;">
            <!-- Publish Controls -->
            <div class="admin-card">
                <div class="admin-card-header">
                    <h3>প্রকাশনা কন্ট্রোল</h3>
                </div>
                <div class="admin-card-body">
                    <div class="form-group">
                        <label class="form-label">ক্যাটাগরি / বিভাগ *</label>
                        <select name="category_id" required class="form-control">
                            <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                            <?php foreach ($allCategories as $c): ?>
                                <option value="<?= $c['id'] ?>"><?= e($c['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">প্রকাশনার স্ট্যাটাস</label>
                        <select name="status" class="form-control">
                            <option value="published">সরাসরি প্রকাশ (Published)</option>
                            <option value="draft">খসড়া হিসেবে সংরক্ষণ (Draft)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">প্রতিবেদক / লেখকের নাম</label>
                        <input type="text" name="author_name" class="form-control" value="<?= e($adminUser['name']) ?>">
                    </div>

                    <div class="form-group">
                        <label class="form-label">কাস্টম স্লাগ (URL)</label>
                        <input type="text" name="slug" id="newsSlugInput" class="form-control" placeholder="স্বয়ংক্রিয় তৈরি হবে">
                    </div>

                    <!-- Highlight Flags -->
                    <div style="background:#f8fafc;padding:12px;border-radius:6px;margin-bottom:18px;border:1px solid #e2e8f0;">
                        <label style="display:flex;align-items:center;gap:8px;font-weight:600;margin-bottom:8px;cursor:pointer;">
                            <input type="checkbox" name="is_featured" value="1">
                            <span><i class="fa-solid fa-star" style="color:#b45309;"></i> প্রধান লিড সংবাদ (Featured)</span>
                        </label>
                        <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;">
                            <input type="checkbox" name="is_breaking" value="1">
                            <span><i class="fa-solid fa-bolt" style="color:#b91c1c;"></i> ব্রেকিং নিউজ (টিকার)</span>
                        </label>
                    </div>

                    <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:12px;font-size:16px;">
                        <i class="fa-solid fa-paper-plane"></i> সংবাদটি প্রকাশ করুন
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
                        <input type="url" name="featured_image" id="featuredImageInput" class="form-control" placeholder="https://...">
                    </div>

                    <div class="form-group">
                        <label class="form-label">অথবা কম্পিউটার থেকে আপলোড</label>
                        <input type="file" name="image_file" accept="image/*" class="form-control">
                    </div>

                    <div class="form-group">
                        <label class="form-label">ছবির ক্যাপশন</label>
                        <input type="text" name="image_caption" class="form-control" placeholder="ছবির সংক্ষিপ্ত ক্যাপশন বা আলোকচিত্রী">
                    </div>

                    <!-- Preview -->
                    <img id="featuredImagePreview" src="" alt="প্রিভিউ" style="display:none;width:100%;height:140px;object-fit:cover;border-radius:6px;border:1px solid #cbd5e1;margin-top:10px;">
                </div>
            </div>
        </div>
    </div>
</form>

<?php require_once __DIR__ . '/footer.php'; ?>
