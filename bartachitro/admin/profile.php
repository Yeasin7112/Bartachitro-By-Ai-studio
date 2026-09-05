<?php
/**
 * BartaChitro (বার্তাচিত্র) - Admin Profile & Password Change
 */

$adminTitle = "অ্যাডমিন প্রোফাইল ও সিকিউরিটি";
require_once __DIR__ . '/header.php';

$db = getDB();
$message = '';
$error = '';

$userId = $adminUser['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!verifyCsrfToken()) {
        $error = 'অবৈধ সিকিউরিটি টোকেন।';
    } else {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $newPassword = $_POST['new_password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';

        if (empty($name) || empty($email)) {
            $error = 'নাম এবং ইমেইল আবশ্যক।';
        } else {
            // Update profile
            $stmt = $db->prepare("UPDATE users SET name = :name, email = :email WHERE id = :id");
            $stmt->execute([':name' => $name, ':email' => $email, ':id' => $userId]);
            $_SESSION['admin_name'] = $name;
            $_SESSION['admin_email'] = $email;

            // Update password if entered
            if (!empty($newPassword)) {
                if (strlen($newPassword) < 6) {
                    $error = 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
                } elseif ($newPassword !== $confirmPassword) {
                    $error = 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না!';
                } else {
                    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
                    $pStmt = $db->prepare("UPDATE users SET password = :p WHERE id = :id");
                    $pStmt->execute([':p' => $hashed, ':id' => $userId]);
                    $message = 'প্রোফাইল এবং পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!';
                }
            } else {
                $message = 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!';
            }
        }
    }
}

// Fetch current user details
$currUser = $db->prepare("SELECT * FROM users WHERE id = :id");
$currUser->execute([':id' => $userId]);
$userData = $currUser->fetch() ?: $adminUser;
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

<div class="admin-card" style="max-width:650px;">
    <div class="admin-card-header">
        <h3><i class="fa-regular fa-circle-user"></i> প্রোফাইল সেটিংস</h3>
    </div>
    <div class="admin-card-body">
        <form action="<?= BASE_URL ?>/admin/profile.php" method="POST">
            <?= csrfField() ?>

            <div class="form-group">
                <label class="form-label">ইউজারনেম</label>
                <input type="text" class="form-control" value="<?= e($userData['username'] ?? 'admin') ?>" disabled style="background:#f1f5f9;">
            </div>

            <div class="form-group">
                <label class="form-label">পূর্ণ নাম *</label>
                <input type="text" name="name" required class="form-control" value="<?= e($userData['name'] ?? '') ?>">
            </div>

            <div class="form-group">
                <label class="form-label">ইমেইল ঠিকানা *</label>
                <input type="email" name="email" required class="form-control" value="<?= e($userData['email'] ?? '') ?>">
            </div>

            <div style="margin:24px 0 16px;border-top:1px solid #e2e8f0;padding-top:16px;">
                <h4 style="font-size:15px;font-weight:700;margin-bottom:6px;color:#0f172a;">পাসওয়ার্ড পরিবর্তন (ঐচ্ছিক)</h4>
                <p style="font-size:13px;color:#64748b;margin-bottom:14px;">পাসওয়ার্ড পরিবর্তন না করতে চাইলে নিচের ঘরগুলো খালি রাখুন।</p>

                <div class="form-group">
                    <label class="form-label">নতুন পাসওয়ার্ড</label>
                    <input type="password" name="new_password" class="form-control" placeholder="কমপক্ষে ৬ অক্ষর">
                </div>

                <div class="form-group">
                    <label class="form-label">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                    <input type="password" name="confirm_password" class="form-control" placeholder="একই পাসওয়ার্ড পুনরায় লিখুন">
                </div>
            </div>

            <button type="submit" class="btn-admin-primary" style="padding:10px 24px;font-size:15px;">
                <i class="fa-solid fa-check"></i> পরিবর্তন সংরক্ষণ করুন
            </button>
        </form>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
