<?php
/**
 * BartaChitro (বার্তাচিত্র) - Admin Login
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/functions.php';

if (isLoggedIn()) {
    header("Location: " . BASE_URL . "/admin/index.php");
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        $error = 'ইউজারনেম এবং পাসওয়ার্ড উভয়ই আবশ্যক।';
    } else {
        try {
            $db = getDB();
            $stmt = $db->prepare("SELECT * FROM users WHERE (username = :u OR email = :e) AND status = 'active' LIMIT 1");
            $stmt->execute([':u' => $username, ':e' => $username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Login Success
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_id'] = $user['id'];
                $_SESSION['admin_name'] = $user['name'];
                $_SESSION['admin_user'] = $user['username'];
                $_SESSION['admin_email'] = $user['email'];
                $_SESSION['admin_role'] = $user['role'];

                header("Location: " . BASE_URL . "/admin/index.php");
                exit;
            } elseif ($username === 'admin' && $password === 'admin123') {
                // Safety fallback for fresh local installations
                $_SESSION['admin_logged_in'] = true;
                $_SESSION['admin_id'] = 1;
                $_SESSION['admin_name'] = 'প্রধান সম্পাদক';
                $_SESSION['admin_user'] = 'admin';
                $_SESSION['admin_email'] = 'admin@bartachitro.com';
                $_SESSION['admin_role'] = 'admin';

                header("Location: " . BASE_URL . "/admin/index.php");
                exit;
            } else {
                $error = 'ভুল ইউজারনেম বা পাসওয়ার্ড!';
            }
        } catch (Exception $e) {
            $error = 'ডাটাবেজ সংযোগে সমস্যা। নিশ্চিত করুন ডাটাবেজ ইমপোর্ট করা হয়েছে।';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>অ্যাডমিন লগইন | বার্তাচিত্র</title>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Noto+Serif+Bengali:wght@700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/admin.css">
</head>
<body class="admin-body">
    <div class="admin-login-wrapper">
        <div class="admin-login-box">
            <div style="text-align:center;margin-bottom:28px;">
                <h1 style="font-family:'Noto Serif Bengali',serif;font-size:32px;color:#b91c1c;margin-bottom:4px;">বার্তাচিত্র</h1>
                <p style="color:#64748b;font-size:14px;font-weight:600;">অ্যাডমিন ও সম্পাদকীয় পোর্টাল</p>
            </div>

            <?php if (!empty($error)): ?>
                <div style="background:#fee2e2;border:1px solid #fecaca;color:#b91c1c;padding:12px;border-radius:6px;margin-bottom:20px;font-size:14px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> <?= e($error) ?>
                </div>
            <?php endif; ?>

            <form action="<?= BASE_URL ?>/admin/login.php" method="POST">
                <div class="form-group">
                    <label class="form-label"><i class="fa-regular fa-user"></i> ইউজারনেম বা ইমেইল</label>
                    <input type="text" name="username" class="form-control" required placeholder="admin" value="admin">
                </div>

                <div class="form-group">
                    <label class="form-label"><i class="fa-solid fa-key"></i> পাসওয়ার্ড</label>
                    <input type="password" name="password" class="form-control" required placeholder="••••••••" value="admin123">
                </div>

                <div style="margin-bottom:20px;font-size:13px;color:#64748b;">
                    ডিফল্ট ক্রেডেনশিয়াল: ইউজার: <code>admin</code> / পাসওয়ার্ড: <code>admin123</code>
                </div>

                <button type="submit" class="btn-admin-primary" style="width:100%;justify-content:center;padding:12px;font-size:16px;">
                    <i class="fa-solid fa-right-to-bracket"></i> লগইন করুন
                </button>
            </form>

            <div style="margin-top:24px;text-align:center;font-size:13px;color:#94a3b8;">
                <a href="<?= BASE_URL ?>/" style="color:#64748b;text-decoration:none;"><i class="fa-solid fa-arrow-left"></i> মূল ওয়েবসাইটে ফিরে যান</a>
            </div>
        </div>
    </div>
</body>
</html>
