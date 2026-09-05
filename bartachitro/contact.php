<?php
/**
 * BartaChitro (বার্তাচিত্র) - Contact Us Page
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/functions.php';

$db = getDB();
$successMsg = '';
$errorMsg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $errorMsg = 'অবৈধ সিকিউরিটি টোকেন। পৃষ্ঠাটি রিলোড করে আবার চেষ্টা করুন।';
    } else {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $subject = trim($_POST['subject'] ?? '');
        $message = trim($_POST['message'] ?? '');

        if (empty($name) || empty($email) || empty($subject) || empty($message)) {
            $errorMsg = 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errorMsg = 'একটি বৈধ ইমেইল ঠিকানা প্রদান করুন।';
        } else {
            try {
                $stmt = $db->prepare("INSERT INTO contact_messages (name, email, phone, subject, message) 
                                      VALUES (:name, :email, :phone, :subject, :message)");
                $stmt->execute([
                    ':name' => $name,
                    ':email' => $email,
                    ':phone' => $phone,
                    ':subject' => $subject,
                    ':message' => $message
                ]);
                $successMsg = 'আপনার বার্তাটি সফলভাবে বার্তাচিত্র কর্তৃপক্ষের কাছে পৌঁছানো হয়েছে। ধন্যবাদ!';
            } catch (Exception $e) {
                $errorMsg = 'বার্তা পাঠাতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
            }
        }
    }
}

$customTitle = "যোগাযোগ ও সম্পাদকীয় দপ্তর";
include __DIR__ . '/includes/header.php';
?>

<div class="container" style="max-width:1050px;margin-top:10px;margin-bottom:60px;">
    <div class="section-header-wrap">
        <h1 class="section-title">যোগাযোগ ও বার্তা পাঠান</h1>
    </div>

    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:36px;align-items:flex-start;">
        <!-- Contact Form -->
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:30px;box-shadow:var(--shadow-sm);">
            <h2 style="font-family:var(--font-display);font-size:22px;font-weight:700;margin-bottom:16px;">আমাদের বার্তা পাঠান</h2>

            <?php if (!empty($successMsg)): ?>
                <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;padding:14px;border-radius:6px;margin-bottom:20px;font-size:15px;">
                    <i class="fa-solid fa-circle-check"></i> <?= e($successMsg) ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($errorMsg)): ?>
                <div style="background:#fef2f2;border:1px solid #fecaca;color:#991b1b;padding:14px;border-radius:6px;margin-bottom:20px;font-size:15px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> <?= e($errorMsg) ?>
                </div>
            <?php endif; ?>

            <form action="<?= BASE_URL ?>/contact.php" method="POST" style="display:flex;flex-direction:column;gap:16px;">
                <?= csrfField() ?>
                <div>
                    <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px;">আপনার পূর্ণ নাম *</label>
                    <input type="text" name="name" required style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;font-family:var(--font-ui);">
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px;">ইমেইল ঠিকানা *</label>
                        <input type="email" name="email" required style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;font-family:var(--font-ui);">
                    </div>
                    <div>
                        <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px;">মোবাইল নম্বর</label>
                        <input type="text" name="phone" placeholder="০১৭১১-..." style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;font-family:var(--font-ui);">
                    </div>
                </div>

                <div>
                    <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px;">বিষয় *</label>
                    <input type="text" name="subject" required placeholder="সংবাদ, মতামত বা বিজ্ঞাপনের বিষয়" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;font-family:var(--font-ui);">
                </div>

                <div>
                    <label style="display:block;font-weight:600;font-size:14px;margin-bottom:6px;">বিস্তারিত বার্তা লিখুন *</label>
                    <textarea name="message" rows="5" required style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:15px;font-family:var(--font-ui);line-height:1.5;"></textarea>
                </div>

                <button type="submit" class="admin-badge-btn" style="padding:12px;font-size:16px;background:#b91c1c;border:none;cursor:pointer;justify-content:center;">
                    <i class="fa-regular fa-paper-plane"></i> বার্তা পাঠান
                </button>
            </form>
        </div>

        <!-- Corporate Address & Information -->
        <div style="display:flex;flex-direction:column;gap:24px;">
            <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;box-shadow:var(--shadow-sm);">
                <h3 style="font-family:var(--font-display);font-size:20px;font-weight:700;margin-bottom:14px;border-bottom:2px solid #b91c1c;padding-bottom:6px;">কেন্দ্রীয় কার্যালয়</h3>
                <address style="font-style:normal;font-size:15px;line-height:1.8;color:#374151;">
                    <p style="margin-bottom:8px;"><i class="fa-solid fa-location-dot" style="color:#b91c1c;width:20px;"></i> <?= e(getSetting('address', 'বার্তাচিত্র ভবন, ৪৪ কারওয়ান বাজার, ঢাকা-১২১৫, বাংলাদেশ')) ?></p>
                    <p style="margin-bottom:8px;"><i class="fa-solid fa-phone" style="color:#b91c1c;width:20px;"></i> <?= e(getSetting('phone', '+৮৮০ ২ ৯৮৭৬৫৪৩')) ?></p>
                    <p style="margin-bottom:8px;"><i class="fa-solid fa-envelope" style="color:#b91c1c;width:20px;"></i> <a href="mailto:<?= e(getSetting('email', 'editor@bartachitro.com')) ?>"><?= e(getSetting('email', 'editor@bartachitro.com')) ?></a></p>
                </address>
            </div>

            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:24px;">
                <h3 style="font-family:var(--font-display);font-size:18px;font-weight:700;color:#991b1b;margin-bottom:10px;">বিজ্ঞাপন বিভাগ</h3>
                <p style="font-size:14px;color:#4b5563;line-height:1.6;margin-bottom:12px;">
                    অনলাইন ও ই-পত্রিকায় বিজ্ঞাপন প্রকাশ ও স্পনসরশিপের জন্য যোগাযোগ করুন বিজ্ঞাপন বিভাগে।
                </p>
                <p style="font-size:14px;font-weight:600;color:#111827;">ইমেইল: ads@bartachitro.com</p>
                <p style="font-size:14px;font-weight:600;color:#111827;">হটলাইন: ০১৮০০-০০০০০০</p>
            </div>
        </div>
    </div>
</div>

<?php include __DIR__ . '/includes/footer.php'; ?>
