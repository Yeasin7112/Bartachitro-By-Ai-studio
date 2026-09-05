<?php
/**
 * BartaChitro (বার্তাচিত্র) - Site Settings Management
 */

$adminTitle = "সাইট সেটিংস";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $fields = [
            'site_name', 'site_tagline', 'editor_name', 'executive_editor',
            'email', 'phone', 'address', 'facebook_url', 'twitter_url',
            'youtube_url', 'meta_description', 'meta_keywords'
        ];

        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                $val = trim($_POST[$field]);
                $stmt = $db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (:k, :v) 
                                      ON DUPLICATE KEY UPDATE setting_value = :v2");
                $stmt->execute([':k' => $field, ':v' => $val, ':v2' => $val]);
            }
        }
        $message = 'সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!';
    }
}

// Fetch all current settings
$settingsRows = $db->query("SELECT * FROM settings")->fetchAll();
$s = [];
foreach ($settingsRows as $row) {
    $s[$row['setting_key']] = $row['setting_value'];
}
?>

<?php if (!empty($message)): ?>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:12px 16px;border-radius:6px;margin-bottom:20px;">
        <i class="fa-solid fa-circle-check"></i> <?= e($message) ?>
    </div>
<?php endif; ?>

<div class="admin-card" style="max-width:850px;">
    <div class="admin-card-header">
        <h3><i class="fa-solid fa-sliders"></i> মূল পত্রিকা সেটিংস</h3>
    </div>
    <div class="admin-card-body">
        <form action="<?= BASE_URL ?>/admin/settings.php" method="POST">
            <?= csrfField() ?>

            <h4 style="font-size:16px;font-weight:700;margin-bottom:16px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;color:#b91c1c;">
                ব্র্যান্ড ও পরিচিতি
            </h4>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                <div class="form-group">
                    <label class="form-label">পত্রিকার নাম</label>
                    <input type="text" name="site_name" class="form-control" value="<?= e($s['site_name'] ?? 'বার্তাচিত্র') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">স্লোগান (Tagline)</label>
                    <input type="text" name="site_tagline" class="form-control" value="<?= e($s['site_tagline'] ?? 'সত্যের সংবাদ, সবার ভাষায়') ?>">
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                <div class="form-group">
                    <label class="form-label">প্রধান সম্পাদক</label>
                    <input type="text" name="editor_name" class="form-control" value="<?= e($s['editor_name'] ?? 'আহমেদ রফিক চৌধুরী') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">নির্বাহী সম্পাদক</label>
                    <input type="text" name="executive_editor" class="form-control" value="<?= e($s['executive_editor'] ?? 'শাহনেওয়াজ করিম') ?>">
                </div>
            </div>

            <h4 style="font-size:16px;font-weight:700;margin:24px 0 16px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;color:#b91c1c;">
                যোগাযোগ ও সম্পাদকীয় দপ্তর
            </h4>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
                <div class="form-group">
                    <label class="form-label">অফিসিয়াল ইমেইল</label>
                    <input type="email" name="email" class="form-control" value="<?= e($s['email'] ?? 'editor@bartachitro.com') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label">ফোন / হটলাইন</label>
                    <input type="text" name="phone" class="form-control" value="<?= e($s['phone'] ?? '+৮৮০ ২ ৯৮৭৬৫৪৩') ?>">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">কার্যালয়ের ঠিকানা</label>
                <textarea name="address" rows="2" class="form-control"><?= e($s['address'] ?? 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ') ?></textarea>
            </div>

            <h4 style="font-size:16px;font-weight:700;margin:24px 0 16px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;color:#b91c1c;">
                সোশ্যাল মিডিয়া পেজ লিংক
            </h4>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;">
                <div class="form-group">
                    <label class="form-label"><i class="fa-brands fa-facebook" style="color:#1877f2;"></i> ফেসবুক পেজ</label>
                    <input type="url" name="facebook_url" class="form-control" value="<?= e($s['facebook_url'] ?? 'https://facebook.com') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-brands fa-x-twitter"></i> এক্স / টুইটার</label>
                    <input type="url" name="twitter_url" class="form-control" value="<?= e($s['twitter_url'] ?? 'https://twitter.com') ?>">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-brands fa-youtube" style="color:#ff0000;"></i> ইউটিউব চ্যানেল</label>
                    <input type="url" name="youtube_url" class="form-control" value="<?= e($s['youtube_url'] ?? 'https://youtube.com') ?>">
                </div>
            </div>

            <h4 style="font-size:16px;font-weight:700;margin:24px 0 16px;border-bottom:1px solid #e2e8f0;padding-bottom:6px;color:#b91c1c;">
                ডিফল্ট এসইও মেটা ট্যাগ
            </h4>

            <div class="form-group">
                <label class="form-label">মেটা ডেসক্রিপশন</label>
                <textarea name="meta_description" rows="2" class="form-control"><?= e($s['meta_description'] ?? 'বার্তাচিত্র - বাংলাদেশের অন্যতম জনপ্রিয় বাংলা অনলাইন সংবাদপত্র ও ডিজিটাল ই-পত্রিকা।') ?></textarea>
            </div>

            <div class="form-group">
                <label class="form-label">মেটা কি-ওয়ার্ডস</label>
                <input type="text" name="meta_keywords" class="form-control" value="<?= e($s['meta_keywords'] ?? 'বার্তাচিত্র, বাংলা সংবাদ, বাংলাদেশ, ই-পত্রিকা, ব্রেকিং নিউজ') ?>">
            </div>

            <button type="submit" class="btn-admin-primary" style="padding:12px 28px;font-size:16px;margin-top:10px;">
                <i class="fa-solid fa-floppy-disk"></i> সেটিংস সংরক্ষণ করুন
            </button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
